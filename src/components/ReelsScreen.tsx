import { useState, useEffect, useRef } from 'react';
import { Search, Camera, MoreVertical, Coins, Home, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ReelItem } from './reels/ReelItem';
import { ActionModal } from './reels/ActionModal';
import { GlowMenuModal } from './reels/GlowMenuModal';
import { Product360Modal } from './reels/Product360Modal';
import { CreationModal } from './reels/CreationModal';
import { GlowScoreModal } from './reels/GlowScoreModal';
import { REELS_DATA, QUICK_REACTIONS, MOODS, CREATOR_SPOTLIGHT, GRADIENT_COLORS } from './reels/data';

interface ReelsScreenProps {
  onNavigateToShop?: () => void;
  onNavigateHome?: () => void;
  onNavigateToChat?: () => void;
}

export function ReelsScreen({ onNavigateToShop, onNavigateHome, onNavigateToChat }: ReelsScreenProps) {
  const [currentMood, setCurrentMood] = useState(MOODS[0]);
  const [glowCoins, setGlowCoins] = useState(10);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showGlowMenu, setShowGlowMenu] = useState(false);
  const [show360Modal, setShow360Modal] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showGlowScoreModal, setShowGlowScoreModal] = useState(false);
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  const feedRef = useRef<HTMLDivElement>(null);

  // Update background gradient based on current reel
  useEffect(() => {
    const colorIndex = currentReelIndex % GRADIENT_COLORS.length;
    document.body.style.backgroundColor = GRADIENT_COLORS[colorIndex];
    document.body.style.transition = 'background-color 0.8s ease';

    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [currentReelIndex]);

  // Scroll listener to track current reel
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const handleScroll = () => {
      const scrollPosition = feed.scrollTop;
      const reelHeight = feed.clientHeight;
      const newIndex = Math.round(scrollPosition / reelHeight);
      if (newIndex !== currentReelIndex) {
        setCurrentReelIndex(newIndex);
      }
    };

    feed.addEventListener('scroll', handleScroll);
    return () => feed.removeEventListener('scroll', handleScroll);
  }, [currentReelIndex]);

  // Randomly change mood every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMood(MOODS[Math.floor(Math.random() * MOODS.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFollow = (creator: string) => {
    const newFollowed = new Set(followedCreators);
    if (newFollowed.has(creator)) {
      newFollowed.delete(creator);
      toast.success(`❌ You have unfollowed ${creator}.`);
    } else {
      newFollowed.add(creator);
      toast.success(`✅ You are now following ${creator}!`);
    }
    setFollowedCreators(newFollowed);
  };

  const handleBuyLook = () => {
    setShowActionModal(false);
    if (onNavigateToShop) {
      onNavigateToShop();
    } else {
      toast.success('🛍️ Look added to your shopping cart!');
    }
  };

  const handleBookArtist = () => {
    setShowActionModal(false);
    if (onNavigateToChat) {
      toast.success('📅 Opening Glow Artist chat...');
      onNavigateToChat();
    } else {
      toast.info('📅 Artist booking opened (Simulated).');
    }
  };

  const handleSaveToVault = () => {
    setShowActionModal(false);
    toast.success('💾 Look saved to your Glow Vault!');
  };

  const handleRecordComplete = () => {
    setShowCreationModal(false);
    const hashtags = ['#RoyalLook', '#GlowChallenge', '#ParisTeleport', '#Bridal2025'];
    toast.success(`✅ Reel recorded! AI generated Auto Smart Hashtags: ${hashtags.join(', ')}`);

    setTimeout(() => {
      setShowGlowScoreModal(true);
    }, 1000);
  };

  const handleImproveReel = () => {
    setShowGlowScoreModal(false);
    toast.info('AI is analyzing and optimizing your reel... 🧠');
  };

  const handleQuickReact = (emoji: string) => {
    toast.success(`➕ Quick Reaction ${emoji} sent! Earned +1 Glow Coin.`);
    setGlowCoins(glowCoins + 1);
  };

  const handleVoiceCommand = () => {
    toast.info('🎙️ Voice Command Mode: Ready! Try: "show trending bridal looks"');
  };

  const handleCreatorSpotlight = (name: string, isChallenge: boolean) => {
    if (isChallenge) {
      toast.success('Starting a new Glow Challenge!');
    } else {
      toast.info(`Viewing ${name}'s profile`);
    }
  };

  return (
    <div className="reels-screen-container w-screen h-screen overflow-hidden relative bg-[#0a0a0a]">
      {/* AI Mood Indicator */}
      <div className="fixed top-8 left-4 z-50 p-1.5 bg-red-500/80 text-white rounded-lg text-xs shadow-lg">
        Mood: <span>{currentMood}</span>
      </div>

      {/* Glow Coin Display */}
      <div className="fixed top-8 right-4 z-50 p-2 bg-yellow-400 text-black rounded-full text-xs shadow-lg flex items-center">
        <Coins className="w-4 h-4 mr-1" />
        {glowCoins}
      </div>

      {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 w-full z-40 px-4 py-3 flex justify-between items-center text-white bg-black/30 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onNavigateHome} 
            title="Back to Home" 
            className="hover:text-gray-300 transition p-2 hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl tracking-wider">Glow Reels 🎥</h1>
        </div>
        <div className="flex space-x-4 items-center">
          <button onClick={handleVoiceCommand} title="Search / Discover" className="hover:text-gray-300 transition">
            <Search className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowCreationModal(true)}
            title="Create Reel"
            className="hover:text-gray-300 transition"
          >
            <Camera className="w-6 h-6" />
          </button>
          <button onClick={() => setShowGlowMenu(true)} title="Glow Menu" className="hover:text-gray-300 transition">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Creator Spotlight Carousel */}
      <div className="fixed top-16 left-0 w-full z-30 p-2 bg-black/30 backdrop-blur-sm overflow-x-scroll whitespace-nowrap hide-scrollbar">
        <div className="inline-flex space-x-3">
          {CREATOR_SPOTLIGHT.map((creator, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleCreatorSpotlight(creator.name, creator.isChallenge || false)}
            >
              <div
                className={`w-14 h-14 rounded-full ${creator.color} border-2 ${creator.border || 'border-white'} flex items-center justify-center text-xs text-white shadow-lg`}
              >
                {creator.isChallenge ? creator.icon : ''}
              </div>
              <span className="text-xs text-white mt-1">{creator.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* The main Reels Feed Container */}
      <div ref={feedRef} className="reels-feed">
        {REELS_DATA.map((reel, index) => (
          <ReelItem
            key={reel.id}
            reel={reel}
            isVisible={index === currentReelIndex}
            onDoubleTap={() => setShowActionModal(true)}
            onFollow={handleFollow}
            onArTryOn={(item) => toast.success(`✨ AR Try-On activated for ${item}!`)}
            onOpen360={() => setShow360Modal(true)}
            onOpenShop={() => setShowActionModal(true)}
            followedCreators={followedCreators}
          />
        ))}
      </div>

      {/* Quick Reactions Bar */}
      <div className="quick-reactions-bar">
        {QUICK_REACTIONS.map((emoji) => (
          <button key={emoji} className="quick-react-btn" onClick={() => handleQuickReact(emoji)}>
            {emoji}
          </button>
        ))}
      </div>

      {/* Modals */}
      <ActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onBuyLook={handleBuyLook}
        onBookArtist={handleBookArtist}
        onSaveToVault={handleSaveToVault}
      />

      <GlowMenuModal
        isOpen={showGlowMenu}
        onClose={() => setShowGlowMenu(false)}
        onShowLeaderboard={() => {
          setShowGlowMenu(false);
          toast.info('📊 Creator Leaderboard (Simulated)');
        }}
        onShowGeoMap={() => {
          setShowGlowMenu(false);
          toast.info('🗺️ Geo Glow Map (Simulated)');
        }}
        onShowGlowClubs={() => {
          setShowGlowMenu(false);
          toast.info('👥 Glow Clubs (Simulated)');
        }}
      />

      <Product360Modal isOpen={show360Modal} onClose={() => setShow360Modal(false)} />

      <CreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onRecordComplete={handleRecordComplete}
        isFirstLaunch={isFirstLaunch}
      />

      <GlowScoreModal
        isOpen={showGlowScoreModal}
        onClose={() => setShowGlowScoreModal(false)}
        score={95}
        feedback="**AI Coach:** Content is high quality! You are currently Level Diamond! +5 Glow Score points potential!"
        onImprove={handleImproveReel}
      />
    </div>
  );
}
