using System.Drawing;
using System.Windows.Forms;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSLabel : Control
	{
		private const int BRACKET_MARGIN = 8;

		private int mBracketWidth = 50;
		private int mBracketThickness = 1;

		public int BracketWidth
		{
			get { return mBracketWidth; }
			set { mBracketWidth = value; Invalidate(); }
		}

		public int BracketThickness
		{
			get { return mBracketThickness; }
			set { mBracketThickness = value; Invalidate(); }
		}

		public override string Text
		{
			get { return base.Text; }
			set { base.Text = value; Invalidate(); }
		}

		public VSCSLabel()
		{
			InitializeComponent();
			SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
			VSCSDesign.ApplyPalette(VSCSColorPalette.BlackOnWhite, this);
			Font = VSCSDesign.sFont;
		}

		protected override void OnPaint(PaintEventArgs pe)
		{
			using (Brush textBrush = new SolidBrush(ForeColor)) {
				pe.Graphics.DrawString(Text, Font, textBrush, 0, -1.0f);
			}
			if (BracketThickness > 0) {
				int bracketY = ClientSize.Height / 2;
				using (Pen bracketPen = new Pen(ForeColor, BracketThickness)) {
					Point[] leftPoints = new Point[3];
					leftPoints[0] = new Point(BRACKET_MARGIN, Bottom);
					leftPoints[1] = new Point(BRACKET_MARGIN, bracketY);
					leftPoints[2] = new Point(BRACKET_MARGIN + BracketWidth, bracketY);
					pe.Graphics.DrawLines(bracketPen, leftPoints);
					Point[] rightPoints = new Point[3];
					rightPoints[0] = new Point(ClientSize.Width - BRACKET_MARGIN, Bottom);
					rightPoints[1] = new Point(ClientSize.Width - BRACKET_MARGIN, bracketY);
					rightPoints[2] = new Point(ClientSize.Width - BRACKET_MARGIN - BracketWidth, bracketY);
					pe.Graphics.DrawLines(bracketPen, rightPoints);
				}
			}
		}
	}
}
