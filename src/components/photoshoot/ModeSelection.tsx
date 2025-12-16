import type { PhotoshootMode } from './data';

interface ModeSelectionProps {
  onModeSelect: (mode: PhotoshootMode) => void;
}

export function ModeSelection({ onModeSelect }: ModeSelectionProps) {
  const modes = [
    {
      id: 'solo' as PhotoshootMode,
      icon: '💫',
      title: 'Solo Teleport Mode',
      desc: 'Normal photoshoot or travel scenes.',
    },
    {
      id: 'wedding' as PhotoshootMode,
      icon: '💍',
      title: 'Wedding Photoshoot Mode',
      desc: 'Couple photoshoot — destination & traditional.',
    },
    {
      id: 'cinematic' as PhotoshootMode,
      icon: '🎥',
      title: 'Cinematic Video Mode',
      desc: 'AI-generated short cinematic reels.',
    },
    {
      id: 'local' as PhotoshootMode,
      icon: '📸',
      title: 'Local AI Glow Capture',
      desc: 'Perfect quality for nearby, simple captures.',
    },
  ];

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center p-6 animate-fade-in">
      <h2 className="text-2xl md:text-3xl mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-amber-300 text-center">
        Your wedding. Your world. Anywhere. Instantly.
      </h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-6xl">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className="glow-orb p-6 rounded-2xl flex flex-col items-center justify-center text-center h-40 md:h-48"
          >
            <span className="text-3xl md:text-4xl">{mode.icon}</span>
            <p className="text-lg md:text-xl text-black mt-2">{mode.title}</p>
            <p className="text-sm text-black/80">{mode.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
