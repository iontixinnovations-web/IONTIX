import { X } from 'lucide-react';

interface Product360ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Product360Modal({ isOpen, onClose }: Product360ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm h-96 bg-gray-800 rounded-xl flex flex-col items-center justify-center p-4">
        <h3 className="text-xl text-[#FF4081] mb-4">360° Product Viewer</h3>
        <div className="w-40 h-40 bg-gray-700 rounded-full flex items-center justify-center border-4 border-white animate-spin-slow">
          <span className="text-white text-sm">Rotate 🔄</span>
        </div>
        <p className="text-gray-400 mt-4">Drag to spin the product (Simulated 3D Model)</p>
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl text-gray-500 hover:text-white">
          <X size={28} />
        </button>
      </div>
    </div>
  );
}
