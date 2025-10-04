using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSVoiceMonitor : Control
	{
		private readonly List<string> mOutputLines;

		public VSCSVoiceMonitor()
		{
			InitializeComponent();
			SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
			mOutputLines = new List<string>();
			Size = new Size(124, 136);
			VSCSDesign.ApplyPalette(VSCSColorPalette.BlackOnWhite, this);
			Font = VSCSDesign.sFont;
		}

		protected override void OnPaint(PaintEventArgs pe)
		{
			using (Brush edgeBrush = new SolidBrush(VSCSDesign.GetColor(VSCSColor.Cyan))) {
				pe.Graphics.FillRectangle(edgeBrush, new Rectangle(0, 0, ClientSize.Width, 13));
				pe.Graphics.FillRectangle(edgeBrush, new Rectangle(0, 13, 10, ClientSize.Height - 13));
			}
			using (Brush textBrush = new SolidBrush(ForeColor)) {
				using (Brush lineBackgroundBrush = new SolidBrush(VSCSDesign.GetColor(VSCSColor.Green))) {
					using (StringFormat fmt = new StringFormat()) {
						fmt.Alignment = StringAlignment.Center;
						fmt.LineAlignment = StringAlignment.Center;
						pe.Graphics.DrawString("VOICE MON", Font, textBrush, new RectangleF(0.0f, 1.0f, ClientSize.Width, 13.0f), fmt);
					}
					for (int i = 1; i <= 9; i++) {
						pe.Graphics.DrawString(i.ToString(), Font, textBrush, 0.0f, (i * 13.5f) - 0.8f);
						if ((mOutputLines.Count >= i) && !string.IsNullOrEmpty(mOutputLines[i - 1])) {
							pe.Graphics.FillRectangle(lineBackgroundBrush, new RectangleF(10, (i * 13.5f) - 0.8f, ClientSize.Width - 10.0f, 13.5f));
							pe.Graphics.DrawString(mOutputLines[i - 1], Font, textBrush, 10.0f, (i * 13.5f) - 0.8f);
						}
					}
				}
			}
		}

		public void AddMonitor(string sectorID, string facilityID)
		{
			string line = string.Format("{0,3}   {1}", sectorID, facilityID);
			if (!mOutputLines.Contains(line)) {
				mOutputLines.Add(line);
			}
			Invalidate();
		}

		public void RemoveMonitor(string sectorID, string facilityID)
		{
			string line = string.Format("{0,3}   {1}", sectorID, facilityID);
			mOutputLines.Remove(line);
			Invalidate();
		}
	}
}
