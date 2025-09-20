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

  return (
    <div className="flex flex-col items-center space-y-2 p-4">
      {/* Keypad grid - 3x4 layout like a phone */}
      <div className="grid grid-cols-3 gap-3">
        <StvsKeypadButton 
          topLine="" 
          bottomLine="1" 
          brightness={brightness}
          onClick={() => handleKeypadClick('1')}
        />
        <StvsKeypadButton 
          topLine="ABC" 
          bottomLine="2" 
          brightness={brightness}
          onClick={() => handleKeypadClick('2')}
        />
        <StvsKeypadButton 
          topLine="DEF" 
          bottomLine="3" 
          brightness={brightness}
          onClick={() => handleKeypadClick('3')}
        />
        
        <StvsKeypadButton 
          topLine="GHI" 
          bottomLine="4" 
          brightness={brightness}
          onClick={() => handleKeypadClick('4')}
        />
        <StvsKeypadButton 
          topLine="JKL" 
          bottomLine="5" 
          brightness={brightness}
          onClick={() => handleKeypadClick('5')}
        />
        <StvsKeypadButton 
          topLine="MNO" 
          bottomLine="6" 
          brightness={brightness}
          onClick={() => handleKeypadClick('6')}
        />
        
        <StvsKeypadButton 
          topLine="PQRS" 
          bottomLine="7" 
          brightness={brightness}
          onClick={() => handleKeypadClick('7')}
        />
        <StvsKeypadButton 
          topLine="TUV" 
          bottomLine="8" 
          brightness={brightness}
          onClick={() => handleKeypadClick('8')}
        />
        <StvsKeypadButton 
          topLine="WXY" 
          bottomLine="9" 
          brightness={brightness}
          onClick={() => handleKeypadClick('9')}
        />
        
        <StvsKeypadButton 
          topLine="" 
          bottomLine="*"
          brightness={brightness}
          onClick={() => handleKeypadClick('*')}
        />
        <StvsKeypadButton 
          topLine="OPER" 
          bottomLine="0" 
          brightness={brightness}
          onClick={() => handleKeypadClick('0')}
        />
        <StvsKeypadButton 
          topLine="" 
          bottomLine="#" 
          brightness={brightness}
          onClick={() => handleKeypadClick('#')}
        />
      </div>
    </div>
  );
};

export default StvsKeypad;