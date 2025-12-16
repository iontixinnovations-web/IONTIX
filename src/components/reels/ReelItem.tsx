import { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, ShoppingBag, Video, Sparkles, CheckCircle, Play } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ReelData } from './data';

interface ReelItemProps {
  reel: ReelData;
  isVisible: boolean;
  onDoubleTap: () => void;
  onFollow: (creator: string) => void;
  onArTryOn: (item: string) => void;
  onOpen360: () => void;
  onOpenShop: () => void;
  followedCreators: Set<string>;
}

export function ReelItem({
  reel,
  isVisible,
  onDoubleTap,
  onFollow,
  onArTryOn,
  onOpen360,
  onOpenShop,
  followedCreators,
}: ReelItemProps) {
  const [showHeart, setShowHeart] = useState(false);
  const [showSmartBuy, setShowSmartBuy] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastTapRef = useRef(0);

  const isFollowing = followedCreators.has(reel.creator);

  useEffect(() => {
    if (isVisible) {
      setIsPlaying(true);
      // Show smart buy hint after a delay
      setTimeout(() => setShowSmartBuy(true), 1000);
    } else {
      setIsPlaying(false);
      setShowSmartBuy(false);
    }
  }, [isVisible]);

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? 'Unliked!' : '❤️ Liked!');
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Ignore clicks on interactive elements
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('a') ||
      (e.target as HTMLElement).classList.contains('smart-buy-btn')
    ) {
      return;
    }

    const now = Date.now();
    const delta = now - lastTapRef.current;

    if (delta > 0 && delta < 300) {
      // Double tap
      e.preventDefault();
      setShowHeart(true);
      handleLike();
      onDoubleTap();
      setTimeout(() => setShowHeart(false), 600);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const getLevelBadgeClass = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'bronze':
        return 'bg-[#CD7F32]';
      case 'silver':
        return 'bg-[#C0C0C0]';
      case 'gold':
        return 'bg-[#FFD700]';
      case 'platinum':
        return 'bg-[#E5E4E2]';
      case 'diamond':
        return 'bg-[#00BCD4]';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="reel-container" onClick={handleContainerClick}>
      {/* Gradient Background (simulating video) */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{ background: reel.gradient }}
      >
        {/* Play icon overlay when not "playing" */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/30 rounded-full p-6 backdrop-blur-sm">
              <Play className="w-16 h-16 text-white fill-current" />
            </div>
          </div>
        )}
        
        {/* Animated shimmer effect when "playing" */}
        {isPlaying && (
          <div className="reel-shimmer"></div>
        )}
      </div>

      {/* Ad Content */}
      {reel.isAd && (
        <>
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-[#8800FF]/70 text-white text-xs px-3 py-1 rounded-full z-20">
            GLOW SPONSOR REEL
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.success(`💰 Ad skipped! You earned +${reel.skipReward} Glow Coin!`);
            }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-full shadow-2xl transition duration-500 hover:scale-110 z-20"
          >
            {reel.adMsg}
          </button>
          <div className="absolute inset-0 bg-black/40 z-10"></div>
        </>
      )}

      {/* Smart Buy Button */}
      <button
        className={`smart-buy-btn ${showSmartBuy && !reel.isAd ? 'visible' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpenShop();
        }}
      >
        💡 AI Suggestion: Try **{reel.outfitMatch}** Look
      </button>

      {/* Overlay with content */}
      <div className="reel-overlay">
        {/* Creator Info */}
        <div className="flex-grow flex items-end">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-white/30 rounded-full border-2 border-white mr-2"></div>
              <span className="text-lg text-white">{reel.creator}</span>
              {reel.verified && (
                <CheckCircle className="w-4 h-4 ml-2 text-[#FF4081] fill-current" />
              )}
              {reel.level && (
                <span className={`level-badge ml-2 ${getLevelBadgeClass(reel.level)}`}>
                  {reel.level}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFollow(reel.creator);
                }}
                className={`ml-3 px-3 py-1 text-xs rounded-full transition ${
                  isFollowing
                    ? 'bg-gray-500 text-white'
                    : 'bg-[#FF4081] text-white hover:opacity-90'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              {reel.isNFT && (
                <span
                  className="ml-2 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info('NFT Look: View on Marketplace');
                  }}
                >
                  NFT ✨
                </span>
              )}
            </div>
            <p className="text-sm">
              #{reel.tag} | Trying the **{reel.look}** look.{' '}
              <span
                className="text-yellow-400 underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onArTryOn(reel.arItem || 'Item');
                }}
              >
                Try {reel.arItem || 'Item'} Now!
              </span>
            </p>
            <p className="text-xs text-gray-300 mt-1">🎶 Trending Audio - Love Today (Tap to change)</p>
          </div>
        </div>

        {/* Right Engagement Tools */}
        <div className="absolute bottom-2 right-4 flex flex-col items-center space-y-5">
          {/* Glow Live Collab */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Starting Glow Live Collab!');
            }}
            className="bg-red-500/80 text-white rounded-full p-2 shadow-xl hover:scale-105 transition duration-200 animate-pulse"
            title="Glow Live Collab"
          >
            <Video className="w-6 h-6" />
          </button>

          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button onClick={(e) => { e.stopPropagation(); handleLike(); }}>
              <Heart className={`w-8 h-8 cursor-pointer ${liked ? 'fill-current text-red-500' : 'text-white'}`} />
            </button>
            <span className="text-xs text-white">12.5K</span>
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.info('💬 Comments Drawer Opened. Share your thoughts!');
              }}
            >
              <MessageCircle className="w-8 h-8 cursor-pointer text-white" />
            </button>
            <span className="text-xs text-white">456</span>
          </div>

          {/* 360 View Button */}
          {reel.is3D && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen360();
              }}
              className="bg-gray-700/70 text-white rounded-full p-2 shadow-xl hover:scale-105 transition duration-200"
              title="360° Product View"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          )}

          {/* Shop Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenShop();
            }}
            className="bg-white text-black rounded-full p-2 shadow-xl hover:scale-105 transition duration-200"
            title="Shop The Look"
          >
            <ShoppingBag className="w-6 h-6" />
          </button>
        </div>

        {/* Double Tap Heart Feedback */}
        {showHeart && (
          <div className="double-tap-feedback">
            ❤️
          </div>
        )}
      </div>
    </div>
  );
}
