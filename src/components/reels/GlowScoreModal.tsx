import { X } from 'lucide-react';

interface GlowScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  feedback: string;
  onImprove: () => void;
}

export function GlowScoreModal({ isOpen, onClose, score, feedback, onImprove }: GlowScoreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] p-8 rounded-xl shadow-2xl w-full max-w-sm text-white border-2 border-[#FF4081]/50">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl text-[#FF4081]">AI Creator Coach Feedback</h3>
          <button onClick={onClose} className="text-3xl text-gray-500 hover:text-white">
            <X size={28} />
          </button>
        </div>
        <div className="text-center my-6">
          <p className="text-4xl">{score}/100</p>
          <p className="text-gray-400">Amazing content! 🎉</p>
        </div>
        <p className="text-sm bg-gray-800 p-3 rounded-lg mb-4 border-l-4 border-[#8800FF]">{feedback}</p>
        <button
          onClick={onImprove}
          className="mt-4 w-full flex items-center justify-center bg-[#8800FF] hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition duration-200 shadow-md"
        >
          💯 "Improve My Reel" Tool
        </button>
      </div>
    </div>
  );
}
