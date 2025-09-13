"use client";
import "../../styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import React, { useEffect, useState } from 'react';


export default function StvsLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const htmlClass = `${mounted ? GeistSans.variable + ' ' : ''}font-ivsr tracking-widest`;
  return (
    <html lang="en" className={htmlClass}>
      <body>{children}</body>
    </html>
  );
}
