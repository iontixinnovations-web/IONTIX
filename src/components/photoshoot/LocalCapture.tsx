import { useState } from 'react';
import { Camera } from 'lucide-react';

interface LocalCaptureProps {
  onCapture: (data: { title: string; subtitle: string; type: 'local' }) => void;
  onBackToModes: () => void;
}

export function LocalCapture({ onCapture, onBackToModes }: LocalCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onCapture({
        title: 'PERFECT LOCAL CAPTURE!',
        subtitle: 'AI corrected for studio quality.',
        type: 'local',
      });
    }, 2500);
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center p-6 bg-[#1a0a2b] animate-fade-in">
      <div className="local-capture-box glass-panel w-full max-w-md p-8 text-center border-4 border-amber-300">
        <span className="text-7xl mb-4 block">✨</span>
        <h2 className="text-3xl text-amber-300 mb-2">Local AI Glow Capture</h2>
        <p className="text-lg text-white/80 mb-6">
          Your mobile camera's current output is being instantly upgraded to Studio Quality by AI.
        </p>

        <div className="bg-black/50 p-4 rounded-lg mb-6">
          <p className="text-sm text-pink-400 mb-2">AI Status: Active</p>
          <p className="text-xs text-slate-300">
            Auto-Correction applied: Noise Reduction, Lens Distortion, Low Light Compensation, and Skin Tone
            Enhancement.
          </p>
        </div>

        <button
          onClick={handleCapture}
          disabled={isProcessing}
          className="btn-premium p-3 px-8 rounded-full text-lg w-full flex items-center justify-center disabled:opacity-50"
        >
          <Camera className="w-5 h-5 mr-2" />
          {isProcessing ? '✨ AI Processing Glow...' : '📸 CAPTURE PERFECT SHOT'}
        </button>
        
        <button onClick={onBackToModes} className="text-sm text-slate-400 mt-4 hover:text-white transition-colors">
          ← Change Mode
        </button>
      </div>
    </div>
  );
}
