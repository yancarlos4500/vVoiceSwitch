using System;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using RossCarlson.Vatsim.vERAM.Core;
using RossCarlson.Vatsim.Voice;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSRadioPanel : UserControl
	{
		[DllImport("user32.dll")]
		static extern ushort GetAsyncKeyState(int vKey);

		public event EventHandler IsPrimaryChanged;
		public event EventHandler IsTransmitEnabledChanged;
		public event EventHandler IsReceiveEnabledChanged;
		public event EventHandler OutputChanged;
		public event EventHandler ConfigurationRequested;

		private int mFrequency = 0;
		private bool mIsPrimary = false;
		private bool mIsReceiveEnabled = false;
		private bool mIsTransmitEnabled = false;
		private AirToGroundChannelStatus mLastStatus = AirToGroundChannelStatus.Off;

		public int Frequency
		{
			get { return mFrequency; }
			set { mFrequency = value; lblFreq.Text = string.Format("        {0}", FormatFrequency(mFrequency)); Invalidate(); }
		}

		public bool IsPrimary
		{
			get { return mIsPrimary; }
			set { mIsPrimary = value; btnOutputSelect.Text = mIsPrimary ? " PRI" : ""; }
		}

		public bool IsReceiveEnabled
		{
			get { return mIsReceiveEnabled; }
			set {
				bool prevValue = mIsReceiveEnabled;
				mIsReceiveEnabled = value;
				lblFreq.Visible = mIsReceiveEnabled;
				btnTX.Visible = mIsReceiveEnabled;
				btnOutputSelect.Visible = mIsReceiveEnabled;
				btnRX.Visible = mIsReceiveEnabled;
				if ((prevValue != mIsReceiveEnabled) && (IsReceiveEnabledChanged != null)) {
					IsReceiveEnabledChanged(this, EventArgs.Empty);
				}
				Invalidate();
			}
		}

		public bool IsTransmitEnabled
		{
			get { return mIsTransmitEnabled; }
			set
			{
				bool prevValue = mIsTransmitEnabled;
				mIsTransmitEnabled = value;
				btnTX.SetPalette(IsTransmitEnabled ? VSCSColorPalette.BlackOnGreen : VSCSColorPalette.WhiteOnBlack);
				btnTX.Text = mIsTransmitEnabled ? " XMTR\n ON" : " XMTR\n OFF";
				if ((prevValue != mIsTransmitEnabled) && (IsTransmitEnabledChanged != null)) {
					IsTransmitEnabledChanged(this, EventArgs.Empty);
				}
			}
		}

		public VSCSIndicatorState IndicatorState
		{
			get { return btnRX.IndicatorState; }
			set { btnRX.IndicatorState = value; }
		}

		public AudioOutput Output
		{
			get { return btnOutputSelect.Output; }
			set {
				btnOutputSelect.Output = value;
				btnOutputSelect.SetPalette(btnOutputSelect.Output == AudioOutput.None ? VSCSColorPalette.WhiteOnBlack : VSCSColorPalette.BlackOnGreen);
			}
		}

		public VSCSFrequencySpec Spec { get; set; }

		public VSCSRadioPanel()
		{
			InitializeComponent();
			SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
			VSCSDesign.ApplyPalette(VSCSColorPalette.BlackOnLightGray, this);
			btnRX.SetPalette(VSCSColorPalette.BlackOnGreen);
			btnOutputSelect.SetPalette(VSCSColorPalette.BlackOnGreen);
			btnTX.SetPalette(VSCSColorPalette.WhiteOnBlack);
		}

		private void RaiseOutputChanged()
		{
			OutputChanged?.Invoke(this, EventArgs.Empty);
		}

		private void RaiseConfigurationRequested()
		{
			ConfigurationRequested?.Invoke(this, EventArgs.Empty);
		}

		private void RaiseIsPrimaryChanged()
		{
			IsPrimaryChanged?.Invoke(this, EventArgs.Empty);
		}

		private string FormatFrequency(int freq)
		{
			return (((double)freq / 1000.0) + 100.0).ToString("0.000");
		}

		public void SyncStatus(AirToGroundChannelStatus status)
		{
			if (status != mLastStatus) {
				if (status == AirToGroundChannelStatus.Off) {
					Output = AudioOutput.None;
					btnRX.IndicatorState = VSCSIndicatorState.Off;
					btnTX.SetPalette(IsTransmitEnabled ? VSCSColorPalette.BlackOnGreen : VSCSColorPalette.WhiteOnBlack);
					btnRX.SetPalette(VSCSColorPalette.BlackOnGreen);
				} else {
					if (status.IsSet(AirToGroundChannelStatus.Transmitting)) {
						btnTX.SetPalette(VSCSColorPalette.BlackOnAmber);
					} else {
						btnTX.SetPalette(IsTransmitEnabled ? VSCSColorPalette.BlackOnGreen : VSCSColorPalette.WhiteOnBlack);
					}
					if (status.IsSet(AirToGroundChannelStatus.Receiving)) {
						btnRX.SetPalette(VSCSColorPalette.BlackOnAmber);
						btnRX.IndicatorState = VSCSIndicatorState.Flutter;
					} else {
						btnRX.SetPalette(VSCSColorPalette.BlackOnGreen);
						btnRX.IndicatorState = VSCSIndicatorState.Off;
					}
				}
				mLastStatus = status;
			}
		}

		protected override void OnPaint(PaintEventArgs e)
		{
			if (!IsReceiveEnabled) {
				using (Brush bgBrush = new SolidBrush(VSCSDesign.GetColor(VSCSColor.DarkGray))) {
					e.Graphics.FillRectangle(bgBrush, ClientRectangle);
				}
				Rectangle buttonRect = new Rectangle(0, 12, ClientSize.Width, ClientSize.Height - 12);
				using (Brush bgBrush = new SolidBrush(VSCSDesign.GetColor((mFrequency > 0) ? VSCSColor.White : VSCSColor.LightGray))) {
					e.Graphics.FillRectangle(bgBrush, buttonRect);
				}
				Rectangle borderRect = buttonRect;
				borderRect.Inflate(-5, -5);
				using (Pen borderPen = new Pen(VSCSDesign.GetColor((mFrequency > 0) ? VSCSColor.LightGray : VSCSColor.DarkGray), 2.0f)) {
					e.Graphics.DrawRectangle(borderPen, borderRect);
				}
				if (mFrequency > 0) {
					using (Brush textBrush = new SolidBrush(VSCSDesign.GetColor(VSCSColor.Black))) {
						using (StringFormat fmt = new StringFormat()) {
							fmt.Alignment = StringAlignment.Center;
							fmt.LineAlignment = StringAlignment.Center;
							e.Graphics.DrawString(string.Format("{0}\n{1}", Text, FormatFrequency(mFrequency)), Font, textBrush, buttonRect, fmt);
						}
					}
				}
			}
		}

		private void BtnTX_MouseClick(object sender, MouseEventArgs e)
		{
			if (e.Button == MouseButtons.Right) {
				TogglePrimary();
				return;
			}
			if (e.Button != MouseButtons.Left) {
				return;
			}

			IsTransmitEnabled = !IsTransmitEnabled;
			if (IsTransmitEnabled) {
				IsReceiveEnabled = true;
			} else if (IsPrimary) {
				IsPrimary = false;
				RaiseIsPrimaryChanged();
			}
			RaiseOutputChanged();
		}

		private void BtnOutputSelect_MouseClick(object sender, MouseEventArgs e)
		{
			if (e.Button == MouseButtons.Right) {
				TogglePrimary();
				return;
			}
			if (e.Button != MouseButtons.Left) {
				return;
			}

			if (0 != (GetAsyncKeyState((int)Keys.ControlKey) & 0x8000)) {
				Output = AudioOutput.None;
			} else {
				switch (Output) {
					case AudioOutput.Speakers:
					case AudioOutput.None:
						Output = AudioOutput.Headset;
						IsReceiveEnabled = true;
						break;
					case AudioOutput.Headset:
						Output = AudioOutput.Speakers;
						IsReceiveEnabled = true;
						break;
				}
			}
			RaiseOutputChanged();
		}

		private void BtnRX_MouseClick(object sender, MouseEventArgs e)
		{
			if (e.Button == MouseButtons.Right) {
				TogglePrimary();
				return;
			}
			if (e.Button != MouseButtons.Left) {
				return;
			}

			IsReceiveEnabled = !IsReceiveEnabled;
			if (!IsReceiveEnabled) {
				if (IsPrimary) {
					IsPrimary = false;
					RaiseIsPrimaryChanged();
				}
				IsTransmitEnabled = false;
				Output = AudioOutput.None;
				RaiseOutputChanged();
			}
		}

		private void TogglePrimary()
		{
			// Doing this first because if we set primary to true first, then toggle the tx/rx on,
			// it will cause two NEWINFO packets to be sent.
			if (!IsPrimary && (!IsReceiveEnabled || !IsTransmitEnabled)) {
				IsReceiveEnabled = true;
				IsTransmitEnabled = true;
				RaiseOutputChanged();
			}
			IsPrimary = !IsPrimary;
			btnOutputSelect.Text = IsPrimary ? " PRI" : "";
			RaiseIsPrimaryChanged();
		}

		public void LoadFromSpec(VSCSFrequencySpec spec)
		{
			Text = spec.Label;
			Frequency = spec.Frequency;
			IsPrimary = false;
			IsReceiveEnabled = false;
			IsTransmitEnabled = false;
			Output = AudioOutput.None;
			Spec = spec;
			spec.RadioPanelCtrl = this;
		}

		protected override void OnMouseClick(MouseEventArgs e)
		{
			if (IsReceiveEnabled) {
				return;
			}

			if (e.Button == MouseButtons.Right) { RaiseConfigurationRequested(); return; }
			if (Frequency == 0) {
				return;
			}

			IsReceiveEnabled = true;
		}

		public void UpdateIndicator(bool on)
		{
			btnRX.UpdateIndicator(on);
		}
	}
}
