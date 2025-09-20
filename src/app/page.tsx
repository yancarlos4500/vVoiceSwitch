
"use client";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  const [filteredPosition, setFilteredPosition] = useState<any>(null);

  useEffect(() => {
    function find(stp: any, found: boolean): any {
      if (!stp) return null;
      if (Array.isArray(stp.positions)) {
        for (const e of stp.positions) {
          if (e.cs === callsign) {
            return stp;
          }
        }
      }
      if (Array.isArray(stp.childFacilities)) {
        for (const k of stp.childFacilities) {
          const f = find(k, found);
          if (f) return f;
        }
      }
      return null;
    }
    axios.get('/zoa_position.json').then(r => {
      const prod = find(r.data, false);
      setPosData(prod);
    }).catch(() => {
      // Optionally handle error
    });
  }, [setPosData, callsign]);

  // Example usage: you can use filteredPosition in your UI below
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
  <SettingModal open={settingModal} setModal={setSettingModal} position={filteredPosition} />
      <div className="flex h-screen items-center justify-center">
        <div className="mt-2 box-border rounded-lg border-60 border-gray-500 shadow-2xl">
          <div className="mt-2">
            <AreaFour />
            <div className="flex">
              <AirGroundPage />
              <GroundGroundPage />
              <AreaThree setSettingModal={setSettingModal} />
            </div>
          </div>
          <div style={{ cursor: 'pointer' }} title="Open settings" onClick={() => setSettingModal(true)}>
            <StatusArea position={filteredPosition?.pos || 'FD/CD'} />
          </div>
        </div>
      </div>
    </main>
  );
}
