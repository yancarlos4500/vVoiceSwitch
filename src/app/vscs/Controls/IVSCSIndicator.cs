namespace RossCarlson.Vatsim.vERAM.UI.Controls
{
	interface IVSCSIndicator
	{
		VSCSIndicatorState IndicatorState { get; set; }
		void UpdateIndicator(bool on);
	}
}
