using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Reflection;
using System.Timers;
using System.Windows.Forms;
using bbv.Common.EventBroker;
using bbv.Common.EventBroker.Handlers;
using RossCarlson.Vatsim.Common;
using RossCarlson.Vatsim.Network;
using RossCarlson.Vatsim.vERAM.Core;
using RossCarlson.Vatsim.vERAM.Events;
using RossCarlson.Vatsim.vERAM.UI;
using RossCarlson.Vatsim.vERAM.UI.Controls;
using RossCarlson.Vatsim.Voice;

namespace RossCarlson.Vatsim.vERAM.UI.Forms
{
	public partial class VSCSForm : Form
	{
		private const int PROCESSING_INTERVAL = 40;

		[Obfuscation(Feature = "renaming", Exclude = true)]
		[EventPublication(EventTopics.PrimaryFrequencyChanged)]
		public event EventHandler<PrimaryFrequencyChangedEventArgs> PrimaryFrequencyChanged;

		[Obfuscation(Feature = "renaming", Exclude = true)]
		[EventPublication(EventTopics.VoiceUrlChanged)]
		public event EventHandler VoiceUrlChanged;

		[Obfuscation(Feature = "renaming", Exclude = true)]
		[EventPublication(EventTopics.ErrorNotification)]
		public event EventHandler<EventArgs<string>> ErrorNotification;

		[Obfuscation(Feature = "renaming", Exclude = true)]
		[EventPublication(EventTopics.ControllerMonitoringChanged)]
		public event EventHandler<EventArgs<Controller>> ControllerMonitoringChanged;

		private class LandLinePortInfo { public string IP { get; set; } public int Port { get; set; } }

		private bool mFormLoading = true;
		private readonly List<string> mOutgoingPendingMN;
		private readonly Dictionary<string, int> mIncomingOpenMN;
		private readonly Dictionary<string, int> mOutgoingOpenMN;
		private readonly List<string> mOutgoingPendingOV;
		private readonly Dictionary<string, int> mIncomingOpenOV;
		private readonly Dictionary<string, int> mOutgoingOpenOV;
		private readonly Dictionary<string, LandLinePortInfo> mIncomingPendingIC;
		private readonly List<string> mOutgoingPendingIC;
		private readonly Dictionary<string, int> mOpenIC;
		private readonly Dictionary<string, int> mHoldIC;
		private int mIndicatorPhase;
		private bool mFlashOn = false;
		private bool mWinkOn = false;
		private bool mFlutterOn = false;
		private bool mDragging = false;
		private Point mDragStart;
		private System.Timers.Timer mProcessingTimer;
		private readonly List<VSCSDAButton> mCAQueueButtons;
		private readonly IVeramConfig mConfig;
		private readonly IVoiceEngine mVoiceEngine;
		private readonly INetworkManager mNetworkManager;
		private readonly IFacilityManager mFacilityManager;
		private readonly ISessionManager mSessionManager;
		private readonly IControllerManager mControllerManager;
		private readonly ICommsManager mCommsManager;
		private readonly ISoundManager mSoundManager;
		private readonly IEventBroker mEventBroker;

		private ERAMFacility CurrentFacility { get { return mFacilityManager.CurrentFacility; } }

		public VSCSForm(
			IVeramConfig config,
			IVoiceEngine voiceEngine,
			INetworkManager networkManager,
			IFacilityManager facilityManager,
			ISessionManager sessionManager,
			IControllerManager controllerManager,
			ICommsManager commsManager,
			ISoundManager soundManager,
			IEventBroker eventBroker
		)
		{
			InitializeComponent();
			mConfig = config;
			mVoiceEngine = voiceEngine;
			mNetworkManager = networkManager;
			mFacilityManager = facilityManager;
			mSessionManager = sessionManager;
			mControllerManager = controllerManager;
			mCommsManager = commsManager;
			mSoundManager = soundManager;
			mEventBroker = eventBroker;
			mEventBroker.Register(this);

			// Set up maps to keep track of land lines.
			mOutgoingPendingMN = new List<string>();
			mIncomingOpenMN = new Dictionary<string, int>();
			mOutgoingOpenMN = new Dictionary<string, int>();
			mOutgoingPendingOV = new List<string>();
			mIncomingOpenOV = new Dictionary<string, int>();
			mOutgoingOpenOV = new Dictionary<string, int>();
			mIncomingPendingIC = new Dictionary<string, LandLinePortInfo>();
			mOutgoingPendingIC = new List<string>();
			mOpenIC = new Dictionary<string, int>();
			mHoldIC = new Dictionary<string, int>();
			mCAQueueButtons = new List<VSCSDAButton>() { btnCAQueue1, btnCAQueue2, btnCAQueue3, btnCAQueue4 };

			// Set size/locaion for A/G and G/G page panels.
			Point pagePanelLoc = new Point(0, 0);
			pnlAG1.Size = new Size(600, 320);
			pnlAG1.Location = pagePanelLoc;
			pnlAG2.Size = new Size(600, 320);
			pnlAG2.Location = pagePanelLoc;
			pnlGG1.Size = new Size(600, 240);
			pnlGG1.Location = pagePanelLoc;
			pnlGG2.Size = new Size(600, 240);
			pnlGG2.Location = pagePanelLoc;
			PopulatePanels();

			// Configure voice engine.
			try {
				mVoiceEngine.ConfigurePTT(mConfig.PTTConfiguration);
				SetAudioParameters();
			}
			catch (Exception ex) {
				ErrorNotification(this, new EventArgs<string>(ex.Message));
			}

			funcMenuMain.Reset();

			Location = mConfig.VSCSWindowProperties.Location;
			ScreenUtils.EnsureOnScreen(this);
		}

		[EventSubscription(EventTopics.SettingsModified, typeof(Publisher))]
		public void OnSettingsModified(object sender, EventArgs e)
		{
			mVoiceEngine.ConfigurePTT(mConfig.PTTConfiguration);
			SetAudioParameters();
		}

		[EventSubscription(EventTopics.Disconnected, typeof(Publisher))]
		public void OnDisconnected(object sender, EventArgs e)
		{
			LeaveAllVoiceChannels();
		}

		[EventSubscription(EventTopics.ControllerDeleted, typeof(Publisher))]
		public void OnControllerDeleted(object sender, EventArgs<Controller> e)
		{
			HandleControllerDeleted(e.Data);
		}

		[EventSubscription(EventTopics.RequestShowVscs, typeof(Publisher))]
		public void OnRequestShowVscs(object sender, EventArgs e)
		{
			Show();
		}

		[EventSubscription(EventTopics.LandLineCommandReceived, typeof(Publisher))]
		public void OnLandLineCommandReceived(object sender, LandLineCommandReceivedEventArgs e)
		{
			HandleLandLineCommand(e.Type, e.Command, e.From, e.Ip, e.Port);
		}

		private void VSCSForm_Shown(object sender, EventArgs e)
		{
			mFormLoading = false;
		}

		protected override bool ProcessDialogKey(Keys keyData)
		{
			if (keyData == Keys.Escape) {
				Hide();
				return true;
			}
			return base.ProcessDialogKey(keyData);
		}

