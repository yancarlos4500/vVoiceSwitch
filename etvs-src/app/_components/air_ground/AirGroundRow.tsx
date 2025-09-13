// components/AirGroundRow.tsx

import React from 'react';
import FrequencyButton from './FreqButton';
import SquareButton from '../base_button/SquareButton';
import OOSButton from '../base_button/OOSButton';
import OOSFreqButton from './OOSFreqButton';
import { useCoreStore } from '~/model';


type AirGroundRowProps = {
  data?: any; // Single ag_status item or undefined
};

const AirGroundRow: React.FC<AirGroundRowProps> = ({ data }) => {
  const sendMsg = useCoreStore((s: any) => s.sendMessageNow);
  const ptt = useCoreStore((s: any) => s.ptt);

  if (!data) {
    // Render empty button set
    return (
      <div className="flex mb-1 gap-1">
        <OOSFreqButton />
        <OOSButton />
        <OOSButton />
        <OOSButton />
        <OOSButton />
      </div>
    );
  }
  const freq = data?.freq;
  const prefMode = !!data?.h;
  const currMode = !!data?.h;
  const name = data.name || (freq ? (Math.floor(freq / 10000) / 100) : '');
  const txIndicator = data?.t ? (ptt ? 'flutter active' : 'steady green') : '';
  const rxIndicator = data?.r ? (data?.talking ? 'flutter active' : 'steady green') : '';
  return (
    <div className="flex mb-1 gap-1">
      <FrequencyButton
        name={name}
        frequency={freq ? String(Math.floor(freq / 10000) / 100) : ''}
        prefMode={prefMode}
        currMode={currMode}
      />
      <SquareButton topLine='TX' bottomLine='SEL' onClick={() => sendMsg({ type: 'tx', cmd1: '' + data.freq, dbl1: !data.t })} />
      <SquareButton topLine='RX' bottomLine='SEL' onClick={() => sendMsg({ type: 'rx', cmd1: '' + data.freq, dbl1: !data.r })} />
      <SquareButton topLine='TX' bottomLine='MAIN' />
      <SquareButton topLine='RX' bottomLine='MAIN' />
    </div>
  );
};

export default AirGroundRow;
