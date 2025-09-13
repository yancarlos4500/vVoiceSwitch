
"use client";
import axios from "axios";
import { useEffect } from "react";

import Link from "next/link";
import { useState } from "react";
import SettingModal from "./components/SettingModal";
import Image from "next/image";
import AirGroundPage from "./_components/air_ground/AirGroundPage";
import GroundGroundPage from "./_components/ground_ground/GroundGroundPage";
import AreaThree from "./_components/special_func/AreaThree";
import StatusArea from "./_components/status/StatusArea";
import { useCoreStore } from '../model';
import AreaFour from "./_components/special_func/AreaFour";

export default function HomePage() {
  const [settingModal, setSettingModal] = useState(false);
  const setPosData = require('../model').useCoreStore((s: any) => s.setPositionData);
  const callsign = useCoreStore((s: any) => s.callsign);
  const positionData = useCoreStore((s: any) => s.positionData);
  // Find the position object in positionData.positions that matches the current callsign
  let posLabel = 'FD/CD';
  if (callsign && positionData && Array.isArray(positionData.positions)) {
    const found = positionData.positions.find((p: any) => p.cs === callsign);
    if (found && found.pos) posLabel = found.pos;
  }
  useEffect(() => {
    axios.get('/zoa_position.json').then(r => {
      setPosData(r.data);
    }).catch(() => {
      // Optionally handle error
    });
  }, [setPosData]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <SettingModal open={settingModal} setModal={setSettingModal} />
      <div className="flex h-screen items-center justify-center">
        <div className="mt-2 box-border rounded-lg border-60 border-gray-500 shadow-2xl">
          <div className="mt-2">
            <AreaFour />
            <div className="flex">
              <AirGroundPage />
              <GroundGroundPage />
              <AreaThree />
            </div>
          </div>
          <div style={{ cursor: 'pointer' }} title="Open settings" onClick={() => setSettingModal(true)}>
            <StatusArea position={posLabel} />
          </div>
        </div>
      </div>
    </main>
  );
}