		private void VSCSForm_Load(object sender, EventArgs e)
		{
			mIndicatorPhase = 0;
			mProcessingTimer = new System.Timers.Timer {
				Interval = PROCESSING_INTERVAL,
				SynchronizingObject = this
			};
			mProcessingTimer.Elapsed += new ElapsedEventHandler(ProcessingTimer_Elapsed);
			mProcessingTimer.Start();
		}

		private void ProcessingTimer_Elapsed(object sender, ElapsedEventArgs e)
		{
			mVoiceEngine.DoProcessing();
			CheckAGChannelStatus();
			UpdateIndicators();
		}

		private void UpdateIndicators()
		{
			// Step to the next indicator phase.
			mIndicatorPhase++;
			if (mIndicatorPhase > 20) {
				mIndicatorPhase = 1;
			}

			// Check if any indicator types are changing state this phase.
			bool updateFlash = false;
			if (mFlashOn != (mIndicatorPhase <= 10)) {
				updateFlash = true;
				mFlashOn = !mFlashOn;
			}
			bool updateWink = false;
			if (mWinkOn != (mIndicatorPhase <= 18)) {
				updateWink = true;
				mWinkOn = !mWinkOn;
			}
			bool updateFlutter = false;
			if (mFlutterOn != ((mIndicatorPhase % 2) != 0)) {
				updateFlutter = true;
				mFlutterOn = !mFlutterOn;
			}

			// Update any indicators that have changed.
			if (updateFlash || updateWink || updateFlutter) {
				if (updateFlutter) {
					foreach (VSCSFrequencySpec spec in CurrentFacility.VSCSFrequencySpecs.Where(s => (s.RadioPanelCtrl != null) && (s.RadioPanelCtrl.IndicatorState == VSCSIndicatorState.Flutter))) {
						spec.RadioPanelCtrl.UpdateIndicator(mFlutterOn);
					}
					funcMenuMain.UpdateIndicators(VSCSIndicatorState.Flutter, mFlutterOn);
				}
				if (updateFlash) {
					funcMenuMain.UpdateIndicators(VSCSIndicatorState.Flash, mFlashOn);
				}
				if (updateWink) {
					funcMenuMain.UpdateIndicators(VSCSIndicatorState.Wink, mWinkOn);
				}
				foreach (VSCSLandLineSpec spec in CurrentFacility.VSCSLandLineSpecs.Where(s => (s.DAButtonCtrl != null) && (s.DAButtonCtrl.IndicatorState != VSCSIndicatorState.Off) && (s.DAButtonCtrl.IndicatorState != VSCSIndicatorState.SolidOn))) {
					if (updateFlash && (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Flash)) {
						spec.DAButtonCtrl.UpdateIndicator(mFlashOn);
					} else if (updateWink && (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Wink)) {
						spec.DAButtonCtrl.UpdateIndicator(mWinkOn);
					} else if (updateFlutter && (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Flutter)) {
						spec.DAButtonCtrl.UpdateIndicator(mFlutterOn);
					}
				}
				foreach (VSCSDAButton btn in mCAQueueButtons.Where(b => b.Spec != null)) {
					if (updateFlash && (btn.IndicatorState == VSCSIndicatorState.Flash)) {
						btn.UpdateIndicator(mFlashOn);
					} else if (updateWink && (btn.IndicatorState == VSCSIndicatorState.Wink)) {
						btn.UpdateIndicator(mWinkOn);
					} else if (updateFlutter && (btn.IndicatorState == VSCSIndicatorState.Flutter)) {
						btn.UpdateIndicator(mFlutterOn);
					}
				}
			}
		}

		private void CheckAGChannelStatus()
		{
			foreach (VSCSFrequencySpec spec in CurrentFacility.VSCSFrequencySpecs.Where(s => s.RadioPanelCtrl != null)) {
				int channelID = spec.VoiceChannelID;
				if (channelID != 0) {
					AirToGroundChannelStatus status = mVoiceEngine.GetAirToGroundChannelStatus(channelID);
					spec.RadioPanelCtrl.SyncStatus(status);
				}
			}
		}

		private void HandleControllerDeleted(Controller controller)
		{
			if (mOutgoingPendingOV.Contains(controller.Callsign) || mIncomingOpenOV.ContainsKey(controller.Callsign) || mOutgoingOpenOV.ContainsKey(controller.Callsign)) {
				CloseLandLineConnection(LandLineType.Override, controller.Callsign, false);
			}
			if (mIncomingPendingIC.ContainsKey(controller.Callsign) || mOutgoingPendingIC.Contains(controller.Callsign) || mOpenIC.ContainsKey(controller.Callsign) || mHoldIC.ContainsKey(controller.Callsign)) {
				CloseLandLineConnection(LandLineType.Intercom, controller.Callsign, false);
			}
			if (mOutgoingPendingMN.Contains(controller.Callsign) || mIncomingOpenMN.ContainsKey(controller.Callsign) || mOutgoingOpenMN.ContainsKey(controller.Callsign)) {
				CloseLandLineConnection(LandLineType.Monitor, controller.Callsign, false);
			}
		}

		private void PopulatePanels()
		{
			// Populate the A/G panels.
			pnlAG1.Controls.Clear();
			pnlAG2.Controls.Clear();
			int row = 1;
			int col = 1;
			for (int i = 0; i < 24; i++) {
				Panel panel = (i < 12) ? pnlAG1 : pnlAG2;
				if (CurrentFacility.VSCSFrequencySpecs.Count <= i) {
					CurrentFacility.VSCSFrequencySpecs.Add(new VSCSFrequencySpec());
				}
				VSCSFrequencySpec spec = CurrentFacility.VSCSFrequencySpecs[i];
				VSCSRadioPanel pnl = new VSCSRadioPanel {
					Location = new Point((col - 1) * 204, (row - 1) * 80)
				};
				pnl.LoadFromSpec(spec);
				pnl.ConfigurationRequested += new EventHandler(VSCSRadioPanel_ConfigurationRequested);
				pnl.OutputChanged += new EventHandler(RadioPanel_OutputChanged);
				pnl.IsPrimaryChanged += new EventHandler(RadioPanel_IsPrimaryChanged);
				pnl.IsTransmitEnabledChanged += new EventHandler(RadioPanel_IsTransmitEnabledChanged);
				pnl.IsReceiveEnabledChanged += new EventHandler(RadioPanel_IsReceiveEnabledChanged);
				panel.Controls.Add(pnl);
				col++;
				if (col > 3) {
					col = 1;
					row++;
					if (row > 4) {
						row = 1;
					}
				}
			}

			// Populate the G/G panels.
			pnlGG1.Controls.Clear();
			pnlGG2.Controls.Clear();
			row = 1;
			col = 1;
			for (int i = 0; i < 54; i++) {
				Panel panel = (i < 27) ? pnlGG1 : pnlGG2;
				if (CurrentFacility.VSCSLandLineSpecs.Count <= i) {
					CurrentFacility.VSCSLandLineSpecs.Add(new VSCSLandLineSpec());
				}
				VSCSLandLineSpec spec = CurrentFacility.VSCSLandLineSpecs[i];
				VSCSDAButton btn = new VSCSDAButton {
					Location = new Point((col - 1) * 68, ((row - 1) * 80) + 12)
				};
				btn.LoadFromSpec(spec);
				btn.ConfigurationRequested += new EventHandler(VSCSDAButton_ConfigurationRequested);
				btn.MouseClick += new MouseEventHandler(VSCSDAButton_MouseClick);
				spec.DAButtonCtrl = btn;
				spec.Page = (i < 27) ? 1 : 2;
				panel.Controls.Add(btn);
				col++;
				if (col > 9) {
					col = 1;
					row++;
					if (row > 3) {
						row = 1;
					}
				}
			}

			// Default to A/G page 1.
			ShowPage(VSCSPage.AG1);
		}

