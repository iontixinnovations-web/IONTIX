import { useState, useEffect } from 'react';
import { Home, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { ModeSelection } from './photoshoot/ModeSelection';
import { SceneSelection } from './photoshoot/SceneSelection';
import { LivePhotoshoot } from './photoshoot/LivePhotoshoot';
import { OutputPreview } from './photoshoot/OutputPreview';
import { LocalCapture } from './photoshoot/LocalCapture';
import { toast } from 'sonner@2.0.3';
import type { PhotoshootMode } from './photoshoot/data';

interface PhotoshootScreenProps {
  onNavigateHome?: () => void;
}

export function PhotoshootScreen({ onNavigateHome }: PhotoshootScreenProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentMode, setCurrentMode] = useState<PhotoshootMode | null>(null);
  const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(null);
  const [unlockedScenes, setUnlockedScenes] = useState<string[]>(['temple']);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [showPortalAnimation, setShowPortalAnimation] = useState(false);

  // Update mode display text
  const getModeDisplayText = () => {
    if (currentMode === 'wedding') return '💍 WEDDING MODE';
    if (currentMode === 'solo') return '💫 SOLO MODE';
    if (currentMode === 'local') return '📸 LOCAL GLOW';
    if (currentMode === 'cinematic') return '🎥 CINEMATIC MODE';
    return 'MODE SELECT';
  };

  const handleModeSelect = (mode: PhotoshootMode) => {
    setCurrentMode(mode);
    if (mode === 'solo' || mode === 'wedding') {
      setCurrentStep(2);
    } else if (mode === 'local') {
      setCurrentStep(5);
    } else if (mode === 'cinematic') {
      // Default to premium scene for cinematic
      if (!selectedLocationKey) {
        setSelectedLocationKey('paris');
      }
      handleGenerateCinematic();
    }
  };

  const handleSceneSelect = (key: string) => {
    setSelectedLocationKey(key);
  };

  const handleUnlockScene = (key: string) => {
    setUnlockedScenes([...unlockedScenes, key]);
    toast.success('Scene unlocked successfully!');
  };

  const handleTeleport = () => {
    setShowPortalAnimation(true);
    setTimeout(() => {
      setShowPortalAnimation(false);
      setCurrentStep(3);
    }, 2000);
  };

  const handleCapture = (outputData: { title: string; subtitle: string; type: 'photo' | 'video' | 'local' }) => {
    setCurrentStep(4);
  };

  const handleGenerateCinematic = () => {
    toast.success('Generating cinematic reel...');
    setTimeout(() => {
      setCurrentStep(4);
    }, 4000);
  };

  const handleBackToHome = () => {
    setCurrentStep(1);
    setCurrentMode(null);
    setSelectedLocationKey(null);
  };

  return (
    <div className="photoshoot-container min-h-screen flex flex-col max-w-lg mx-auto bg-[#0d0615] text-[#d8e3f2] relative overflow-hidden">
      {/* Portal Animation Overlay */}
      {showPortalAnimation && (
        <div className="teleport-swirl active"></div>
      )}

      {/* Header */}
      <div className="p-4 flex justify-between items-center z-40 bg-black/40 backdrop-blur-sm shadow-lg">
        <h1 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300">
          💍 MITHAS GLOW
        </h1>
        <div className="flex space-x-4 text-sm">
          <span className="px-3 py-1 rounded-full bg-pink-600/70 text-white">
            {getModeDisplayText()}
          </span>
          <button
            onClick={() => setIsSoundPlaying(!isSoundPlaying)}
            className="text-slate-400 hover:text-green-400 transition-colors flex items-center"
          >
            {isSoundPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={onNavigateHome || handleBackToHome}
            className="text-slate-400 hover:text-red-400 transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> EXIT
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-grow relative overflow-hidden">
        {currentStep === 1 && (
          <ModeSelection onModeSelect={handleModeSelect} />
        )}

        {currentStep === 2 && (
          <SceneSelection
            mode={currentMode!}
            selectedKey={selectedLocationKey}
            unlockedScenes={unlockedScenes}
            onSceneSelect={handleSceneSelect}
            onUnlock={handleUnlockScene}
            onTeleport={handleTeleport}
          />
        )}

        {currentStep === 3 && selectedLocationKey && (
          <LivePhotoshoot
            mode={currentMode!}
            locationKey={selectedLocationKey}
            isSoundPlaying={isSoundPlaying}
            onCapture={handleCapture}
            onGenerateCinematic={handleGenerateCinematic}
          />
        )}

        {currentStep === 4 && (
          <OutputPreview
            mode={currentMode!}
            locationKey={selectedLocationKey}
            onBackToScenes={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 5 && (
          <LocalCapture
            onCapture={handleCapture}
            onBackToModes={() => setCurrentStep(1)}
          />
        )}
      </div>
    </div>
  );
}
