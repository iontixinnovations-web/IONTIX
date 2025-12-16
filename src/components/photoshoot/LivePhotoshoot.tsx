import { useState, useEffect, useRef } from 'react';
import { Video } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { PhotoshootMode } from './data';
import { LOCATION_DATA, POSE_HINTS, ALL_FILTER_CLASSES } from './data';

interface LivePhotoshootProps {
  mode: PhotoshootMode;
  locationKey: string;
  isSoundPlaying: boolean;
  onCapture: (data: { title: string; subtitle: string; type: 'photo' | 'video' }) => void;
  onGenerateCinematic: () => void;
}

export function LivePhotoshoot({
  mode,
  locationKey,
  isSoundPlaying,
  onCapture,
  onGenerateCinematic,
}: LivePhotoshootProps) {
  const [guidanceText, setGuidanceText] = useState('Setting Dual Lighting Zones...');
  const [poseHint, setPoseHint] = useState('');
  const [currentGuidanceIndex, setCurrentGuidanceIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPoseGuide, setShowPoseGuide] = useState(true);
  const guidanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const location = LOCATION_DATA[locationKey];
  const isWeddingMode = mode === 'wedding';

  useEffect(() => {
    // Initial scan animation
    setGuidanceText('DUAL FACE DETECTION & OUTFIT MAPPING...');
    
    setTimeout(() => {
      setGuidanceText('AI scanning outfit colors… adjusting lighting tones…');
      setTimeout(() => {
        startGuidance();
      }, 1500);
    }, 1000);

    return () => {
      if (guidanceIntervalRef.current) {
        clearInterval(guidanceIntervalRef.current);
      }
    };
  }, [locationKey]);

  const startGuidance = () => {
    if (guidanceIntervalRef.current) {
      clearInterval(guidanceIntervalRef.current);
    }

    let index = 0;
    const runGuidance = () => {
      const instruction = location.guidance[index];
      setGuidanceText(instruction.text);
      
      const hintData = POSE_HINTS[instruction.hint];
      setPoseHint(hintData.text.split(' ')[0]);
      
      setShowPoseGuide(instruction.hint !== 'ready');

      if (instruction.hint === 'ready') {
        setTimeout(() => handleCapture(), 2000);
      }

      index = (index + 1) % location.guidance.length;
      setCurrentGuidanceIndex(index);
    };

    runGuidance();
    guidanceIntervalRef.current = setInterval(runGuidance, 5000);
  };

  const handleCapture = () => {
    if (isCapturing) return;
    setIsCapturing(true);

    if (guidanceIntervalRef.current) {
      clearInterval(guidanceIntervalRef.current);
    }

    setGuidanceText('CAPTURING FRAME... AI AUTO-RECAPTURE PASS (Blink Detected)...');
    setPoseHint('...');
    setShowPoseGuide(false);

    setTimeout(() => {
      toast.success('✅ PHOTO CAPTURED! 8K RAW file saved to Private Vault.');
      onCapture({
        title: '8K RAW PHOTO RENDER COMPLETE!',
        subtitle: `Scene: ${location.name}. AI Smart Album created successfully!`,
        type: 'photo',
      });
    }, 1500);
  };

  return (
    <div className="absolute inset-0 transition-opacity duration-300">
      {/* Guidance Box */}
      <div className="glass-panel absolute top-4 left-4 right-4 p-3 text-center shadow-2xl z-30">
        <div className="flex items-center justify-center">
          <span className="text-3xl text-amber-300 mr-2">{poseHint}</span>
          <p className="text-base md:text-lg text-white">{guidanceText}</p>
        </div>
        <p className="text-pink-400 text-xs mt-1">📸 AI WEDDING PHOTOGRAPHER | LIVE MODE</p>
      </div>

      {/* Live View */}
      <div className={`absolute inset-0 w-full h-full overflow-hidden flex justify-center items-end ${isWeddingMode ? 'dual-frame' : ''}`}>
        {isWeddingMode && (
          <div className="before-teleport-view relative">
            <p className="absolute top-4 left-4 text-xs text-white/80 z-20">VIRTUAL MIRROR: LIVE INPUT</p>
            <img
              className="couple-user opacity-50"
              src="https://placehold.co/400x600/522d7d/ffffff?text=Camera+Input+Bride"
              alt="Bride Live Feed"
              style={{ left: '50%', transform: 'translateX(-100%)' }}
            />
            <img
              className="couple-user opacity-50"
              src="https://placehold.co/400x600/522d7d/ffffff?text=Camera+Input+Groom"
              alt="Groom Live Feed"
              style={{ left: '50%', transform: 'translateX(0%)' }}
            />
            <div className="ripple-effect"></div>
          </div>
        )}

        <div className="after-teleport-view relative aura-scan active">
          <p className="absolute top-4 right-4 text-xs text-amber-300 z-20">AI REALM: TELEPORTED OUTPUT</p>
          
          <div
            className={`simulated-background ${location.effectClass}`}
            style={{ backgroundImage: `url(${location.img})` }}
          ></div>

          {showPoseGuide && (
            <div className="pose-guide-overlay">
              <div className="silhouette"></div>
            </div>
          )}

          {isWeddingMode ? (
            <>
              <img
                className={`couple-user live-glow ${location.effectClass}`}
                src="https://placehold.co/400x600/522d7d/ffffff?text=Bride+Live+Feed"
                alt="Bride Live Feed"
                style={{ left: '50%', transform: 'translateX(-100%)' }}
              />
              <img
                className={`couple-user live-glow ${location.effectClass}`}
                src="https://placehold.co/400x600/522d7d/ffffff?text=Groom+Live+Feed"
                alt="Groom Live Feed"
                style={{ left: '50%', transform: 'translateX(0%)' }}
              />
            </>
          ) : (
            <img
              className={`couple-user live-glow ${location.effectClass}`}
              src="https://placehold.co/400x600/522d7d/ffffff?text=Solo+Live+Feed"
              alt="Solo Live Feed"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            />
          )}

          <div className="absolute bottom-28 left-4 p-2 bg-black/60 text-xs rounded-lg z-30 border border-amber-300/50">
            <p className="text-amber-300">✅ DUAL LIGHTING: Skin Tone & Jewelry/Fabric Sync</p>
            <p className="text-pink-400 mt-1">🎶 Ambient Music Sync: {location.sound} Score</p>
            <p className="text-slate-400 mt-1 text-xs">📐 Auto Angle Detect: 0° Tilt (Simulated Parallax)</p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="glass-panel absolute bottom-0 left-0 right-0 p-4 flex justify-around items-center z-30">
        <div className="bubble-btn text-white p-3 px-4 text-xs md:text-sm flex items-center space-x-1 md:space-x-2 opacity-50 cursor-not-allowed">
          <span className="text-xl md:text-2xl">🪞</span>
          <span>AI Mirror Pose (Active)</span>
        </div>

        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full border-4 border-pink-400 shadow-[0_0_25px_rgba(255,192,203,0.9)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          <div
            className={`w-12 h-12 md:w-16 md:h-16 bg-pink-600 rounded-full mx-auto transition-colors duration-300 ${
              isCapturing ? 'animate-pulse' : ''
            }`}
          ></div>
        </button>

        <button
          onClick={onGenerateCinematic}
          className="bubble-btn text-white p-3 px-4 text-xs md:text-sm flex items-center space-x-1 md:space-x-2"
        >
          <Video className="w-5 h-5" />
          <span>Cinematic Reel</span>
        </button>
      </div>
    </div>
  );
}
