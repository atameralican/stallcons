"use client";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import React, { useState, useEffect, useCallback } from "react";

const MESSAGES: string[] = [
  "STALLCONS\nSTEEL REDEFINED\nÇELİĞİN YENİ STANDARDI",

  "COMING SOON\nPRECISION IN STEEL\nYAKINDA HİZMETİNİZDE",

  "BUILT FOR STRENGTH\nDESIGNED FOR TOMORROW\nGELECEK İÇİN TASARLANDI",

  "MODERN STEEL\nTIMELESS STRUCTURES\nMODERN ÇELİK YAPILAR",

  "STALLCONS\nENGINEERING TRUST\nMÜHENDİSLİK & GÜVEN"
];

export default function Home() {
  const [msgIdx, setMsgIdx] = useState(0);

  const next = useCallback(
    () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
    [],
  );

  useEffect(() => {
    const id = setInterval(next, 12000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <TextFlippingBoard text={MESSAGES[msgIdx]} />
      {/* Brand Text */}
      <div className="mt-10 flex flex-col items-center text-center">
        <h1 className="select-none text-[16vw] font-black uppercase tracking-[-0.08em] leading-none sm:text-[12vw] lg:text-[10rem]">
          STALLCONS
        </h1>

        <div className="mt-2 h-[2px] w-32 bg-neutral-700" />

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
          Modern steel construction solutions.
          <br />
          Yakında profesyonel çelik konstrüksiyon hizmetlerimizle
          hizmetinizdeyiz.
        </p>
      </div>
    </div>

  );
}
