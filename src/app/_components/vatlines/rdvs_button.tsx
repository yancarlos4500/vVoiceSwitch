// Stub for missing props type
type RdvsButtonComponentProps = any;
export default function RdvsButtonComponent(props: RdvsButtonComponentProps) {
  if (props.variant === 'radio') {
    // Radio button rendering
    if (props.radioSize === 'short') {
      // Custom short radio style, now customizable via props
      const bgColor = props.bgColor || '#C0632A';
      const textColor = props.textColor || '#FFFFFF';
      const labelColor = props.labelColor || '#888888';
      const indicatorColor = props.indicatorColor || '#000000';
      const indicatorBg = props.indicatorBg || bgColor;
      const borderColor = props.borderColor || indicatorColor;
      const frequencyColor = props.frequencyColor || '#FFFFFF';
      return (
        <div
          className="pixel-radio w-[160px] h-[50px] flex flex-col justify-between pt-0 pb-1 px-1 border-[1px] relative"
          style={{ backgroundColor: bgColor, borderColor: borderColor }}
        >
          {/* HL Rx Tx row - top */}
          <div className="flex flex-row justify-between items-center text-[12px] font-bold px-0.5 mt-0 mb-0" style={{ color: labelColor }}>
            <span className="flex flex-col items-start">
              <span>HL</span>
              {props.frequency && (
                <span className="text-[10px] leading-tight pl-0.5 -mt-2" style={{ color: frequencyColor, marginTop: '-6px', paddingTop: 0 }}>{props.label}</span>
              )}
            </span>
            <span>Rx</span>
            <span>Tx</span>
          </div>
          {/* Label and indicator row */}
          <div className="flex flex-row justify-between items-end flex-1 mt-0">
            <span className="leading-none" style={{ color: textColor, fontSize: 16 }}>{props.label}</span>
            <span className="flex items-center justify-center">
              <span className="w-6 h-6 rounded-full flex items-center justify-center border-0"
                    style={{ backgroundColor: indicatorColor, borderColor: borderColor }}>
                {props.checked && <span className="w-4 h-4 rounded-full border-0 " style={{ backgroundColor: indicatorBg, borderColor: borderColor }}></span>}
              </span>
            </span>
          </div>
        </div>
      );
    }
    // Long radio fallback (default), now customizable
    const longBgColor = props.bgColor || '#C0632A';
    const longTextColor = props.textColor || '#FFFFFF';
    const longLabelColor = props.labelColor || '#888888';
    const longIndicatorColor = props.indicatorColor || '#000000';
    const longIndicatorBg = props.indicatorBg || longBgColor;
    const longBorderColor = props.borderColor || longIndicatorColor;
    const longFrequencyColor = props.frequencyColor || '#FFFFFF';
    return (
      <div
        className="pixel-radio-long w-[400px] h-[80px] flex flex-col justify-between p-2 rounded border-2 font-mono relative"
        style={{ backgroundColor: longBgColor, borderColor: longBorderColor }}
      >
        <div className="flex flex-row justify-between items-center text-[22px] font-bold px-1" style={{ color: longLabelColor }}>
          <span className="flex flex-col items-start">
            <span>HS</span>
            {props.frequency && (
              <span className="text-[16px] leading-tight pl-0.5 -mt-2" style={{ color: longFrequencyColor, marginTop: '-8px', paddingTop: 0 }}>{props.frequency}</span>
            )}
          </span>
          <span className="w-[60px] h-[48px] border-2 border-lime-400 bg-black mx-1 flex items-end justify-center relative">
            {/* Example: battery or bar, can be customized further */}
            <span className="absolute top-0 left-1 w-8 h-1 bg-black"></span>
          </span>
          <span>RX</span>
          <span className="w-[60px] h-[32px] border-2 border-lime-400 bg-black mx-1"></span>
          <span>M/S</span>
          <span className="w-[60px] h-[32px] border-2 border-lime-400 bg-black mx-1"></span>
          <span>TX</span>
          <span className="w-[60px] h-[32px] border-2 border-lime-400 bg-black mx-1"></span>
          <span>M/S</span>
          <span className="w-[60px] h-[32px] border-2 border-lime-400 bg-black mx-1"></span>
        </div>
        <div className="flex flex-row justify-between items-end flex-1">
          <span className="leading-none font-mono pl-1 pt-1" style={{ color: longTextColor, fontSize: 32 }}>{props.label}</span>
          <span className="flex items-center justify-center pr-2 pb-1">
            <span className="w-[6px] h-[6px] rounded-full flex items-center justify-center border-2"
                  style={{ backgroundColor: longIndicatorColor, borderColor: longBorderColor }}>
              {props.checked && <span className="w-[4px] h-[4px] rounded-full border-2" style={{ backgroundColor: longIndicatorBg, borderColor: longBorderColor }}></span>}
            </span>
          </span>
        </div>
      </div>
    );
  }

  // Standard button rendering
  const fillDesignClass = props.config.fillDesign ? `fill-${props.config.fillDesign}` : '';
  const textColorClass = props.config.textColor ? `text-${props.config.textColor}` : 'text-white';
  const borderColor = props.config.borderColor || undefined;
  return (
    <button
      type="button"
      onClick={() => props.callback(props.config.target, props.config.type)}
      className={`text-small w-[70px] h-[50px] leading-none relative ${props.className}`}
      style={borderColor ? { borderColor, borderWidth: 2, borderStyle: 'solid' } : undefined}
    >
      {/* Fill design as background layer */}
      {props.config.fillDesign && (
        <div className={`absolute inset-0 ${fillDesignClass} opacity-30`}></div>
      )}
      {/* Text content on top */}
      <div className={`relative z-10 ${textColorClass}`}>
        {(() => {
          const name = props.config.name || '';
          const firstLine = name.slice(0, 7);
          const secondLine = name.length > 7 ? name.slice(7, 14) : '';
          return (
            <>
              <div className="first-line">{firstLine || <br />}</div>
              <div className="second-line">{secondLine || <br />}</div>
            </>
          );
        })()}
        {/* Frequency display if present */}
        {props.config.frequency && (
          <div className="frequency text-xs text-center mt-1">
            {props.config.frequency}
          </div>
        )}
        <div className="outline outline-1 outline-cyan-500 bg-black flex items-center w-3 h-3 justify-center mx-auto mt-1 indicator">
          {props.typeString}
        </div>
      </div>
    </button>
  );
}