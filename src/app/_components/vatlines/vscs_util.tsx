import { useState } from 'react';
import VscsButtonComponent from './vscs_button';
import VscsStaticButton from './vscs_static_button';
import { ButtonType } from './App';

interface VscsUtilProps {
  sendMsg: (data: any) => void;
}

export default function VscsUtil({ sendMsg }: VscsUtilProps) {
  return (
    <div className="vscs-panel relative w-full h-full">
      {/* UTIL Page SVG */}
      <img 
        src="/UTIL_Page.svg" 
        alt="UTIL Page Layout" 
        className="w-full h-[auto]"
        style={{ transform: 'translateY(-25px)' }}
      />
    </div>
  );
};