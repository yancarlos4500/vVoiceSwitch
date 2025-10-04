using System;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public class VSCSMenuChangedEventArgs : EventArgs
	{
		public VSCSMenu NewMenu { get; }

		public VSCSMenuChangedEventArgs(VSCSMenu newMenu)
		{
			NewMenu = newMenu;
		}
	}
}
