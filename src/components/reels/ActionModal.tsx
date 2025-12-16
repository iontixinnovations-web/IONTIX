import { Gift, Palette, Save } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyLook: () => void;
  onBookArtist: () => void;
  onSaveToVault: () => void;
}

export function ActionModal({ isOpen, onClose, onBuyLook, onBookArtist, onSaveToVault }: ActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0a0a] p-6 rounded-xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl text-white mb-4 border-b border-gray-700 pb-2">Instant Actions</h3>
        <div className="space-y-4">
          <button
            onClick={onBuyLook}
            className="w-full flex items-center justify-center bg-[#FF4081] hover:bg-pink-600 text-white py-3 px-4 rounded-lg transition duration-200 shadow-md"
          >
            <Gift className="w-5 h-5 mr-2" />
            Buy Outfit / Jewellery / Makeup
          </button>
          <button
            onClick={onBookArtist}
            className="w-full flex items-center justify-center bg-[#8800FF] hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition duration-200 shadow-md"
          >
            <Palette className="w-5 h-5 mr-2" />
            Book Artist (Quick Booking)
          </button>
          <button
            onClick={onSaveToVault}
            className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition duration-200 shadow-md"
          >
            <Save className="w-5 h-5 mr-2" />
            Save to Glow Look Vault
          </button>
        </div>
      </div>
    </div>
  );
}
