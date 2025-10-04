using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public enum VSCSColor
	{
		Black,
		Green,
		Amber,
		Cyan,
		Blue,
		Red,
		White,
		LightGray,
		DarkGray,
		Violet,
		Pink,
		Yellow
	}

	public enum VSCSColorPalette
	{
		BlackOnAmber,
		BlackOnCyan,
		BlackOnGreen,
		BlackOnLightGray,
		BlackOnPink,
		BlackOnWhite,
		BlackOnYellow,
		WhiteOnBlack,
		WhiteOnGreen,
		WhiteOnRed,
		WhiteOnViolet
	}

	public static class VSCSDesign
	{
		private static readonly Dictionary<VSCSColor, Color> sColors = new Dictionary<VSCSColor, Color>() {
			{ VSCSColor.Black, Color.Black },
			{ VSCSColor.Green, Color.FromArgb(62, 154, 126) },
			{ VSCSColor.Amber, Color.FromArgb(240, 182, 116) },
			{ VSCSColor.Cyan, Color.FromArgb(82, 222, 238) },
			{ VSCSColor.Blue, Color.DarkBlue },
			{ VSCSColor.Red, Color.FromArgb(198, 48, 40) },
			{ VSCSColor.White, Color.White },
			{ VSCSColor.LightGray, Color.FromArgb(180, 180, 180) },
			{ VSCSColor.DarkGray, Color.FromArgb(92, 92, 92) },
			{ VSCSColor.Violet, Color.FromArgb(214, 66, 198) },
			{ VSCSColor.Pink, Color.FromArgb(255, 198, 224) },
			{ VSCSColor.Yellow, Color.FromArgb(255, 255, 0) }
		};
		public static Font sFont = new Font("VSCS", 9.75f, FontStyle.Regular, GraphicsUnit.Point, 0);
		public static Font sMessageAreaFont = new Font("Courier New", 9.75f, FontStyle.Regular, GraphicsUnit.Point, 0);

		public static void ApplyPalette(VSCSColorPalette palette, Control control)
		{
			control.ForeColor = GetForeColor(palette);
			control.BackColor = GetBackColor(palette);
		}

		public static Color GetForeColor(VSCSColorPalette palette)
		{
			switch (palette) {
				case VSCSColorPalette.BlackOnAmber:
				case VSCSColorPalette.BlackOnCyan:
				case VSCSColorPalette.BlackOnGreen:
				case VSCSColorPalette.BlackOnLightGray:
				case VSCSColorPalette.BlackOnPink:
				case VSCSColorPalette.BlackOnWhite:
				case VSCSColorPalette.BlackOnYellow: return sColors[VSCSColor.Black];
				case VSCSColorPalette.WhiteOnBlack:
				case VSCSColorPalette.WhiteOnGreen:
				case VSCSColorPalette.WhiteOnRed:
				case VSCSColorPalette.WhiteOnViolet: return sColors[VSCSColor.White];
				default: throw new ArgumentException($"Unsupported palette: {palette}");
			}
		}

		public static Color GetBackColor(VSCSColorPalette palette)
		{
			switch (palette) {
				case VSCSColorPalette.BlackOnAmber: return sColors[VSCSColor.Amber];
				case VSCSColorPalette.BlackOnCyan: return sColors[VSCSColor.Cyan];
				case VSCSColorPalette.BlackOnGreen: return sColors[VSCSColor.Green];
				case VSCSColorPalette.BlackOnLightGray: return sColors[VSCSColor.LightGray];
				case VSCSColorPalette.BlackOnPink: return sColors[VSCSColor.Pink];
				case VSCSColorPalette.BlackOnWhite: return sColors[VSCSColor.White];
				case VSCSColorPalette.BlackOnYellow: return sColors[VSCSColor.Yellow];
				case VSCSColorPalette.WhiteOnBlack: return sColors[VSCSColor.Black];
				case VSCSColorPalette.WhiteOnGreen: return sColors[VSCSColor.Green];
				case VSCSColorPalette.WhiteOnRed: return sColors[VSCSColor.Red];
				case VSCSColorPalette.WhiteOnViolet: return sColors[VSCSColor.Violet];
				default: throw new ArgumentException($"Unsupported palette: {palette}");
			}
		}

		public static Color GetColor(VSCSColor color)
		{
			return sColors[color];
		}
	}
}
