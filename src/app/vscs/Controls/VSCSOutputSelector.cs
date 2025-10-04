using System.ComponentModel;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using RossCarlson.Vatsim.Voice;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public partial class VSCSOutputSelector : VSCSButton
	{
		private AudioOutput mOutput = AudioOutput.None;
		private readonly Bitmap mHeadsetBitmap = null;
		private readonly Bitmap mSpeakerBitmap = null;

		public AudioOutput Output
		{
			get { return mOutput; }
			set
			{
				if (value == mOutput) {
					return;
				}

				mOutput = value;
				Invalidate();
			}
		}

		public bool TriState { get; set; } = false;

		public VSCSOutputSelector()
		{
			InitializeComponent();
			SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
			Assembly exe = Assembly.GetExecutingAssembly();
			using (Stream stream = exe.GetManifestResourceStream("RossCarlson.Vatsim.vERAM.UI.Controls.VSCSHeadsetIcon.bmp")) {
				byte[] bytes = new byte[stream.Length];
				stream.Read(bytes, 0, bytes.Length);
				TypeConverter tc = TypeDescriptor.GetConverter(typeof(Bitmap));
				mHeadsetBitmap = (Bitmap)tc.ConvertFrom(bytes);
			}
			mHeadsetBitmap.MakeTransparent(Color.Magenta);
			using (Stream stream = exe.GetManifestResourceStream("RossCarlson.Vatsim.vERAM.UI.Controls.VSCSSpeakerIcon.bmp")) {
				byte[] bytes = new byte[stream.Length];
				stream.Read(bytes, 0, bytes.Length);
				TypeConverter tc = TypeDescriptor.GetConverter(typeof(Bitmap));
				mSpeakerBitmap = (Bitmap)tc.ConvertFrom(bytes);
			}
			mSpeakerBitmap.MakeTransparent(Color.Magenta);
		}

		public VSCSOutputSelector(VSCSButtonFunction function, string text)
			: this()
		{
			mFunction = function;
			Text = text;
		}

		public VSCSOutputSelector(VSCSButtonFunction function, string text, VSCSColorPalette palette)
			: this(function, text)
		{
			VSCSDesign.ApplyPalette(palette, this);
		}

		protected override void OnPaint(PaintEventArgs pe)
		{
			base.OnPaint(pe);
			if (Output!= AudioOutput.None) {
				pe.Graphics.DrawImage(Output == AudioOutput.Headset ? mHeadsetBitmap : mSpeakerBitmap, (ClientSize.Width - mSpeakerBitmap.Width) / 2, 30);
			}
		}
	}
}
