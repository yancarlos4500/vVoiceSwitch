
"use client";

import { useState } from 'react';
import { useCoreStore } from '../model';
import VscsComponent from '../app/_components/vatlines/vscs';
import ETVSWrapper from '../components/ETVSWrapper';
import STVSWrapper from '../components/STVSWrapper';
import IVSRPage from './ivsr/page';
import RDVSWrapper from '../components/RDVSWrapper';
import SettingModal from '../pages/setting';

export default function Page() {
  const [settingModal, setSettingModal] = useState(false);
  const currentUI = useCoreStore(s => s.currentUI);
  // VSCS Zustand state mapping
  const activeLandlines = useCoreStore(s => s.activeLandlines || []);
  const incomingLandlines = useCoreStore(s => s.incomingLandlines || []);
  const outgoingLandlines = useCoreStore(s => s.outgoingLandlines || []);
  const heldLandlines = useCoreStore(s => s.heldLandlines || []);
  const config = useCoreStore(s => s.currentConfig || {});
  const buttonPress = useCoreStore(s => s.buttonPress || (() => {}));
  const holdBtn = useCoreStore(s => s.holdBtn || (() => {}));
  const releaseBtn = useCoreStore(s => s.releaseBtn || (() => {}));
  const toggleGg = useCoreStore(s => s.toggleGg || (() => {}));
  const toggleOver = useCoreStore(s => s.toggleOver || (() => {}));
  const ggLoud = useCoreStore(s => s.ggLoud || false);
  const overrideLoud = useCoreStore(s => s.overrideLoud || false);
  const settingsEdit = useCoreStore(s => s.settingsEdit || (() => {}));
  const volume = useCoreStore(s => s.volume || { volume: 50, setVolume: () => {} });
  const playError = useCoreStore(s => s.playError || (() => {}));
  const metadata = useCoreStore(s => s.metadata || { position: '', sector: '', facilityId: '' });

  const renderUI = () => {
    switch (currentUI) {
      case 'etvs':
        return <ETVSWrapper />;
      case 'stvs':
        return <STVSWrapper />;
      case 'ivsr':
        return <IVSRPage />;
      case 'rdvs':
        return <RDVSWrapper />;
      case 'vscs':
      default:
        return (
          <VscsComponent
            activeLandlines={activeLandlines}
            incomingLandlines={incomingLandlines}
            outgoingLandlines={outgoingLandlines}
            heldLandlines={heldLandlines}
            config={config}
            buttonPress={buttonPress}
            holdBtn={holdBtn}
            releaseBtn={releaseBtn}
            toggleGg={toggleGg}
            toggleOver={toggleOver}
            ggLoud={ggLoud}
            overrideLoud={overrideLoud}
            settingsEdit={settingsEdit}
            volume={volume}
            playError={playError}
            metadata={metadata}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-700 p-4">
      {renderUI()}
      <SettingModal open={settingModal} setModal={setSettingModal} />
    </div>
  );
}