		private void VSCSDAButton_MouseClick(object sender, EventArgs e)
		{
			if (!mVoiceEngine.UDPInitialized) {
				ShowError("Call Denied:\nUDP not initialized.");
				return;
			}
			VSCSLandLineSpec spec = (sender as VSCSDAButton).Spec;
			if (spec == null) {
				return;
			}

			switch (spec.LandLineType) {
				case VSCSLandLineType.Override:
					if (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Off) {
						InitiateOverride(spec);
					} else {
						CloseLandLineConnection(LandLineType.Override, spec.DAButtonCtrl.OnLandLineWith.Callsign, true);
						spec.DAButtonCtrl.IndicatorState = VSCSIndicatorState.Off;
						spec.DAButtonCtrl.OnLandLineWith = null;
					}
					break;
				case VSCSLandLineType.Intercom:
					if (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Off) {
						InitiateIntercom(spec);
					} else if (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Flash) {
						if (AcceptIntercomCall(spec.DAButtonCtrl.OnLandLineWith.Callsign)) {
							spec.DAButtonCtrl.SetPalette(VSCSColorPalette.BlackOnGreen);
							spec.DAButtonCtrl.IndicatorState = VSCSIndicatorState.Flutter;
						}
					} else if (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Wink) {
						UnholdLandLineCall(spec.DAButtonCtrl.OnLandLineWith.Callsign);
					} else if ((spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Flutter) || (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.SolidOn)) {
						ReleaseActiveIntercomCall();
						spec.DAButtonCtrl.IndicatorState = VSCSIndicatorState.Off;
						spec.DAButtonCtrl.OnLandLineWith = null;
					}
					break;
				case VSCSLandLineType.Monitor:
					if (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Off) {
						InitiateMonitor(spec);
					} else if (spec.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Flutter) {
						CloseLandLineConnection(LandLineType.Monitor, spec.DAButtonCtrl.OnLandLineWith.Callsign, true);
						spec.DAButtonCtrl.IndicatorState = VSCSIndicatorState.Off;
						spec.DAButtonCtrl.OnLandLineWith = null;
					}
					break;
			}
		}

		private void InitiateOverride(VSCSLandLineSpec spec)
		{
			if (!mNetworkManager.IsConnected) {
				ShowError("Call Denied:\nNot connected.");
				return;
			}
			if (!mSessionManager.IsValidATC) {
				ShowError("You must be an active controller to initiate land line calls.");
				return;
			}
			Controller controller = mControllerManager.FindMatchingController(spec.Prefix, spec.Suffix, spec.Frequency);
			if (controller == null) {
				ShowError("Call Denied:\nDestination OTS.");
				return;
			}
			if (!OpenLandLineConnection(LandLineType.Override, controller.Callsign, out string error)) {
				ShowError(error);
				return;
			}
			spec.DAButtonCtrl.IndicatorState = VSCSIndicatorState.Flutter;
			spec.DAButtonCtrl.SetPalette(VSCSColorPalette.BlackOnGreen);
			spec.DAButtonCtrl.OnLandLineWith = controller;
		}

		private void InitiateMonitor(VSCSLandLineSpec spec)
		{
			if (!mNetworkManager.IsConnected) {
				ShowError("Call Denied:\nNot connected.");
				return;
			}
			Controller controller = mControllerManager.FindMatchingController(spec.Prefix, spec.Suffix, spec.Frequency);
			if (controller == null) {
				ShowError("Call Denied:\nDestination OTS.");
				return;
			}
			if (!OpenLandLineConnection(LandLineType.Monitor, controller.Callsign, out string error)) {
				ShowError(error);
				return;
			}
			spec.DAButtonCtrl.IndicatorState = VSCSIndicatorState.Flutter;
			spec.DAButtonCtrl.SetPalette(VSCSColorPalette.BlackOnGreen);
			spec.DAButtonCtrl.OnLandLineWith = controller;
		}

		private void InitiateIntercom(VSCSLandLineSpec spec)
		{
			if (!mNetworkManager.IsConnected) {
				ShowError("Call Denied:\nNot connected.");
				return;
			}
			if (!mSessionManager.IsValidATC) {
				ShowError("You must be an active controller to initiate land line calls.");
				return;
			}
			Controller controller = mControllerManager.FindMatchingController(spec.Prefix, spec.Suffix, spec.Frequency);
			if (controller == null) {
				ShowError("Call Denied:\nDestination OTS.");
				return;
			}
			if (!OpenLandLineConnection(LandLineType.Intercom, controller.Callsign, out string error)) {
				ShowError(error);
				return;
			}
			spec.DAButtonCtrl.IndicatorState = VSCSIndicatorState.Flash;
			spec.DAButtonCtrl.AlternateBackgroundColor = VSCSColor.Green;
			spec.DAButtonCtrl.FlashBackground = true;
			spec.DAButtonCtrl.SetPalette(VSCSColorPalette.BlackOnWhite);
			spec.DAButtonCtrl.OnLandLineWith = controller;
			mSoundManager.PlayLooping(SoundEvent.Ringback);
		}

		private void BtnHold_Clicked(object sender, EventArgs e)
		{
			HoldLandLineCall();
		}

		private void BtnCallAnswer_Click(object sender, EventArgs e)
		{
			VSCSDAButton btn = mCAQueueButtons.FirstOrDefault(b => (b.Spec != null) && (b.IndicatorState == VSCSIndicatorState.Flash));
			if (btn != null) {
				VSCSDAButton_MouseClick(btn, EventArgs.Empty);
			} else {
				SoundError();
			}
		}

