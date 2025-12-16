import { Download, Share2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { PhotoshootMode } from './data';
import { LOCATION_DATA } from './data';

interface OutputPreviewProps {
  mode: PhotoshootMode;
  locationKey: string | null;
  onBackToScenes: () => void;
}

export function OutputPreview({ mode, locationKey, onBackToScenes }: OutputPreviewProps) {
  const location = locationKey ? LOCATION_DATA[locationKey] : null;
  
  const isVideo = mode === 'cinematic';
  const isLocal = mode === 'local';

  const getOutputData = () => {
    if (isLocal) {
      return {
        title: 'PERFECT LOCAL CAPTURE!',
        subtitle: 'AI corrected for studio quality.',
        badge: 'AI CORRECTED',
        badgeClass: 'bg-purple-600',
        emotion: 'Neutral (95%)',
        lighting: 99,
      };
    }

    if (isVideo) {
      return {
        title: 'CINEMATIC REEL READY!',
        subtitle: `Caption: "Captured in ${location?.name.split(' ')[0]} - MITHAS Glow Wedding Edition"`,
        badge: 'HD REEL (15s)',
        badgeClass: 'bg-indigo-600',
        emotion: 'Epic (99%)',
        lighting: 99,
      };
    }

    return {
      title: '8K RAW PHOTO RENDER COMPLETE!',
      subtitle: `Scene: ${location?.name}. AI Smart Album created successfully!`,
      badge: 'RAW CLARITY',
      badgeClass: 'bg-red-600',
      emotion: ['Joyful', 'Loving', 'Serene', 'Excited'][Math.floor(Math.random() * 4)] + ` (${Math.floor(Math.random() * (99 - 85) + 85)}%)`,
      lighting: Math.floor(Math.random() * (99 - 90) + 90),
    };
  };

  const data = getOutputData();

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center p-6 bg-black/90 animate-fade-in overflow-y-auto">
      <h2 className="text-2xl md:text-3xl text-pink-400 mb-2 text-center">{data.title}</h2>
      <p className="text-slate-300 text-center mb-6 text-sm">{data.subtitle}</p>

      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-4 border-amber-400 relative w-full max-w-sm">
        <img
          src={`https://placehold.co/400x600/0b0615/d8e3f2?text=${isVideo ? 'AI+REEL' : '8K+AI+OUTPUT'}`}
          alt="Output Preview"
          className="w-full h-auto object-cover"
        />
        <div className={`absolute top-2 left-2 px-3 py-1 text-xs text-white rounded-lg shadow-md ${data.badgeClass}`}>
          {data.badge}
        </div>
      </div>

      {/* AI Report */}
      <div className="glass-panel w-full max-w-sm mt-6 p-4">
        <h3 className="text-lg text-amber-300 mb-2">🧠 AI EMOTION & QUALITY REPORT</h3>
        <div className="flex justify-between items-center text-sm">
          <p>Emotion Rating:</p>
          <p className="text-xl text-pink-400">{data.emotion}</p>
        </div>
        <div className="mt-2 flex justify-between items-center text-sm text-slate-400">
          <p>Lighting Match:</p>
          <div className="w-3/4 h-2 bg-gray-700 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${data.lighting}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col space-y-3 w-full max-w-sm">
        <button
          onClick={() => toast.success('Album Created')}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full hover:shadow-pink-400/50 hover:shadow-xl transition-all flex items-center justify-center"
        >
          <ImageIcon className="w-5 h-5 mr-2" /> AUTO ALBUM & SHARE (Glow Feed)
        </button>
        <button
          onClick={() => toast.success('Download Complete')}
          className="bg-amber-400 text-black p-3 rounded-full hover:bg-amber-300 transition-colors flex items-center justify-center"
        >
          <Download className="w-5 h-5 mr-2" /> DOWNLOAD RAW/HD FILE
        </button>
        <button
          onClick={onBackToScenes}
          className="bg-slate-700 text-white p-3 rounded-full hover:bg-slate-600 transition-colors"
        >
          SELECT NEW SCENE
        </button>
      </div>
    </div>
  );
}
