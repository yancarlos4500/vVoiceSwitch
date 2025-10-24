// components/StvsKeypad.tsx
"use client";

import StvsKeypadButton from "./StvsKeypadButton";

interface StvsKeypadProps {
  brightness?: number; // Brightness from ILLUM knob
}

const StvsKeypad: React.FC<StvsKeypadProps> = ({ brightness = 1.0 }) => {
  
  // Function to play button press sound
  const playButtonSound = () => {
    try {
      const audio = new Audio('/stvsButton.wav');
      audio.volume = 1.0; // Adjust volume as needed
      audio.play().catch(error => {
        console.log('Could not play button sound:', error);
      });
    } catch (error) {
      console.log('Audio not available:', error);
    }
  };
  
  const handleKeypadClick = (key: string) => {
    playButtonSound(); // Play sound on button press
    console.log(`STVS Keypad pressed: ${key}`);
    // TODO: Add functionality for dialing/number entry
  };

  // Keypad layout: 3 columns x 4 rows
  // These positions are percent-based, matching the SVG/viewBox logic in StvsBase
  // Adjust left/top/width/height as needed for visual alignment
  const buttonPositions = [
    // Row 1
    { left: '32%', top: '3%', label: '1', topLine: '', bottomLine: '1' },
    { left: '44%', top: '3%', label: '2', topLine: 'ABC', bottomLine: '2' },
    { left: '55%', top: '3%', label: '3', topLine: 'DEF', bottomLine: '3' },
    // Row 2
    { left: '32%', top: '18%', label: '4', topLine: 'GHI', bottomLine: '4' },
    { left: '44%', top: '18%', label: '5', topLine: 'JKL', bottomLine: '5' },
    { left: '55%', top: '18%', label: '6', topLine: 'MNO', bottomLine: '6' },
    // Row 3
    { left: '32%', top: '33%', label: '7', topLine: 'PQRS', bottomLine: '7' },
    { left: '44%', top: '33%', label: '8', topLine: 'TUV', bottomLine: '8' },
    { left: '55%', top: '33%', label: '9', topLine: 'WXY', bottomLine: '9' },
    // Row 4
    { left: '32%', top: '48%', label: '*', topLine: '', bottomLine: '*' },
    { left: '44%', top: '48%', label: '0', topLine: 'OPER', bottomLine: '0' },
    { left: '55%', top: '48%', label: '#', topLine: '', bottomLine: '#' },
  ];

  // Keypad container: position absolute, scale/size set by parent (StvsBase)
  return (
    <div style={{ position: 'absolute', width: '103%', height: '103%' }}>
      {buttonPositions.map((pos, idx) => (
        <StvsKeypadButton
          key={idx}
          topLine={pos.topLine}
          bottomLine={pos.bottomLine}
          brightness={brightness}
          onClick={() => handleKeypadClick(pos.label)}
          style={{
            position: 'absolute',
            left: pos.left,
            top: pos.top,
            width: '10%',
            height: '13%',
            minWidth: 0,
            minHeight: 0,
          }}
        />
      ))}
    </div>
  );
};

export default StvsKeypad;