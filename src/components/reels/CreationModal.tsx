import { X, Mic } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordComplete: () => void;
  isFirstLaunch: boolean;
}

export function CreationModal({ isOpen, onClose, onRecordComplete, isFirstLaunch }: CreationModalProps) {
  if (!isOpen) return null;

  const handleVoiceCommand = () => {
    toast.info('🎙️ Voice Command Mode: Ready! Try: "show trending bridal looks"');
  };

  const handleEmotionOverlay = (value: string) => {
    if (value === 'emotion-overlay') {
      toast.success('✨ Glow AI Emotion Overlay activated!');
    }
  };

  const handleAIPartner = (value: string) => {
    if (value !== 'none') {
      toast.success(`AI Partner Set: ${value}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col p-4">
      <div className="flex justify-between items-center text-white mb-4">
        <button onClick={onClose} className="text-2xl">
          <X size={28} />
        </button>
        <h2 className="text-lg">Create Reel (AI Studio)</h2>
        <div className="w-6"></div>
      </div>

      {/* AI Co-Creator Selection */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm">
        <p className="text-[#FF4081] mb-2">🤖 AI Co-Creator Partner:</p>
        <select
          className="w-full p-2 rounded-lg bg-gray-700 text-white"
          onChange={(e) => handleAIPartner(e.target.value)}
        >
          <option value="none">None</option>
          <option value="Kriti">Kriti (Fashionista)</option>
          <option value="Arjun">Arjun (Glam Expert)</option>
        </select>
      </div>

      {/* Live Filter AI */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm">
        <p className="text-[#FF4081] mb-2">✨ Live Filter AI:</p>
        <select
          className="w-full p-2 rounded-lg bg-gray-700 text-white"
          onChange={(e) => handleEmotionOverlay(e.target.value)}
        >
          <option value="standard">Standard</option>
          <option value="emotion-overlay">Glow AI Emotion Overlay (Live Blush/Light)</option>
        </select>
      </div>

      <div className="relative flex-grow bg-black rounded-xl shadow-inner flex items-center justify-center mb-6 border-4 border-[#8800FF]/50">
        <p className="text-white/50 text-center text-xl">📸 Live Camera Feed Here</p>
        <div className="absolute bottom-4 p-2 bg-black/50 rounded-lg text-xs text-yellow-300">
          Hint: Use a **Heart Gesture** to 'Like' (Onboarding).
        </div>
      </div>

      {/* Capture Button & Voice Commands */}
      <div className="flex justify-around items-center">
        <button onClick={handleVoiceCommand} className="text-[#FF4081] hover:text-white transition">
          <Mic className="w-10 h-10" />
          <p className="text-xs mt-1">Hey Glow</p>
        </button>
        <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center">
          <button
            onClick={onRecordComplete}
            className="w-16 h-16 bg-[#FF4081] rounded-full shadow-xl hover:scale-105 transition duration-200"
          ></button>
        </div>
        <button onClick={onRecordComplete} className="text-[#FF4081]">
          Record
        </button>
      </div>

      {/* Auto Smart Hashtags Hint */}
      <div className="text-center text-sm text-gray-400 mt-4">
        **After recording:** **Auto Smart Hashtags** will be generated based on your video content!
      </div>
    </div>
  );
}