		private void VSCSDAButton_ConfigurationRequested(object sender, EventArgs e)
		{
			VSCSDAButton button = sender as VSCSDAButton;
			if (button.OnLandLineWith != null) {
				MessageBox.Show(this, "Cannot configure direct access buttons that are in use.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Exclamation, MessageBoxDefaultButton.Button1);
				return;
			}
			using (VSCSDAButtonConfigForm frm = new VSCSDAButtonConfigForm()) {
				frm.Populate(button.Spec);
				if (frm.ShowDialog(this) == DialogResult.OK) {
					VSCSLandLineSpec spec = frm.GetSpec();
					if (button.OnLandLineWith != null) {
						MessageBox.Show(this, "Could not reconfigure DA button because it is currently in use.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error, MessageBoxDefaultButton.Button1);
						return;
					}
					button.LoadFromSpec(spec);
					UpdateFacility();
				}
			}
		}

		private void VSCSRadioPanel_ConfigurationRequested(object sender, EventArgs e)
		{
			VSCSRadioPanel panel = (sender as VSCSRadioPanel);
			if (panel.IsReceiveEnabled) {
				MessageBox.Show(this, "Cannot configure radio frequencies that are in use.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Exclamation, MessageBoxDefaultButton.Button1);
				return;
			}
			using (VSCSRadioPanelConfigForm frm = new VSCSRadioPanelConfigForm()) {
				frm.Populate(panel.Spec);
				if (frm.ShowDialog(this) == DialogResult.OK) {
					VSCSFrequencySpec spec = frm.GetSpec();
					panel.LoadFromSpec(spec);
					UpdateFacility();
				}
			}
		}

		private void UpdateFacility()
		{
			CurrentFacility.VSCSLandLineSpecs.Clear();
			List<Panel> panels = new List<Panel>() { pnlGG1, pnlGG2 };
			foreach (Panel panel in panels) {
				foreach (Control ctrl in panel.Controls) {
					if (!(ctrl is VSCSDAButton)) {
						continue;
					}

					CurrentFacility.VSCSLandLineSpecs.Add((ctrl as VSCSDAButton).Spec);
				}
			}
			CurrentFacility.VSCSFrequencySpecs.Clear();
			panels = new List<Panel>() { pnlAG1, pnlAG2 };
			foreach (Panel panel in panels) {
				foreach (Control ctrl in panel.Controls) {
					if (!(ctrl is VSCSRadioPanel)) {
						continue;
					}

					CurrentFacility.VSCSFrequencySpecs.Add((ctrl as VSCSRadioPanel).Spec);
				}
			}
			mConfig.Save();
		}

		protected override void OnMouseDown(MouseEventArgs e)
		{
			mDragging = true;
			mDragStart = new Point(e.X, e.Y);
			base.OnMouseDown(e);
		}

		protected override void OnMouseUp(MouseEventArgs e)
		{
			mDragging = false;
			base.OnMouseUp(e);
		}

		protected override void OnMouseMove(MouseEventArgs e)
		{
			if (mDragging) {
				Point screenPoint = PointToScreen(new Point(e.X, e.Y));
				Location = new Point(screenPoint.X - mDragStart.X, screenPoint.Y - mDragStart.Y);
			}
			base.OnMouseMove(e);
		}

		protected override void OnPaint(PaintEventArgs e)
		{
			base.OnPaint(e);
			Rectangle rect = new Rectangle(ClientRectangle.Left, ClientRectangle.Top, ClientRectangle.Width - 1, 20);
			Rectangle rect2 = new Rectangle(ClientRectangle.Left, ClientRectangle.Top, ClientRectangle.Width - 1, ClientRectangle.Height - 1);
			using (Pen rectanglePen = new Pen(Color.FromArgb(140, 140, 140))) {
				using (Brush textBrush = new SolidBrush(ForeColor)) {
					e.Graphics.DrawRectangle(rectanglePen, rect);
					e.Graphics.DrawRectangle(rectanglePen, rect2);
					e.Graphics.DrawString("VSCS", Font, textBrush, 4, 4);
				}
			}
		}

		private void VSCSForm_Move(object sender, EventArgs e)
		{
			if (!mFormLoading) {
				ScreenUtils.SaveWindowProperties(mConfig.VSCSWindowProperties, this);
			}
		}

		private void VSCSForm_FormClosing(object sender, FormClosingEventArgs e)
		{
			if (e.CloseReason == CloseReason.UserClosing) {
				e.Cancel = true;
				return;
			}
		}

		private void VSCSForm_FormClosed(object sender, FormClosedEventArgs e)
		{
			mEventBroker.Unregister(this);
			mProcessingTimer.Stop();
		}

		private void SetAudioParameters()
		{
			// Get audio devices, set input and output devices from config.
			GetAudioDeviceNames(out string[] inputDevices, out string[] outputDevices);
			for (int i = 0; i < inputDevices.Length; i++) {
				if (inputDevices[i].Equals(mConfig.InputDeviceName)) {
					mVoiceEngine.SetInputDevice(i);
					break;
				}
			}
			for (int i = 0; i < outputDevices.Length; i++) {
				if (outputDevices[i].Equals(mConfig.HeadsetOutputDeviceName)) {
					mVoiceEngine.SetHeadsetOutputDevice(i);
				}
				if (outputDevices[i].Equals(mConfig.SpeakerOutputDeviceName)) {
					mVoiceEngine.SetSpeakerOutputDevice(i);
				}
			}

			// Set microphone squelch.
			mVoiceEngine.SetInputSquelch(mConfig.MicSquelch);

			// Enable VHF simulation as appropriate.
			mVoiceEngine.EnableVhfSimulation(mConfig.EnableVHFSimHeadset, mConfig.EnableVHFSimSpeakers);
		}

		public void GetAudioDeviceNames(out string[] inputDevices, out string[] outputDevices)
		{
			mVoiceEngine.GetAudioDeviceNames(out inputDevices, out outputDevices);
		}

		private void RadioPanel_IsReceiveEnabledChanged(object sender, EventArgs e)
		{
			List<int> freqs = new List<int>();
			foreach (VSCSFrequencySpec spec in CurrentFacility.VSCSFrequencySpecs.Where(s => s.RadioPanelCtrl != null)) {
				if (spec.RadioPanelCtrl.IsReceiveEnabled) {
					freqs.Add(spec.Frequency);
				}
			}
			mCommsManager.ReceiveFrequencies = freqs;
		}

		private void RadioPanel_IsTransmitEnabledChanged(object sender, EventArgs e)
		{
			List<int> freqs = new List<int>();
			foreach (VSCSFrequencySpec spec in CurrentFacility.VSCSFrequencySpecs.Where(s => s.RadioPanelCtrl != null)) {
				if (spec.RadioPanelCtrl.IsTransmitEnabled) {
					freqs.Add(spec.Frequency);
				}
			}
			mCommsManager.TransmitFrequencies = freqs;
		}

		private void RadioPanel_IsPrimaryChanged(object sender, EventArgs e)
		{
			VSCSRadioPanel senderPanel = sender as VSCSRadioPanel;
			if (senderPanel.IsPrimary) {
				foreach (VSCSFrequencySpec spec in CurrentFacility.VSCSFrequencySpecs.Where(s => s.RadioPanelCtrl != null)) {
					if (spec.RadioPanelCtrl != senderPanel) {
						spec.RadioPanelCtrl.IsPrimary = false;
					}
				}
			}
			VSCSFrequencySpec primarySpec = CurrentFacility.VSCSFrequencySpecs.FirstOrDefault(s => (s.RadioPanelCtrl != null) && s.RadioPanelCtrl.IsPrimary);
			int primaryFreq = (primarySpec != null) ? primarySpec.Frequency : CommsManager.DEFAULT_FREQUENCY;
			PrimaryFrequencyChanged(this, new PrimaryFrequencyChangedEventArgs(primaryFreq, string.Empty));
		}

		private void RadioPanel_OutputChanged(object sender, EventArgs e)
		{
			VSCSRadioPanel pnl = sender as VSCSRadioPanel;
			if (pnl.Output != AudioOutput.None) {
				if (!mNetworkManager.IsConnected) {
					pnl.Output = AudioOutput.None;
					ShowError("Not connected.");
				} else {
					if (!string.IsNullOrEmpty(pnl.Spec.VoiceServerAddress) && !string.IsNullOrEmpty(pnl.Spec.VoiceChannelName)) {
						if (pnl.Spec.VoiceChannelID != 0) {
							AirToGroundChannelStatus status = mVoiceEngine.GetAirToGroundChannelStatus(pnl.Spec.VoiceChannelID);
							if (!status.IsSet(AirToGroundChannelStatus.Connected)) {
								mVoiceEngine.JoinVoiceChannel(pnl.Spec.VoiceChannelID);
							}
							mVoiceEngine.SetVoiceChannelTransmitReceive(pnl.Spec.VoiceChannelID, pnl.IsTransmitEnabled, pnl.Output == AudioOutput.Headset, pnl.Output == AudioOutput.Speakers);
						} else {
							string voxCallsign = string.Format("{0} ({1})", mSessionManager.CurrentCallsign, mConfig.NetworkLogin);
							try {
								pnl.Spec.VoiceChannelID = mVoiceEngine.CreateVoiceChannel(pnl.Spec.VoiceServerAddress, 0, pnl.Spec.VoiceChannelName, voxCallsign);
							}
							catch (Exception ex) {
								ShowError(ex.Message);
								pnl.Output = AudioOutput.None;
								return;
							}
							if (pnl.Spec.VoiceChannelID == 0) {
								ShowError("Creating voice channel failed.");
								pnl.Output = AudioOutput.None;
							} else {
								mVoiceEngine.JoinVoiceChannel(pnl.Spec.VoiceChannelID);
								mVoiceEngine.SetVoiceChannelTransmitReceive(pnl.Spec.VoiceChannelID, pnl.IsTransmitEnabled, pnl.Output == AudioOutput.Headset, pnl.Output == AudioOutput.Speakers);
							}
						}
					} else {
						ShowError("No voice channel specified.");
						pnl.Output = AudioOutput.None;
					}
				}
			} else if (pnl.Spec.VoiceChannelID != 0) {
				AirToGroundChannelStatus status = mVoiceEngine.GetAirToGroundChannelStatus(pnl.Spec.VoiceChannelID);
				if (status.IsSet(AirToGroundChannelStatus.Connected)) {
					mVoiceEngine.LeaveVoiceChannel(pnl.Spec.VoiceChannelID);
					pnl.Spec.VoiceChannelID = 0;
				}
			}
			if (pnl.IsPrimary) {
				VoiceUrlChanged(this, EventArgs.Empty);
			}
		}

		private void LeaveAllVoiceChannels()
		{
			foreach (VSCSFrequencySpec spec in CurrentFacility.VSCSFrequencySpecs.Where(s => s.RadioPanelCtrl != null)) {
				int channelID = spec.VoiceChannelID;
				spec.RadioPanelCtrl.Output = AudioOutput.None;
				if (channelID != 0) {
					mVoiceEngine.LeaveVoiceChannel(channelID);
					spec.VoiceChannelID = 0;
				}
			}
			CloseAndPurgeAllLandLines();
		}

		private bool OpenLandLineConnection(LandLineType landLineType, string callsign, out string error)
		{
			// The rules:
			// We can only override one person at a time.
			// We can't override someone who is overriding us.
			// We can't monitor anyone monitoring us.
			// We can't call someone who we've put on hold.

			// Store the fact that we've requested a landline connection.
			error = "";
			switch (landLineType) {
				case LandLineType.Override:
					if ((mOutgoingPendingOV.Count != 0) || (mOutgoingOpenOV.Count != 0)) {
						error = "Can only override one position at a time.";
						return false;
					}
					if (mIncomingOpenOV.ContainsKey(callsign)) {
						error = "Can not override a position that is currently overriding this position.";
						return false;
					}
					mOutgoingPendingOV.Add(callsign);
					mNetworkManager.SendLandLineCommand(LandLineType.Override, LandLineCommand.Request, callsign);
					break;
				case LandLineType.Intercom:
					if (mHoldIC.ContainsKey(callsign)) {
						error = "Already on intercom call with selected position. (On hold.)";
						return false;
					}
					if ((mOpenIC.Count != 0) || (mOutgoingPendingIC.Count != 0)) {
						ReleaseActiveIntercomCall();
					}
					mOutgoingPendingIC.Add(callsign);
					mNetworkManager.SendLandLineCommand(LandLineType.Intercom, LandLineCommand.Request, callsign);
					break;
				case LandLineType.Monitor:
					if (mIncomingOpenMN.ContainsKey(callsign)) {
						error = "Cannot monitor a position that is currently monitoring this position.";
						return false;
					}
					mOutgoingPendingMN.Remove(callsign);
					mOutgoingPendingMN.Add(callsign);
					mNetworkManager.SendLandLineCommand(LandLineType.Monitor, LandLineCommand.Request, callsign);
					break;
			}
			CheckForActiveCall();
			return true;
		}

		private bool AcceptIntercomCall(string callsign)
		{
			// Make sure we have a record of the call.
			if (!mIncomingPendingIC.ContainsKey(callsign)) {
				return false;
			}

			// Only one call at a time, and not while calling.
			if ((mOpenIC.Count != 0) || (mOutgoingPendingIC.Count != 0)) {
				return false;
			}

			// Approve the request.
			mNetworkManager.SendLandLineCommand(LandLineType.Intercom, LandLineCommand.Approve, callsign);

			// Create the link.
			if (!mVoiceEngine.UDPInitialized) {
				return false;
			}

			int linkID = mVoiceEngine.CreateIntercomLink(mIncomingPendingIC[callsign].IP, mIncomingPendingIC[callsign].Port, callsign, mSessionManager.CurrentCallsign);
			mIncomingPendingIC.Remove(callsign);
			mOpenIC.Add(callsign, linkID);
			mSoundManager.StopLooping();

			// Update the function menu.
			UpdateIncomingCallIndications();

			// Update routing.
			CheckForActiveCall();
			return true;
		}

		private bool HoldLandLineCall()
		{
			// Cannot hold an override.
			if ((mOutgoingOpenOV.Count > 0) || (mOutgoingOpenOV.Count > 0)) {
				ShowError("HOLD Denied:\nOVR cannot be Placed\non Hold.");
				return false;
			}

			// If no open IC calls, nothing to do.
			if (mOpenIC.Count == 0) {
				SoundError();
				return false;
			}

			// Move the link over to the hold table.
			string callsign = mOpenIC.Keys.First();
			mHoldIC.Remove(callsign);
			mHoldIC.Add(callsign, mOpenIC[callsign]);
			mOpenIC.Remove(callsign);
			UpdateDAButtonState(callsign, LandLineType.Intercom, VSCSIndicatorState.Wink, VSCSColorPalette.BlackOnYellow);

			// Hold the call.
			mVoiceEngine.HoldLandLineCall(mHoldIC[callsign]);
			CheckForActiveCall();
			return true;
		}

		private bool UnholdLandLineCall(string callsign)
		{
			// There cannot be any calls in effect.
			if (mOpenIC.Count != 0) {
				return false;
			}

			if (mOutgoingPendingIC.Count != 0) {
				return false;
			}

			// There needs to actually be a call on hold with this caller.
			if (!mHoldIC.ContainsKey(callsign)) {
				return false;
			}

			// Move the link back to the open call table.
			mOpenIC.Add(callsign, mHoldIC[callsign]);
			mHoldIC.Remove(callsign);
			UpdateDAButtonState(callsign, LandLineType.Intercom, VSCSIndicatorState.Flutter, VSCSColorPalette.BlackOnGreen);

			// Unhold the call.
			mVoiceEngine.UnholdLandLineCall(mOpenIC[callsign]);
			CheckForActiveCall();
			return true;
		}

		private bool ReleaseActiveIntercomCall()
		{
			// Release any open intercom line.
			string[] callsigns = mOpenIC.Keys.ToArray();
			foreach (string callsign in callsigns) {
				if (CloseLandLineConnection(LandLineType.Intercom, callsign, true)) {
					return true;
				}
			}
			callsigns = mOutgoingPendingIC.ToArray();
			foreach (string callsign in callsigns) {
				if (CloseLandLineConnection(LandLineType.Intercom, callsign, true)) {
					return true;
				}
			}
			mSoundManager.StopLooping();
			CheckForActiveCall();
			return false;
		}

		private bool CloseLandLineConnection(LandLineType landLineType, string callsign, bool weInit)
		{
			int linkID = 0;
			VSCSDAButton btn;
			switch (landLineType) {
				case LandLineType.Override:
					if (mIncomingOpenOV.ContainsKey(callsign)) {
						linkID = mIncomingOpenOV[callsign];
					} else if (mOutgoingOpenOV.ContainsKey(callsign)) {
						linkID = mOutgoingOpenOV[callsign];
					} else {
						linkID = 0;
					}
					if (linkID != 0) {
						mVoiceEngine.CloseOverrideLink(linkID);
					}
					mIncomingOpenOV.Remove(callsign);
					mOutgoingOpenOV.Remove(callsign);
					mOutgoingPendingOV.Remove(callsign);
					btn = FindActiveDAButton(VSCSLandLineType.Override, callsign);
					if ((btn != null) && (btn.Spec != null)) {
						auxMessageArea.RemoveOverrider(btn.Spec.SectorID, btn.Spec.FacilityID);
					}
					break;
				case LandLineType.Intercom:
					if (mOpenIC.ContainsKey(callsign)) {
						linkID = mOpenIC[callsign];
					} else if (mHoldIC.ContainsKey(callsign)) {
						linkID = mHoldIC[callsign];
					} else {
						linkID = 0;
					}
					if (linkID != 0) {
						mVoiceEngine.CloseIntercomLink(linkID);
					}
					mOpenIC.Remove(callsign);
					mHoldIC.Remove(callsign);
					mIncomingPendingIC.Remove(callsign);
					mOutgoingPendingIC.Remove(callsign);
					break;
				case LandLineType.Monitor:
					if (mIncomingOpenMN.ContainsKey(callsign)) {
						linkID = mIncomingOpenMN[callsign];
					} else if (mOutgoingOpenMN.ContainsKey(callsign)) {
						linkID = mOutgoingOpenMN[callsign];
					} else {
						linkID = 0;
					}
					if (linkID != 0) {
						mVoiceEngine.CloseMonitorLink(linkID);
					}
					mIncomingOpenMN.Remove(callsign);
					mOutgoingOpenMN.Remove(callsign);
					mOutgoingPendingMN.Remove(callsign);
					btn = FindActiveDAButton(VSCSLandLineType.Monitor, callsign);
					if ((btn != null) && (btn.Spec != null)) {
						voiceMonitor.RemoveMonitor(btn.Spec.SectorID, btn.Spec.FacilityID);
					}
					break;
			}

			// Find any VSCS button matching the terminated call and turn off its indicator.
			UpdateDAButtonState(callsign, landLineType, VSCSIndicatorState.Off, VSCSColorPalette.BlackOnWhite);

			// Inform the other party that we're shutting down the link.
			if (weInit) {
				mNetworkManager.SendLandLineCommand(landLineType, LandLineCommand.End, callsign);
			}

			// Check if we have any active calls remaining. This will update the voice routing.
			CheckForActiveCall();

			// Update the function menu.
			UpdateIncomingCallIndications();

			return (linkID != 0);
		}

		private void UpdateDAButtonState(string callsign, LandLineType landLineType, VSCSIndicatorState indicatorState, VSCSColorPalette palette)
		{
			UpdateDAButtonState(callsign, (new VSCSLandLineType()).FromNetworkLandLineType(landLineType), indicatorState, palette);
		}

		private void UpdateDAButtonState(string callsign, VSCSLandLineType landLineType, VSCSIndicatorState indicatorState, VSCSColorPalette palette)
		{
			var buttons = from spec in CurrentFacility.VSCSLandLineSpecs
						  where spec.DAButtonCtrl != null
						  && spec.LandLineType == landLineType
						  && spec.DAButtonCtrl.OnLandLineWith != null
						  && spec.DAButtonCtrl.OnLandLineWith.Callsign.Equals(callsign)
						  select spec.DAButtonCtrl;
			bool isCAButton = false;
			if ((landLineType == VSCSLandLineType.Intercom) && (buttons.Count() == 0)) {
				buttons = from btn in mCAQueueButtons
						  where btn.Spec != null
						  && btn.OnLandLineWith != null
						  && btn.OnLandLineWith.Callsign.Equals(callsign)
						  select btn;
				if (buttons.Count() > 0) {
					isCAButton = true;
				}
			}
			foreach (var button in buttons) {
				if (indicatorState == VSCSIndicatorState.Off) {
					button.OnLandLineWith = null;
				}

				if ((isCAButton) && (indicatorState == VSCSIndicatorState.Off)) {
					button.SetPalette(VSCSColorPalette.BlackOnLightGray);
					button.Text = string.Empty;
					button.Spec = null;
				} else {
					button.SetPalette(palette);
				}
				button.IndicatorState = indicatorState;				
			}
		}

		public void CloseAndPurgeAllLandLines()
		{
			string[] callsigns = mIncomingOpenOV.Keys.ToArray();
			foreach (string callsign in callsigns) {
				CloseLandLineConnection(LandLineType.Override, callsign, true);
			}

			callsigns = mOutgoingOpenOV.Keys.ToArray();
			foreach (string callsign in callsigns) {
				CloseLandLineConnection(LandLineType.Override, callsign, true);
			}

			callsigns = mOpenIC.Keys.ToArray();
			foreach (string callsign in callsigns) {
				CloseLandLineConnection(LandLineType.Intercom, callsign, true);
			}

			callsigns = mHoldIC.Keys.ToArray();
			foreach (string callsign in callsigns) {
				CloseLandLineConnection(LandLineType.Intercom, callsign, true);
			}

			callsigns = mIncomingOpenMN.Keys.ToArray();
			foreach (string callsign in callsigns) {
				CloseLandLineConnection(LandLineType.Monitor, callsign, true);
			}

			callsigns = mOutgoingOpenMN.Keys.ToArray();
			foreach (string callsign in callsigns) {
				CloseLandLineConnection(LandLineType.Monitor, callsign, true);
			}

			mOutgoingPendingOV.Clear();
			mOutgoingPendingIC.Clear();
			mIncomingPendingIC.Clear();
			mOutgoingPendingMN.Clear();
			mVoiceEngine.HaveActiveCall = false;

			// Update the function menu.
			UpdateIncomingCallIndications();
		}

		private void CheckForActiveCall()
		{
			mVoiceEngine.HaveActiveCall = (mOutgoingOpenOV.Count != 0) || (mOpenIC.Count != 0);
			mVoiceEngine.SuspendMonitoring = (mIncomingOpenOV.Count != 0) || (mOpenIC.Count != 0) || mVoiceEngine.ForceSpeakerAG;
		}

		private void HandleLandLineCommand(LandLineType landLineType, LandLineCommand cmd, string from, string ip, int port)
		{
			int linkID;
			VSCSDAButton btn = null;
			Controller controller = mControllerManager.GetController(from);
			if (controller != null) {
				btn = FindMatchingDAButton(landLineType, from, controller.Frequency);
			}

			switch (landLineType) {
				case LandLineType.Override:
					switch (cmd) {
						case LandLineCommand.Request:

							// They want to override us. Make sure we know who they are, make sure
							// we have a matching DA button, and make sure UDP is initialized.
							if ((controller == null) || (btn == null) || !mVoiceEngine.UDPInitialized) {
								mNetworkManager.SendLandLineCommand(LandLineType.Override, LandLineCommand.Reject, from);
								break;
							}

							// Make sure we aren't overriding them.
							if (mOutgoingOpenOV.ContainsKey(from)) {
								mNetworkManager.SendLandLineCommand(LandLineType.Override, LandLineCommand.End, from);
							} else {
								mOutgoingPendingOV.Remove(from);
								mNetworkManager.SendLandLineCommand(LandLineType.Override, LandLineCommand.Approve, from);
								linkID = mVoiceEngine.CreateIncomingOverrideLink(ip, port, from, mSessionManager.CurrentCallsign);
								mIncomingOpenOV.Remove(from);
								mIncomingOpenOV.Add(from, linkID);
								btn.IndicatorState = VSCSIndicatorState.Flutter;
								btn.SetPalette(VSCSColorPalette.BlackOnGreen);
								btn.OnLandLineWith = controller;
								auxMessageArea.AddOverrider(btn.Spec.SectorID, btn.Spec.FacilityID);
								mSoundManager.Play(SoundEvent.Override);
							}
							break;
						case LandLineCommand.Approve:

							// They approve us overriding them. Make sure we actually made the request.
							if (!mOutgoingPendingOV.Contains(from) || (controller == null) || (btn == null) || !mVoiceEngine.UDPInitialized) {
								mNetworkManager.SendLandLineCommand(LandLineType.Override, LandLineCommand.End, from);
							} else {
								mOutgoingPendingOV.Remove(from);
								linkID = mVoiceEngine.CreateOutgoingOverrideLink(ip, port, from, mSessionManager.CurrentCallsign);
								mOutgoingOpenOV.Remove(from);
								mOutgoingOpenOV.Add(from, linkID);
								btn.IndicatorState = VSCSIndicatorState.Flutter;
								btn.SetPalette(VSCSColorPalette.BlackOnGreen);
								btn.OnLandLineWith = controller;
							}
							break;
						case LandLineCommand.Reject:
							mOutgoingPendingOV.Remove(from);
							UpdateDAButtonState(from, LandLineType.Override, VSCSIndicatorState.Off, VSCSColorPalette.BlackOnWhite);
							break;
						case LandLineCommand.End:
							CloseLandLineConnection(LandLineType.Override, from, false);
							break;
					}
					break;
				case LandLineType.Intercom:
					switch (cmd) {
						case LandLineCommand.Request:

							// They want an intercom call with us. Make sure we know who they are.
							mIncomingPendingIC.Remove(from);
							if (controller == null) {
								mNetworkManager.SendLandLineCommand(LandLineType.Intercom, LandLineCommand.Reject, from);
								break;
							}

							// If we don't have a DA button configured, check if there's room in the common answer queue.
							if (btn == null) {
								btn = mCAQueueButtons.FirstOrDefault(b => b.Spec == null);
								if (btn != null) {
									VSCSLandLineSpec spec = new VSCSLandLineSpec {
										DAButtonCtrl = btn,
										LandLineType = VSCSLandLineType.Intercom,
										Frequency = controller.Frequency
									};
									btn.Spec = spec;
									btn.Text = string.Format("\n {0}\n\n{1}{2}", controller.SectorID, controller.Callsign.Length > 7 ? "" : " ", controller.Callsign);
									btn.OnLandLineWith = controller;
								} else {
									mNetworkManager.SendLandLineCommand(LandLineType.Intercom, LandLineCommand.Reject, from);
									break;
								}
							}

							// Start flashing the button.
							mIncomingPendingIC.Add(from, new LandLinePortInfo() { IP = ip, Port = port });
							btn.IndicatorState = VSCSIndicatorState.Flash;
							btn.FlashBackground = false;
							btn.SetPalette(VSCSColorPalette.BlackOnAmber);
							btn.OnLandLineWith = controller;
							mSoundManager.PlayLooping(SoundEvent.GGChime);
							break;
						case LandLineCommand.Approve:

							// They have approved an intercom call. Make sure we requested it.
							if (!mOutgoingPendingIC.Contains(from) || (controller == null) || (btn == null) || !mVoiceEngine.UDPInitialized) {
								mNetworkManager.SendLandLineCommand(LandLineType.Intercom, LandLineCommand.End, from);
							} else {
								mOutgoingPendingIC.Remove(from);
								linkID = mVoiceEngine.CreateIntercomLink(ip, port, from, mSessionManager.CurrentCallsign);
								mOpenIC.Remove(from);
								mOpenIC.Add(from, linkID);
								btn.IndicatorState = VSCSIndicatorState.Flutter;
								btn.SetPalette(VSCSColorPalette.BlackOnGreen);
								btn.OnLandLineWith = controller;
								mSoundManager.StopLooping();
							}
							break;
						case LandLineCommand.Reject:
							mOutgoingPendingIC.Remove(from);
							UpdateDAButtonState(from, LandLineType.Intercom, VSCSIndicatorState.Off, VSCSColorPalette.BlackOnWhite);
							mSoundManager.StopLooping();
							break;
						case LandLineCommand.End:
							CloseLandLineConnection(LandLineType.Intercom, from, false);
							mSoundManager.StopLooping();
							break;
					}
					break;
				case LandLineType.Monitor:
					switch (cmd) {
						case LandLineCommand.Request:

							// They want to monitor us. Make sure we aren't monitoring them, and make sure UDP is initialized.
							if (mOutgoingOpenMN.ContainsKey(from) || !mVoiceEngine.UDPInitialized) {
								mNetworkManager.SendLandLineCommand(LandLineType.Monitor, LandLineCommand.End, from);
							} else {
								mOutgoingPendingMN.Remove(from);
								mNetworkManager.SendLandLineCommand(LandLineType.Monitor, LandLineCommand.Approve, from);
								linkID = mVoiceEngine.CreateIncomingMonitorLink(ip, port, from, mSessionManager.CurrentCallsign);
								mIncomingOpenMN.Remove(from);
								mIncomingOpenMN.Add(from, linkID);
								if (controller != null) {
									controller.IsMonitoringUs = true;
									ControllerMonitoringChanged(this, new EventArgs<Controller>(controller));
								}
							}
							break;
						case LandLineCommand.Approve:

							// They approve us monitoring them. Make sure we actually made the request.
							if (!mOutgoingPendingMN.Contains(from) || (controller == null) || (btn == null) || !mVoiceEngine.UDPInitialized) {
								mNetworkManager.SendLandLineCommand(LandLineType.Monitor, LandLineCommand.End, from);
							} else {
								mOutgoingPendingMN.Remove(from);
								linkID = mVoiceEngine.CreateOutgoingMonitorLink(ip, port, from, mSessionManager.CurrentCallsign);
								mOutgoingOpenMN.Remove(from);
								mOutgoingOpenMN.Add(from, linkID);
								btn.IndicatorState = VSCSIndicatorState.Flutter;
								btn.SetPalette(VSCSColorPalette.BlackOnGreen);
								btn.OnLandLineWith = controller;
								voiceMonitor.AddMonitor(btn.Spec.SectorID, btn.Spec.FacilityID);
							}
							break;
						case LandLineCommand.Reject:
							mOutgoingPendingMN.Remove(from);
							UpdateDAButtonState(from, LandLineType.Monitor, VSCSIndicatorState.Off, VSCSColorPalette.BlackOnWhite);
							break;
						case LandLineCommand.End:
							CloseLandLineConnection(LandLineType.Monitor, from, false);
							if (controller != null) {
								controller.IsMonitoringUs = false;
								ControllerMonitoringChanged(this, new EventArgs<Controller>(controller));
							}
							break;
					}
					break;
			}
			CheckForActiveCall();

			// Update the function menu.
			UpdateIncomingCallIndications();
		}

		private VSCSDAButton FindMatchingDAButton(LandLineType landLineType, string callsign, int frequency)
		{
			return FindMatchingDAButton((new VSCSLandLineType()).FromNetworkLandLineType(landLineType), callsign, frequency);
		}

		private VSCSDAButton FindMatchingDAButton(VSCSLandLineType landLineType, string callsign, int frequency)
		{
			return (from spec in CurrentFacility.VSCSLandLineSpecs
					where spec.LandLineType == landLineType
					&& spec.Frequency == frequency
					&& callsign.StartsWith(spec.Prefix)
					&& callsign.EndsWith(spec.Suffix)
					select spec.DAButtonCtrl).FirstOrDefault();
		}

		private VSCSDAButton FindActiveDAButton(VSCSLandLineType landLineType, string callsign)
		{
			return (from spec in CurrentFacility.VSCSLandLineSpecs
					where spec.LandLineType == landLineType
					&& (spec.DAButtonCtrl != null)
					&& (spec.DAButtonCtrl.OnLandLineWith != null)
					&& spec.DAButtonCtrl.OnLandLineWith.Callsign == callsign
					select spec.DAButtonCtrl).FirstOrDefault();
		}

		private void FuncMenuMain_PageChanged(object sender, VSCSPageChangedEventArgs e)
		{
			ShowPage(e.NewPage);
		}

		private void FuncMenuMain_MenuChanged(object sender, VSCSMenuChangedEventArgs e)
		{
			switch (e.NewMenu) {
				case VSCSMenu.AGPrimary:
				case VSCSMenu.GGPrimary:
					lblMenu.Text = " PRI";
					break;
				case VSCSMenu.AGAlternate:
				case VSCSMenu.GGAlternate:
					lblMenu.Text = " ALT";
					break;
			}
		}

		private void ShowPage(VSCSPage page)
		{
			switch (page) {
				case VSCSPage.AG1:
					ShowHidePagePanels(pnlAG1);
					pnlPTTButtons.Show();
					pnlCAQueue.Hide();
					pnlGGMisc.Hide();
					lblPage.Text = " A/G 1";
					break;
				case VSCSPage.AG2:
					ShowHidePagePanels(pnlAG2);
					pnlPTTButtons.Show();
					pnlCAQueue.Hide();
					pnlGGMisc.Hide();
					lblPage.Text = " A/G 2";
					break;
				case VSCSPage.GG1:
					ShowHidePagePanels(pnlGG1);
					pnlPTTButtons.Hide();
					pnlCAQueue.Show();
					pnlGGMisc.Show();
					lblPage.Text = " G/G 1";
					break;
				case VSCSPage.GG2:
					ShowHidePagePanels(pnlGG2);
					pnlPTTButtons.Hide();
					pnlCAQueue.Show();
					pnlGGMisc.Show();
					lblPage.Text = " G/G 2";
					break;
			}
		}

		private void ShowHidePagePanels(Panel leaveVisible)
		{
			pnlAG1.Visible = leaveVisible == pnlAG1;
			pnlAG2.Visible = leaveVisible == pnlAG2;
			pnlGG1.Visible = leaveVisible == pnlGG1;
			pnlGG2.Visible = leaveVisible == pnlGG2;
		}

		private void FuncMenuMain_ReleaseButtonPressed(object sender, EventArgs e)
		{
			if ((mOpenIC.Count == 0) && (mOutgoingPendingIC.Count == 0)) {
				SoundError();
			} else {
				ReleaseActiveIntercomCall();
			}
		}

		private void FuncMenuMain_AutoVoiceRouteButtonPressed(object sender, EventArgs e)
		{
			mVoiceEngine.AutoRouteRadio = !mVoiceEngine.AutoRouteRadio;
			(sender as VSCSButton).SetPalette(mVoiceEngine.AutoRouteRadio ? VSCSColorPalette.BlackOnGreen : VSCSColorPalette.BlackOnCyan);
		}

		private void FuncMenuMain_NonOverrideOutputButtonPressed(object sender, EventArgs e)
		{
			mVoiceEngine.ForceSpeakerIC = !mVoiceEngine.ForceSpeakerIC;
			mVoiceEngine.ForceSpeakerMN = mVoiceEngine.ForceSpeakerIC;
			(sender as VSCSOutputSelector).Output = mVoiceEngine.ForceSpeakerIC ? AudioOutput.Speakers : AudioOutput.Headset;
		}

		private void FuncMenuMain_OverrideOutputButtonPressed(object sender, EventArgs e)
		{
			mVoiceEngine.ForceSpeakerOV = !mVoiceEngine.ForceSpeakerOV;
			(sender as VSCSOutputSelector).Output = mVoiceEngine.ForceSpeakerOV ? AudioOutput.Speakers : AudioOutput.Headset;
		}

		private void AuxMessageArea_Click(object sender, EventArgs e)
		{
			mVoiceEngine.ForceSpeakerAG = !mVoiceEngine.ForceSpeakerAG;
			lblRTStatus.Text = mVoiceEngine.ForceSpeakerAG ? "    R/T ON" : "    R/T OFF";
			lblRTStatus.BracketThickness = mVoiceEngine.ForceSpeakerAG ? 4 : 2;
		}

		private void UpdateIncomingCallIndications()
		{
			bool page1 = false;
			bool page2 = false;
			bool caQueue = false;
			if (mIncomingPendingIC.Count > 0) {
				foreach (VSCSLandLineSpec spec in CurrentFacility.VSCSLandLineSpecs.Where(s => (s.DAButtonCtrl != null) && (s.LandLineType == VSCSLandLineType.Intercom) && (s.DAButtonCtrl.IndicatorState == VSCSIndicatorState.Flash))) {
					switch (spec.Page) {
						case 1:
							page1 = true;
							break;
						case 2:
							page2 = true;
							break;
					}
				}
				caQueue = mCAQueueButtons.Any(b => (b.Spec != null) && (b.IndicatorState == VSCSIndicatorState.Flash));
			}
			funcMenuMain.UpdateIncomingCallIndications(page1, page2, caQueue);
		}

		private void SoundError()
		{
			mSoundManager.Play(SoundEvent.Error);
		}

		private void ShowError(string error)
		{
			messageArea.Error = error;
			SoundError();
		}
	}
}
