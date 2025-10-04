using System;
using System.Windows.Forms;
using RossCarlson.Vatsim.vERAM.Core;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSDAButton : VSCSButton
	{
		public event EventHandler ConfigurationRequested;

		public Controller OnLandLineWith { get; set; }
		public VSCSLandLineSpec Spec { get; set; }

		public void LoadFromSpec(VSCSLandLineSpec spec)
		{
			VSCSDesign.ApplyPalette((spec.LandLineType == VSCSLandLineType.None) ? VSCSColorPalette.BlackOnLightGray : VSCSColorPalette.BlackOnWhite, this);
			string label;
			switch (spec.LandLineType) {
				case VSCSLandLineType.Override:
					Function = VSCSButtonFunction.DAOverride;
					label = "OVR";
					break;
				case VSCSLandLineType.Intercom:
					Function = VSCSButtonFunction.DAIntercom;
					label = "NORM";
					break;
				case VSCSLandLineType.Monitor:
					Function = VSCSButtonFunction.DAMonitor;
					label = "MON";
					break;
				default:
					Function = VSCSButtonFunction.NoOp;
					label = "";
					break;
			}
			Text = string.Format(
				" {0}\n {1}\n\n {2}",
				spec.SectorID,
				spec.FacilityID,
				label
			);
			Spec = spec;
			spec.DAButtonCtrl = this;
		}

		private void RaiseConfigurationRequested()
		{
			ConfigurationRequested?.Invoke(this, EventArgs.Empty);
		}

		protected override void OnMouseClick(MouseEventArgs e)
		{
			if (e.Button == MouseButtons.Right) {
				RaiseConfigurationRequested();
				return;
			}

			base.OnMouseClick(e);
		}
	}
}
