using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSAuxMessageArea : Control
	{
		private readonly List<string> mOutputLines;

		public VSCSAuxMessageArea()
		{
			InitializeComponent();
			SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
			mOutputLines = new List<string>();
			VSCSDesign.ApplyPalette(VSCSColorPalette.BlackOnCyan, this);
			Font = VSCSDesign.sFont;
		}

		protected override void OnPaint(PaintEventArgs pe)
		{
			if (mOutputLines.Count > 0) {
				VSCSDesign.ApplyPalette(VSCSColorPalette.BlackOnGreen, this);
				string output = string.Join("\n", mOutputLines.ToArray());
				using (Brush textBrush = new SolidBrush(ForeColor)) {
					pe.Graphics.DrawString(output, Font, textBrush, ClientRectangle);
				}
			} else {
				VSCSDesign.ApplyPalette(VSCSColorPalette.BlackOnCyan, this);
			}
		}

		public void AddOverrider(string sectorID, string facilityID)
		{
			string line = $"{sectorID,3}   {facilityID}";
			if (!mOutputLines.Contains(line)) {
				mOutputLines.Add(line);
			}

			Invalidate();
		}

		public void RemoveOverrider(string sectorID, string facilityID)
		{
			string line = $"{sectorID,3}   {facilityID}";
			mOutputLines.Remove(line);
			Invalidate();
		}
	}
}
