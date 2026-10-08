import Vector from "../imports/Vector";
import { motion } from "motion/react";
import { Wordmark } from "./Wordmark";

function LogoLockup() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[24px] items-center justify-center pb-[48px] pt-0 px-0 relative shrink-0" data-name="Logo Lockup">
      <div className="h-[143.993px] relative shrink-0 w-[143.999px]" data-name="Logo">
        <Vector />
      </div>
      <Wordmark className="w-[216px] h-auto text-[#231f20]" />
    </div>
  );
}

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      className="bg-[#febc12] fixed inset-0 z-50 flex items-center justify-center"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      onClick={onComplete}
    >
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center px-[85px] py-[241px] relative size-full">
          <LogoLockup />
        </div>

        {/* Tap to continue hint */}
        <motion.div
          className="absolute bottom-8 text-[#231f20]/60 text-sm uppercase font-display font-medium tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Tap to continue
        </motion.div>
      </div>
    </motion.div>
  );
}
