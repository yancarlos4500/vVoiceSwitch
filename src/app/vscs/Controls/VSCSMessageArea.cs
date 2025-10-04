using System;
using System.ComponentModel;
using System.ComponentModel.Design;
using System.Drawing;
using System.Drawing.Design;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSMessageArea : Control
	{
		private readonly Bitmap mErrorBitmap = null;
		private string mError = string.Empty;
		private readonly Timer mMessageAutoAckTimer;

		[Editor(typeof(MultilineStringEditor), typeof(UITypeEditor))]
		public string Error
		{
			get { return mError; }
			set {
				if (mError != value) {
					BackColor = string.IsNullOrEmpty(value) ? VSCSDesign.GetColor(VSCSColor.LightGray) : VSCSDesign.GetColor(VSCSColor.Pink);
					mError = value;
					Invalidate();
				}
				mMessageAutoAckTimer.Stop();
				if (!string.IsNullOrEmpty(mError)) {
					mMessageAutoAckTimer.Start();
				}
			}
		}

		public VSCSMessageArea()
		{
			InitializeComponent();
			SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
			VSCSDesign.ApplyPalette(VSCSColorPalette.BlackOnLightGray, this);
			Font = VSCSDesign.sMessageAreaFont;
			Assembly exe = Assembly.GetExecutingAssembly();
			using (Stream stream = exe.GetManifestResourceStream("RossCarlson.Vatsim.vERAM.UI.Controls.VSCSErrorIcon.bmp")) {
				byte[] bytes = new byte[stream.Length];
				stream.Read(bytes, 0, bytes.Length);
				TypeConverter tc = TypeDescriptor.GetConverter(typeof(Bitmap));
				mErrorBitmap = (Bitmap)tc.ConvertFrom(bytes);
			}
			mErrorBitmap.MakeTransparent(Color.Magenta);

			// Setup timer for automatically acknowledging messages.
			mMessageAutoAckTimer = new System.Windows.Forms.Timer {
				Interval = 30000
			};
			mMessageAutoAckTimer.Tick += new EventHandler(MessageAutoAckTimer_Tick);
		}

		private void MessageAutoAckTimer_Tick(object sender, EventArgs e)
		{
			Error = string.Empty;
		}

		protected override void OnPaint(PaintEventArgs pe)
		{
			if (!string.IsNullOrEmpty(Error)) {
				pe.Graphics.DrawImage(mErrorBitmap, 2, 15);
				using (Brush textBrush = new SolidBrush(ForeColor)) {
					Rectangle rect = new Rectangle(35, 8, ClientSize.Width - 35, ClientSize.Height - 8);
					pe.Graphics.DrawString(Error, Font, textBrush, rect);
				}
			}
		}

		protected override void OnClick(EventArgs e)
		{
			base.OnClick(e);
			Clear();
		}

		public void Clear()
		{
			Error = string.Empty;
			BackColor = VSCSDesign.GetColor(VSCSColor.LightGray);
		}
	}
}
