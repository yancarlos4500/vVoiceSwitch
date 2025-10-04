using System;

namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	public class VSCSPageChangedEventArgs : EventArgs
	{
		public VSCSPage NewPage { get; set; }

		public VSCSPageChangedEventArgs(VSCSPage newPage)
		{
			NewPage = newPage;
		}
	}
}
