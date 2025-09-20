"use client";

import React, { useState, useEffect } from "react";
import StvsBase from "./StvsBase";
import axios from "axios";
import { useCoreStore } from "~/model";

export default function StvsPage() {
  const setPosData = useCoreStore((s: any) => s.setPositionData);
  const callsign = useCoreStore((s: any) => s.callsign);

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
      setPosData(prod || r.data); // Use the full data if find doesn't return anything
    }).catch(() => {
      // Optionally handle error
    });
  }, [setPosData, callsign]);

  return <StvsBase />;
}
