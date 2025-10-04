using System;
using System.ComponentModel;
using System.ComponentModel.Design;
using System.Drawing;
using System.Drawing.Design;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSButton : Control, IVSCSIndicator
	{
		private const int ROUNDED_CORNER_RADIUS = 10;

		protected VSCSButtonFunction mFunction = VSCSButtonFunction.NoOp;
		private bool mNonLatching = false;
		private VSCSIndicatorState mIndicatorState = VSCSIndicatorState.Off;
		private bool mIndicatorOn = false;
		private Point[] mRoundedCornerPoints;
		private byte[] mRoundedCornerPointTypes;

		public VSCSButtonFunction Function
		{
			get { return mFunction; }
			set { mFunction = value; Invalidate(); }
		}

		public bool NonLatching
		{
			get { return mNonLatching; }
			set { mNonLatching = value; Invalidate(); }
		}

		public VSCSIndicatorState IndicatorState
		{
			get { return mIndicatorState; }
			set {
				if (value == mIndicatorState) {
					return;
				}
				mIndicatorState = value;
				Invalidate();
			}
		}

		public bool FlashBackground { get; set; }

		public VSCSColor AlternateBackgroundColor { get; set; } = VSCSColor.Green;

		[Editor(typeof(MultilineStringEditor), typeof(UITypeEditor))]
		public override string Text
		{
			get { return base.Text; }
			set { base.Text = value; Invalidate(); }
		}

		public VSCSButton()
		{
			InitializeComponent();
			SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
			Size = new Size(56, 68);
			CalculateRoundedCornerPoints();
			SetPalette(VSCSColorPalette.BlackOnLightGray);
			Font = VSCSDesign.sFont;
		}

		public VSCSButton(VSCSButtonFunction function, string text)
			: this()
		{
			mFunction = function;
			Text = text;
		}

		public VSCSButton(VSCSButtonFunction function, string text, VSCSColorPalette palette)
			: this(function, text)
		{
			SetPalette(palette);
		}

		protected override void OnResize(EventArgs e)
		{
			base.OnResize(e);
		}

		private void CalculateRoundedCornerPoints()
		{
			mRoundedCornerPoints = new Point[8] {
				new Point(0, ROUNDED_CORNER_RADIUS),
				new Point(ROUNDED_CORNER_RADIUS, 0),
				new Point(ClientSize.Width - ROUNDED_CORNER_RADIUS, 0),
				new Point(ClientSize.Width, ROUNDED_CORNER_RADIUS),
				new Point(ClientSize.Width, ClientSize.Height - ROUNDED_CORNER_RADIUS),
				new Point(ClientSize.Width - ROUNDED_CORNER_RADIUS, ClientSize.Height),
				new Point(ROUNDED_CORNER_RADIUS, ClientSize.Height),
				new Point(0, ClientSize.Height - ROUNDED_CORNER_RADIUS)
			};
			mRoundedCornerPointTypes = new byte[8] {
				(byte)PathPointType.Line,
				(byte)PathPointType.Line,
				(byte)PathPointType.Line,
				(byte)PathPointType.Line,
				(byte)PathPointType.Line,
				(byte)PathPointType.Line,
				(byte)PathPointType.Line,
				(byte)PathPointType.Line
			};
		}

		protected override void OnPaintBackground(PaintEventArgs pe)
		{
			Color backColor = BackColor;
			if (FlashBackground && (IndicatorState == VSCSIndicatorState.Flash) && mIndicatorOn) {
				backColor = VSCSDesign.GetColor(AlternateBackgroundColor);
			}
			using (Brush bgBrush = new SolidBrush(backColor)) {
				if (mNonLatching) {
					using (Brush transparentBrush = new SolidBrush(Parent.BackColor)) {
						pe.Graphics.FillRectangle(transparentBrush, ClientRectangle);
					}
					GraphicsPath path = new GraphicsPath(mRoundedCornerPoints, mRoundedCornerPointTypes);
					pe.Graphics.FillPath(bgBrush, path);
				} else {
					pe.Graphics.FillRectangle(bgBrush, ClientRectangle);
				}
			}
		}

		protected override void OnPaint(PaintEventArgs pe)
		{
			using (Brush textBrush = new SolidBrush(ForeColor)) {
				Rectangle rect;
				if (this is VSCSDAButton) {
					rect = new Rectangle(2, 8, ClientSize.Width - 2, ClientSize.Height - 8);
				} else {
					rect = new Rectangle(2, 0, ClientSize.Width - 2, ClientSize.Height);
				}
				bool drawText = true;
				switch (IndicatorState) {
					case VSCSIndicatorState.Flash:
						drawText = mIndicatorOn || FlashBackground;
						break;
					case VSCSIndicatorState.Flutter:
					case VSCSIndicatorState.Wink:
						drawText = mIndicatorOn;
						break;
				}
				if (drawText) {
					pe.Graphics.DrawString(Text, Font, textBrush, rect);
				}
			}
		}

		public void UpdateIndicator(bool on)
		{
			if (mIndicatorOn != on) {
				mIndicatorOn = on;
				Invalidate();
			}
		}

		public void SetPalette(VSCSColorPalette palette)
		{
			VSCSDesign.ApplyPalette(palette, this);
		}
	}
}
