export type CreatorLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface ReelData {
  id: number;
  creator: string;
  tag: string;
  look: string;
  product?: string;
  gradient: string; // Changed from video to gradient
  verified: boolean;
  isAd?: boolean;
  skipReward?: number;
  adMsg?: string;
  level?: CreatorLevel;
  arItem?: string;
  outfitMatch?: string;
  is3D?: boolean;
  isNFT?: boolean;
}

// Gradient backgrounds for reels (simulating video content)
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

export const REELS_DATA: ReelData[] = [
  {
    id: 0,
    creator: 'GlowSponsor_Nike',
    tag: 'Glow Sponsor Reels',
    look: 'Air Max Collection',
    gradient: GRADIENTS[0],
    verified: true,
    isAd: true,
    skipReward: 1,
    adMsg: 'Tap to Skip & Earn +1 Glow Coin',
    level: 'Bronze',
  },
  {
    id: 1,
    creator: 'GlowPro_MUA',
    tag: 'Artist Reels',
    look: 'Bridal Glow',
    product: 'Red Velvet Lipstick',
    gradient: GRADIENTS[1],
    verified: true,
    arItem: 'Lipstick',
    outfitMatch: 'Golden Choker',
    is3D: false,
    isNFT: true,
    level: 'Diamond',
  },
  {
    id: 2,
    creator: 'User_DailyLook',
    tag: 'User Reels',
    look: 'Natural Look',
    product: 'Nude Lip Gloss',
    gradient: GRADIENTS[2],
    verified: false,
    arItem: 'Dress',
    outfitMatch: 'White Sneakers',
    is3D: false,
    isNFT: false,
    level: 'Silver',
  },
  {
    id: 3,
    creator: 'SapphireJewels',
    tag: 'Royal Look',
    product: 'Diamond Choker',
    gradient: GRADIENTS[3],
    verified: true,
    arItem: 'Jewelry',
    outfitMatch: 'Emerald Dress',
    is3D: true,
    isNFT: true,
    level: 'Platinum',
  },
  {
    id: 4,
    creator: 'TheFashionista',
    tag: 'Trending Glow',
    look: 'Party Glam',
    product: 'Emerald Dress',
    gradient: GRADIENTS[4],
    verified: false,
    arItem: 'Saree',
    outfitMatch: 'Crystal Heels',
    is3D: true,
    isNFT: false,
    level: 'Gold',
  },
];

export const QUICK_REACTIONS = ['💋', '🔥', '💎', '✨'];

export const MOODS = ['Happy 😊', 'Glamorous ✨', 'Confident 💪', 'Romantic 💕', 'Fierce 🔥'];

export const GRADIENT_COLORS = ['#0a0a0a', '#1a0a1a', '#0a1a1a', '#1a1a0a', '#100a12'];

export const CREATOR_SPOTLIGHT = [
  { name: 'Challenge', icon: '✨ NEW', color: 'bg-glow-pink', isChallenge: true },
  { name: 'Kriti 👑', verified: true, color: 'bg-gray-600', border: 'border-green-400' },
  { name: 'Arjun 💎', verified: true, color: 'bg-gray-600', border: 'border-green-400' },
  { name: 'Vibes', verified: false, color: 'bg-gray-600', border: 'border-gray-400' },
  { name: 'MUA', verified: false, color: 'bg-gray-600', border: 'border-gray-400' },
];
