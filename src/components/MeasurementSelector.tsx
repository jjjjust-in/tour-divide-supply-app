import navBgPattern from 'figma:asset/53e87b274f9e9eae37a672b63e5feb2e3c44276d.png';
import type { MeasurementSystem } from '../utils/measurements';

interface MeasurementSelectorProps {
  onSelect: (system: MeasurementSystem) => void;
}

export function MeasurementSelector({ onSelect }: MeasurementSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden">
        <div
          className="px-6 pt-6 pb-4"
          style={navBgPattern ? { backgroundImage: `url(${navBgPattern})`, backgroundSize: '300px 300px' } : { backgroundColor: '#febc12' }}
        >
          <h2 className="font-display font-bold text-xl text-[#231F20] uppercase tracking-tight">
            Units
          </h2>
          <p className="text-sm text-[#231F20]/70 mt-1.5">
            Choose your preferred measurement system
          </p>
        </div>
        <div className="p-4 space-y-4">
          <button
            onClick={() => onSelect('imperial')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-[#febc12] hover:bg-amber-50 transition-colors"
          >
            <div className="text-left">
              <div className="font-semibold text-[#231F20]">Imperial</div>
              <div className="text-xs text-gray-500">miles · feet</div>
            </div>
            <span className="text-[#febc12] text-lg font-bold">mi</span>
          </button>
          <button
            onClick={() => onSelect('metric')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-[#febc12] hover:bg-amber-50 transition-colors"
          >
            <div className="text-left">
              <div className="font-semibold text-[#231F20]">Metric</div>
              <div className="text-xs text-gray-500">kilometers · meters</div>
            </div>
            <span className="text-gray-500 text-lg font-bold">km</span>
          </button>
        </div>
      </div>
    </div>
  );
}
