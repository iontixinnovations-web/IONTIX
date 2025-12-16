import { X, Trophy, MapPin, Users } from 'lucide-react';

interface GlowMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowLeaderboard: () => void;
  onShowGeoMap: () => void;
  onShowGlowClubs: () => void;
}

export function GlowMenuModal({
  isOpen,
  onClose,
  onShowLeaderboard,
  onShowGeoMap,
  onShowGlowClubs,
}: GlowMenuModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex justify-end">
      <div className="w-full max-w-xs bg-[#0a0a0a] p-6 pt-16 h-full text-white shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-white">
          <X size={28} />
        </button>
        <h3 className="text-2xl text-[#FF4081] mb-6 border-b border-gray-700 pb-2">Glow Menu</h3>
        <div className="space-y-4">
          <button
            onClick={onShowLeaderboard}
            className="w-full flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span className="text-base">Creator Leaderboard (Simulated)</span>
          </button>
          <button
            onClick={onShowGeoMap}
            className="w-full flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            <MapPin className="w-6 h-6 text-blue-400" />
            <span className="text-base">Geo Glow Map (Simulated)</span>
          </button>
          <button
            onClick={onShowGlowClubs}
            className="w-full flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            <Users className="w-6 h-6 text-purple-400" />
            <span className="text-base">Glow Clubs (Simulated)</span>
          </button>
        </div>
        <p className="absolute bottom-4 left-0 w-full text-center text-xs text-gray-500 p-4">
          🎙️ Tip: Try saying **"Hey Glow"** globally for command shortcuts!
        </p>
      </div>
    </div>
  );
}
