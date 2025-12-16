import { useState, useEffect, useRef } from 'react';
import { Aperture, Lightbulb } from 'lucide-react';
import { Header } from './Header';
import { SpotlightSection } from './SpotlightSection';
import { FeedCard } from './FeedCard';
import { BottomNav } from './BottomNav';
import { FeatureModal } from './FeatureModal';
import { SpotlightModal } from './SpotlightModal';
import { toast } from 'sonner@2.0.3';

interface HomeScreenProps {
  onNavigateToMirror?: () => void;
  onNavigateToPhotoshoot?: () => void;
  onNavigateToChat?: () => void;
  onNavigateToReels?: () => void;
  onNavigateToShop?: () => void;
  onNavigateToInnovators?: () => void;
  onNavigateToProfile?: () => void;
}

export function HomeScreen({ onNavigateToMirror, onNavigateToPhotoshoot, onNavigateToChat, onNavigateToReels, onNavigateToShop, onNavigateToInnovators, onNavigateToProfile }: HomeScreenProps) {
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showSpotlightModal, setShowSpotlightModal] = useState(false);
  const [spotlightTitle, setSpotlightTitle] = useState('');
  const [feedCards, setFeedCards] = useState<number[]>([1]);
  const [isLoading, setIsLoading] = useState(false);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement>(null);

  const trendingTags = [
    { name: '#BridalGlow', color: 'text-purple-700' },
    { name: '#CollegeLook', color: 'text-pink-700' },
    { name: '#PartyMode', color: 'text-red-700' },
    { name: '#GroomingTips', color: 'text-blue-700' },
    { name: '#MustBuy', color: 'text-yellow-700' },
  ];

  useEffect(() => {
    // Setup intersection observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreContent();
        }
      },
      {
        root: feedContainerRef.current,
        rootMargin: '0px 0px 50px 0px',
        threshold: 0.1,
      }
    );

    if (loadingIndicatorRef.current) {
      observer.observe(loadingIndicatorRef.current);
    }

    return () => {
      if (loadingIndicatorRef.current) {
        observer.unobserve(loadingIndicatorRef.current);
      }
    };
  }, [isLoading]);

  const loadMoreContent = () => {
    if (isLoading) return;
    setIsLoading(true);

    setTimeout(() => {
      const newCards = [feedCards.length + 1, feedCards.length + 2, feedCards.length + 3];
      setFeedCards([...feedCards, ...newCards]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSpotlightClick = (title: string) => {
    setSpotlightTitle(title);
    setShowSpotlightModal(true);
  };

  const handleFeatureSelect = (feature: string) => {
    toast.success(`Launching ${feature}!`);
  };

  const handleZeroClickAction = (action: string) => {
    if (action.startsWith('#')) {
      toast.success(`Filtering feed by ${action}`);
    } else if (action === 'Try-On') {
      toast.success('Activating Glow Mirror... Look loading for Try-On!');
    } else if (action === 'Book Now') {
      toast.success('Booking modal opened. Artist schedule loading...');
    } else if (action === 'Quick View') {
      toast.success('Opening quick view overlay...');
    } else if (action === 'Like') {
      toast.success('💖 Liked!');
    }
  };

  const getMockCardData = (index: number) => {
    const isNight = index % 2 === 0;
    return {
      title: isNight ? `Night Party Vibe #${index}` : `Daytime Office Look #${index}`,
      description: `Dynamically loaded content: This look is highly relevant based on your current AI context (${
        isNight ? 'Night' : 'Day'
      } Mode).`,
      imageUrl: `https://placehold.co/600x400/${isNight ? 'FFD6E8' : 'EBD8FF'}/1f2937?text=${
        isNight ? 'Night+Party+Vibe' : 'Office+Look'
      }+${index}`,
      tag: isNight ? 'Night Trend' : 'Office Ready',
    };
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <Header onNavigateToProfile={onNavigateToProfile} />

      {/* Main Feed */}
      <main
        ref={feedContainerRef}
        className="feed-container flex-grow p-4 space-y-6 overflow-y-auto pb-28"
      >
        {/* Spotlight Section */}
        <SpotlightSection onSpotlightClick={handleSpotlightClick} />

        {/* Feed Title */}
        <h2 className="text-3xl text-gray-900 mb-4">✨ Infinity Glow Feed</h2>

        {/* Trending Tags */}
        <div className="tags-slider flex space-x-3 overflow-x-auto whitespace-nowrap py-2 mb-6">
          {trendingTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleZeroClickAction(tag.name)}
              className={`tag-glow px-4 py-2 text-sm rounded-full ${tag.color}`}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={onNavigateToPhotoshoot}
            className="hero-feature-glow p-4 rounded-2xl flex flex-col items-center justify-center h-32 shadow-2xl transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <Aperture className="w-8 h-8 text-pink-500 mb-1" />
            <span className="text-sm text-gray-800 text-center">Virtual Photoshoot</span>
            <span className="text-[10px] text-gray-600">New! Teleport</span>
          </button>

          <button
            onClick={onNavigateToInnovators}
            className="feed-card p-4 rounded-2xl flex flex-col items-center justify-center h-32 shadow-xl border-2 border-pink-200 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <Lightbulb className="w-8 h-8 text-purple-500 mb-1" />
            <span className="text-sm text-gray-800 text-center">Innovators Hub</span>
            <span className="text-[10px] text-gray-600">R&D Platform</span>
          </button>
        </div>

        {/* Feed Cards */}
        {feedCards.map((cardNum) => {
          const data = getMockCardData(cardNum);
          return (
            <FeedCard
              key={cardNum}
              title={data.title}
              description={data.description}
              imageUrl={data.imageUrl}
              tag={data.tag}
              onAction={handleZeroClickAction}
            />
          );
        })}
      </main>

      {/* Loading Indicator */}
      <div
        ref={loadingIndicatorRef}
        className={`flex justify-center items-center py-8 transition-opacity duration-300 ${
          isLoading ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        <p className="ml-3 text-gray-500">Loading next looks (AI sorting)...</p>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        onNavigateToMirror={onNavigateToMirror}
        onNavigateToChat={onNavigateToChat}
        onNavigateToReels={onNavigateToReels}
        onNavigateToShop={onNavigateToShop}
        onNavigateToHome={() => {
          // Already on home, just scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <FeatureModal
        isOpen={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
        onFeatureSelect={handleFeatureSelect}
      />

      <SpotlightModal
        isOpen={showSpotlightModal}
        onClose={() => setShowSpotlightModal(false)}
        title={spotlightTitle}
      />
    </div>
  );
}
