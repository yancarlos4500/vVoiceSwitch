using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSFunctionMenu : Panel
	{
		private const int BUTTON_SPACING = 12;

		public event EventHandler<VSCSPageChangedEventArgs> PageChanged;
		public event EventHandler<VSCSMenuChangedEventArgs> MenuChanged;
		public event EventHandler ReleaseButtonPressed;
		public event EventHandler AutoVoiceRouteButtonPressed;
		public event EventHandler NonOverrideOutputButtonPressed;
		public event EventHandler OverrideOutputButtonPressed;

		private readonly List<VSCSButton> mButtons = new List<VSCSButton>();
		private VSCSPage mCurrentPage;
		private VSCSMenu mCurrentMenu;
		private VSCSMenu mPreviousMenu;
		private bool mGGPage1IncomingCall;
		private bool mGGPage2IncomingCall;
		private bool mCAQueueIncomingCall;

		public VSCSFunctionMenu()
		{
			InitializeComponent();
			SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);

			// Build each button.
			mButtons = new List<VSCSButton>() {
				new VSCSButton(VSCSButtonFunction.ShowScreenMenu, "\n SCRN\n ALT", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.AirToGroundPage1, "\n A/G\n  1", VSCSColorPalette.WhiteOnViolet),
				new VSCSButton(VSCSButtonFunction.AirToGroundPage2, "\n A/G\n  2", VSCSColorPalette.WhiteOnViolet),
				new VSCSButton(VSCSButtonFunction.AirToGroundStatus, "\n A/G\nSTATUS", VSCSColorPalette.WhiteOnViolet),
				new VSCSButton(VSCSButtonFunction.GroundToGroundPage1, "\n G/G\n  1", VSCSColorPalette.WhiteOnViolet),
				new VSCSButton(VSCSButtonFunction.GroundToGroundPage2, "\n G/G\n  2", VSCSColorPalette.WhiteOnViolet),
				new VSCSButton(VSCSButtonFunction.Utility, "\n UTIL", VSCSColorPalette.WhiteOnViolet),
				new VSCSButton(VSCSButtonFunction.ToggleFunctionMenu, "\n FUNC\n ALT", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.ToggleAirToGroundPage, "\n A/G\n ALT", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.AutoVoiceRoute, "\n AUTO\n VOICE\n ROUTE", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.MainStandby, "\n MAIN\n STBY", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.BUEC, "\n BUEC", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.CrossCouple, "\n XCPL", VSCSColorPalette.BlackOnLightGray),
				new VSCSButton(VSCSButtonFunction.RemoteMute, "\n REM\n MUTE", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.FTSMonitor, "\n FTS\n MON", VSCSColorPalette.BlackOnLightGray),
				new VSCSButton(VSCSButtonFunction.DiversityAlgorithm, "\n DIV\n ALGO", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.Test, "\n TEST", VSCSColorPalette.BlackOnLightGray),
				new VSCSButton(VSCSButtonFunction.ToggleGroundToGroundPage, "\n G/G\n ALT", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.PositionRelief, "\n PSN\n REL", VSCSColorPalette.BlackOnCyan),
				new VSCSOutputSelector(VSCSButtonFunction.ToggleNonOverrideOutput, "\n G/G", VSCSColorPalette.BlackOnCyan) { Output = Voice.AudioOutput.Headset },
				new VSCSOutputSelector(VSCSButtonFunction.ToggleOverrideOutput, "\n OVR", VSCSColorPalette.BlackOnCyan) { Output = Voice.AudioOutput.Headset },
				new VSCSButton(VSCSButtonFunction.CallForward, "\n CALL\n FWD", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.HollerOnOff, "\nHOLLER\nON/OFF", VSCSColorPalette.BlackOnCyan),
				new VSCSButton(VSCSButtonFunction.Release, "\n     RLS", VSCSColorPalette.BlackOnCyan) { Size = new Size(124, 68) },
			};

			// Wire up the click event for each button.
			foreach (VSCSButton btn in mButtons) btn.Click += new EventHandler(Btn_Click);

			// Start with the default menu.
			BuildMenu(VSCSMenu.AGPrimary);
		}

		private void Btn_Click(object sender, EventArgs e)
		{
			VSCSButton btn = sender as VSCSButton;
			switch (btn.Function) {
				case VSCSButtonFunction.ShowScreenMenu:
					if (mCurrentMenu == VSCSMenu.ScreenSelect) {
						SetScreenSelectButtonState(false);
						BuildMenu(mPreviousMenu);
					} else {
						SetScreenSelectButtonState(true);
						mPreviousMenu = mCurrentMenu;
						BuildMenu(VSCSMenu.ScreenSelect);
					}
					break;
				case VSCSButtonFunction.ToggleFunctionMenu:
					ToggleFunctionMenu();
					break;
				case VSCSButtonFunction.ToggleAirToGroundPage:
					switch (mCurrentPage) {
						case VSCSPage.AG1:
							mCurrentPage = VSCSPage.AG2;
							RaisePageChanged(mCurrentPage);
							break;
						case VSCSPage.AG2:
							mCurrentPage = VSCSPage.AG1;
							RaisePageChanged(mCurrentPage);
							break;
						default:
							throw new ApplicationException("Attempted to toggle A/G page while a G/G page was displayed.");
					}
					break;
				case VSCSButtonFunction.ToggleGroundToGroundPage:
					switch (mCurrentPage) {
						case VSCSPage.GG1:
							mCurrentPage = VSCSPage.GG2;
							RaisePageChanged(mCurrentPage);
							break;
						case VSCSPage.GG2:
							mCurrentPage = VSCSPage.GG1;
							RaisePageChanged(mCurrentPage);
							break;
						default:
							throw new ApplicationException("Attempted to toggle G/G page while a A/G page was displayed.");
					}
					break;
				case VSCSButtonFunction.AirToGroundPage1:
					mCurrentPage = VSCSPage.AG1;
					SetScreenSelectButtonState(false);
					BuildMenu(VSCSMenu.AGPrimary);
					RaisePageChanged(VSCSPage.AG1);
					break;
				case VSCSButtonFunction.AirToGroundPage2:
					mCurrentPage = VSCSPage.AG2;
					SetScreenSelectButtonState(false);
					BuildMenu(VSCSMenu.AGPrimary);
					RaisePageChanged(VSCSPage.AG2);
					break;
				case VSCSButtonFunction.GroundToGroundPage1:
					mCurrentPage = VSCSPage.GG1;
					SetScreenSelectButtonState(false);
					BuildMenu(VSCSMenu.GGPrimary);
					RaisePageChanged(VSCSPage.GG1);
					break;
				case VSCSButtonFunction.GroundToGroundPage2:
					mCurrentPage = VSCSPage.GG2;
					SetScreenSelectButtonState(false);
					BuildMenu(VSCSMenu.GGPrimary);
					RaisePageChanged(VSCSPage.GG2);
					break;
				case VSCSButtonFunction.Release:
					RaiseReleaseButtonPressed(sender as VSCSButton);
					break;
				case VSCSButtonFunction.AutoVoiceRoute:
					RaiseAutoVoiceRouteButtonPressed(sender as VSCSButton);
					break;
				case VSCSButtonFunction.ToggleNonOverrideOutput:
					RaiseNonOverrideOutputButtonPressed(sender as VSCSButton);
					break;
				case VSCSButtonFunction.ToggleOverrideOutput:
					RaiseOverrideOutputButtonPressed(sender as VSCSButton);
					break;
			}
		}

		private void SetScreenSelectButtonState(bool pending)
		{
			VSCSButton btn = mButtons.First(b => b.Function == VSCSButtonFunction.ShowScreenMenu);
			btn.SetPalette(pending ? VSCSColorPalette.WhiteOnGreen : VSCSColorPalette.BlackOnCyan);
			btn.IndicatorState = pending ? VSCSIndicatorState.Flash : VSCSIndicatorState.Off;
		}

		private void RaisePageChanged(VSCSPage page)
		{
			PageChanged?.Invoke(this, new VSCSPageChangedEventArgs(page));
			UpdateIncomingCallIndications();
		}

		private void RaiseMenuChanged(VSCSMenu Menu)
		{
			MenuChanged?.Invoke(this, new VSCSMenuChangedEventArgs(Menu));
		}

		private void RaiseReleaseButtonPressed(VSCSButton btn)
		{
			ReleaseButtonPressed?.Invoke(btn, EventArgs.Empty);
		}

		private void RaiseAutoVoiceRouteButtonPressed(VSCSButton btn)
		{
			AutoVoiceRouteButtonPressed?.Invoke(btn, EventArgs.Empty);
		}

		private void RaiseNonOverrideOutputButtonPressed(VSCSButton btn)
		{
			NonOverrideOutputButtonPressed?.Invoke(btn, EventArgs.Empty);
		}

		private void RaiseOverrideOutputButtonPressed(VSCSButton btn)
		{
			OverrideOutputButtonPressed?.Invoke(btn, EventArgs.Empty);
		}

		private void ToggleFunctionMenu()
		{
			switch (mCurrentMenu) {
				case VSCSMenu.AGPrimary:
					BuildMenu(VSCSMenu.AGAlternate);
					break;
				case VSCSMenu.AGAlternate:
					BuildMenu(VSCSMenu.AGPrimary);
					break;
				case VSCSMenu.GGPrimary:
					BuildMenu(VSCSMenu.GGAlternate);
					break;
				case VSCSMenu.GGAlternate:
					BuildMenu(VSCSMenu.GGPrimary);
					break;
				default:
					throw new ApplicationException(string.Format("Invalid current menu when ToggleFunctionMenu called: {0}", mCurrentMenu));
			}
		}

		private void BuildMenu(VSCSMenu menu)
		{
			mCurrentMenu = menu;
			VSCSButtonFunction[] functions;
			switch (menu) {
				case VSCSMenu.ScreenSelect:
					functions = new VSCSButtonFunction[] {
						VSCSButtonFunction.ShowScreenMenu,
						VSCSButtonFunction.AirToGroundPage1,
						VSCSButtonFunction.AirToGroundPage2,
						VSCSButtonFunction.AirToGroundStatus,
						VSCSButtonFunction.GroundToGroundPage1,
						VSCSButtonFunction.GroundToGroundPage2,
						VSCSButtonFunction.Utility
					};
					break;
				case VSCSMenu.AGPrimary:
					functions = new VSCSButtonFunction[] {
						VSCSButtonFunction.ShowScreenMenu,
						VSCSButtonFunction.ToggleFunctionMenu,
						VSCSButtonFunction.ToggleAirToGroundPage,
						VSCSButtonFunction.AutoVoiceRoute,
						VSCSButtonFunction.MainStandby,
						VSCSButtonFunction.BUEC,
						VSCSButtonFunction.CrossCouple,
						VSCSButtonFunction.RemoteMute,
						VSCSButtonFunction.FTSMonitor
					};
					break;
				case VSCSMenu.AGAlternate:
					functions = new VSCSButtonFunction[] {
						VSCSButtonFunction.ShowScreenMenu,
						VSCSButtonFunction.ToggleFunctionMenu,
						VSCSButtonFunction.ToggleAirToGroundPage,
						VSCSButtonFunction.AutoVoiceRoute,
						VSCSButtonFunction.MainStandby,
						VSCSButtonFunction.BUEC,
						VSCSButtonFunction.CrossCouple,
						VSCSButtonFunction.DiversityAlgorithm,
						VSCSButtonFunction.Test
					};
					break;
				case VSCSMenu.GGPrimary:
					functions = new VSCSButtonFunction[] {
						VSCSButtonFunction.ShowScreenMenu,
						VSCSButtonFunction.ToggleFunctionMenu,
						VSCSButtonFunction.ToggleGroundToGroundPage,
						VSCSButtonFunction.PositionRelief,
						VSCSButtonFunction.ToggleNonOverrideOutput,
						VSCSButtonFunction.ToggleOverrideOutput,
						VSCSButtonFunction.CallForward,
						VSCSButtonFunction.Release
					};
					break;
				case VSCSMenu.GGAlternate:
					functions = new VSCSButtonFunction[] {
						VSCSButtonFunction.ShowScreenMenu,
						VSCSButtonFunction.ToggleFunctionMenu,
						VSCSButtonFunction.ToggleGroundToGroundPage,
						VSCSButtonFunction.PositionRelief,
						VSCSButtonFunction.ToggleNonOverrideOutput,
						VSCSButtonFunction.ToggleOverrideOutput,
						VSCSButtonFunction.HollerOnOff,
						VSCSButtonFunction.Release
					};
					break;
				default:
					throw new ArgumentException(string.Format("Unsupported menu type: {0}", menu));
			}
			Controls.Clear();
			int x = 0;
			for (int i = 0; i < functions.Length; i++) {
				VSCSButton btn = mButtons.First(b => b.Function == functions[i]);
				btn.Location = new Point(x, 0);
				Controls.Add(btn);
				x += (btn.Width + BUTTON_SPACING);
			}
			RaiseMenuChanged(mCurrentMenu);
		}

		public void UpdateIndicators(VSCSIndicatorState state, bool on)
		{
			foreach (VSCSButton btn in mButtons.Where(b => b.IndicatorState == state)) btn.UpdateIndicator(on);
		}

		public void Reset()
		{
			BuildMenu(VSCSMenu.AGPrimary);
			SetScreenSelectButtonState(false);
		}

		public void UpdateIncomingCallIndications(bool page1, bool page2, bool caQueue)
		{
			mGGPage1IncomingCall = page1;
			mGGPage2IncomingCall = page2;
			mCAQueueIncomingCall = caQueue;
			UpdateIncomingCallIndications();
		}

		private void UpdateIncomingCallIndications()
		{
			bool flashScreenAlt = false;
			bool flashGGAlt = false;
			bool flashGG1 = false;
			bool flashGG2 = false;
			bool onGGPage = ((mCurrentPage == VSCSPage.GG1) || (mCurrentPage == VSCSPage.GG2));
			if (mGGPage1IncomingCall) {
				if (!onGGPage) {
					flashScreenAlt = true;
					flashGG1 = true;
				} else if (mCurrentPage == VSCSPage.GG2) {
					flashGG1 = true;
					flashGGAlt = true;
				}
			}
			if (mGGPage2IncomingCall) {
				if (!onGGPage) {
					flashScreenAlt = true;
					flashGG2 = true;
				} else if (mCurrentPage == VSCSPage.GG1) {
					flashGG2 = true;
					flashGGAlt = true;
				}
			}
			if (mCAQueueIncomingCall && !onGGPage) {
				flashScreenAlt = true;
				flashGG1 = true;
			}
			VSCSButton btn = mButtons.First(b => b.Function == VSCSButtonFunction.ShowScreenMenu);
			btn.SetPalette(flashScreenAlt ? VSCSColorPalette.BlackOnAmber : VSCSColorPalette.BlackOnCyan);
			btn.IndicatorState = flashScreenAlt ? VSCSIndicatorState.Flash : VSCSIndicatorState.Off;

			btn = mButtons.First(b => b.Function == VSCSButtonFunction.ToggleGroundToGroundPage);
			btn.SetPalette(flashGGAlt ? VSCSColorPalette.BlackOnAmber : VSCSColorPalette.BlackOnCyan);
			btn.IndicatorState = flashGGAlt ? VSCSIndicatorState.Flash : VSCSIndicatorState.Off;

			btn = mButtons.First(b => b.Function == VSCSButtonFunction.GroundToGroundPage1);
			btn.SetPalette(flashGG1 ? VSCSColorPalette.BlackOnAmber : VSCSColorPalette.WhiteOnViolet);
			btn.IndicatorState = flashGG1 ? VSCSIndicatorState.Flash : VSCSIndicatorState.Off;

			btn = mButtons.First(b => b.Function == VSCSButtonFunction.GroundToGroundPage2);
			btn.SetPalette(flashGG2 ? VSCSColorPalette.BlackOnAmber : VSCSColorPalette.WhiteOnViolet);
			btn.IndicatorState = flashGG2 ? VSCSIndicatorState.Flash : VSCSIndicatorState.Off;
		}
	}
}
