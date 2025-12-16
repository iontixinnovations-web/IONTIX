import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import type { PhotoshootMode } from './data';
import { LOCATION_DATA } from './data';

interface SceneSelectionProps {
  mode: PhotoshootMode;
  selectedKey: string | null;
  unlockedScenes: string[];
  onSceneSelect: (key: string) => void;
  onUnlock: (key: string) => void;
  onTeleport: () => void;
}

export function SceneSelection({
  mode,
  selectedKey,
  unlockedScenes,
  onSceneSelect,
  onUnlock,
  onTeleport,
}: SceneSelectionProps) {
  const [showUnlockPanel, setShowUnlockPanel] = useState(false);
  const [unlockingScene, setUnlockingScene] = useState<string | null>(null);

  const sceneTitle = mode === 'wedding'
    ? '💍 Select Your Destination Dream Shoot'
    : '💫 Select Your Solo Teleport Scene';

  const handleSceneClick = (key: string) => {
    const location = LOCATION_DATA[key];
    onSceneSelect(key);

    if (location.plan === 'free' || unlockedScenes.includes(key)) {
      setShowUnlockPanel(false);
      onTeleport();
    } else {
      setUnlockingScene(key);
      setShowUnlockPanel(true);
    }
  };

  const handleUnlock = () => {
    if (!unlockingScene) return;

    toast.success('Processing payment...');
    setTimeout(() => {
      onUnlock(unlockingScene);
      setShowUnlockPanel(false);
      onTeleport();
    }, 2000);
  };

  return (
    <div className="absolute inset-0 flex flex-col p-6 animate-fade-in overflow-y-auto">
      <h2 className="text-2xl md:text-3xl mb-4 text-white">{sceneTitle}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
        {Object.keys(LOCATION_DATA).map((key) => {
          const data = LOCATION_DATA[key];
          const isUnlocked = data.plan === 'free' || unlockedScenes.includes(key);
          const isSelected = selectedKey === key;

          return (
            <div
              key={key}
              onClick={() => handleSceneClick(key)}
              className={`glass-panel rounded-xl overflow-hidden shadow-lg transform hover:scale-[1.03] transition-transform duration-300 cursor-pointer border-2 ${
                isSelected
                  ? 'border-amber-400 shadow-[0_0_15px_rgba(247,208,139,0.8)]'
                  : isUnlocked
                  ? 'border-amber-400'
                  : 'border-purple-400/50'
              }`}
            >
              <div className="relative">
                <img src={data.img} alt={data.name} className="h-36 w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-end justify-start p-3">
                  <p className="text-lg text-white text-left">{data.name}</p>
                </div>
                <div
                  className={`absolute top-2 right-2 px-3 py-1 text-white text-xs rounded-full shadow-lg ${
                    isUnlocked ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {data.plan === 'free' ? 'FREE ACCESS' : `PREMIUM ₹${data.price}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlock Panel */}
      {showUnlockPanel && unlockingScene && (
        <div className="glass-panel w-full mt-6 p-6">
          <h3 className="text-xl text-amber-300 mb-2">UNLOCK SCENE ACCESS</h3>
          <p className="text-slate-300 mb-4">
            You have selected the **
            <span className="text-pink-400">{LOCATION_DATA[unlockingScene].name}</span>** scene. This
            is a premium destination.
          </p>

          <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-4 rounded-lg border border-purple-500/50">
            <p className="text-3xl text-amber-300 mb-2 md:mb-0">
              One-Time Access: ₹{LOCATION_DATA[unlockingScene].price}
            </p>
            <button onClick={handleUnlock} className="btn-premium p-3 rounded-full text-lg w-full md:w-auto">
              💳 PAY & TELEPORT NOW
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Note: This is a simulated transaction for demonstration.</p>
        </div>
      )}
    </div>
  );
}
