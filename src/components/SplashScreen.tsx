import Vector from "../imports/Vector";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Wordmark } from "./Wordmark";
import type { MeasurementSystem } from "../utils/measurements";

function LogoLockup() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[24px] items-center justify-center pb-[48px] pt-0 px-0 relative shrink-0"
      data-name="Logo Lockup"
    >
      <div
        className="size-[144px] relative shrink-0 [&_svg]:overflow-visible"
        data-name="Logo"
      >
        <Vector />
      </div>
      <Wordmark className="w-[216px] h-auto text-[#231f20]" />
    </div>
  );
}

interface SplashScreenProps {
  /** First open: the rider must pick their units, which also opens the app */
  askUnits: boolean;
  /** Called with the units picked, or with nothing on a plain tap */
  onComplete: (system?: MeasurementSystem) => void;
}

const UNIT_CHOICES: {
  system: MeasurementSystem;
  label: string;
  detail: string;
}[] = [
  { system: "imperial", label: "Imperial", detail: "Miles & Feet" },
  { system: "metric", label: "Metric", detail: "Km & Meters" },
];

// How long the splash stays up on a returning open before it lifts on its own
const SPLASH_MS = 1500;

export function SplashScreen({ askUnits, onComplete }: SplashScreenProps) {
  // Returning opens: show briefly, then go. The first open waits for the units pick.
  // (The parent hands over a new callback each render; keep the timer from restarting)
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  useEffect(() => {
    if (askUnits) return;
    const timer = window.setTimeout(() => completeRef.current(), SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, [askUnits]);

  return (
    <motion.div
      className="bg-[#febc12] fixed inset-0 z-50 flex items-center justify-center"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      onClick={askUnits ? undefined : () => onComplete()}
    >
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center px-[85px] py-[241px] relative size-full">
          <LogoLockup />
        </div>

        {/* Units, picked once on first open; change them later in Settings. Other opens lift on their own (a tap skips ahead) */}
        {askUnits && (
          <motion.div
            className="absolute inset-x-0 bottom-0 px-[20px] pb-[max(32px,calc(env(safe-area-inset-bottom)+16px))] flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-[#231f20]/60 text-sm uppercase font-display font-medium tracking-wide">
              Choose your units
            </p>
            <div
              className="w-full max-w-[335px] grid grid-cols-2 gap-3"
              role="group"
              aria-label="Measurement system"
            >
              {UNIT_CHOICES.map(({ system, label, detail }) => (
                <button
                  key={system}
                  onClick={() => onComplete(system)}
                  className="py-3.5 px-4 border-2 border-[#231f20] rounded-lg text-[#231f20] hover:bg-[#231f20] hover:text-[#febc12] active:bg-[#231f20] active:text-[#febc12] transition-colors touch-manipulation"
                >
                  <div className="text-sm uppercase font-display font-medium tracking-[-0.36px]">
                    {label}
                  </div>
                  <div className="text-xs opacity-80">{detail}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
