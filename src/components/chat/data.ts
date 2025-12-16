import { Users, TrendingUp, Palette, Sun, Moon, Zap, Cloud, Globe, HardDrive } from 'lucide-react';

export type ChatTab = 'contacts' | 'messenger' | 'artist';
export type MessengerSubTab = 'primary' | 'requests';

export interface ChatUser {
  id: string;
  name: string;
  status: string;
  verified: boolean;
  lastMessage: string;
  tab: ChatTab;
  avatarColor: string;
  isHidden?: boolean;
  followers?: string;
  bio?: string;
  booking?: BookingData;
}

export interface BookingData {
  id: string;
  date: string;
  time: string;
  service: string;
  price: number;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  paidAdvance: boolean;
  rating: number;
}

export interface Message {
  id: string;
  text: string;
  action?: 'reaction' | 'ai_look' | 'ai_orb_request' | null;
  senderId: string;
  timestamp: number;
  isMine: boolean;
  status: 'sending' | 'sent' | 'seen';
  vanish?: boolean;
  autoDelete?: string;
}

export const THEMES = {
  contacts: {
    primary: 'bg-indigo-600',
    secondary: 'text-indigo-600',
    hover: 'hover:bg-indigo-700',
    bubble: 'from-purple-500 to-indigo-600',
    glowColor: 'shadow-purple-500/50',
    icon: Users,
    accent: 'bg-purple-100 text-purple-700',
    statusColor: 'text-indigo-400',
  },
  messenger: {
    primary: 'bg-pink-600',
    secondary: 'text-pink-600',
    hover: 'hover:bg-pink-700',
    bubble: 'from-pink-500 to-red-600',
    glowColor: 'shadow-pink-500/50',
    icon: TrendingUp,
    accent: 'bg-pink-100 text-pink-700',
    statusColor: 'text-pink-400',
  },
  artist: {
    primary: 'bg-amber-500',
    secondary: 'text-amber-500',
    hover: 'hover:bg-amber-600',
    bubble: 'from-amber-400 to-yellow-600',
    glowColor: 'shadow-amber-500/50',
    icon: Palette,
    accent: 'bg-amber-100 text-amber-700',
    statusColor: 'text-amber-400',
  },
};

export const GLOW_GRADIENT_HEADER = 'bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500';

export const BUBBLE_STYLES = {
  soft: 'rounded-tl-xl rounded-b-xl shadow-md',
  minimal: 'rounded-lg',
  bold: 'rounded-2xl shadow-xl border-4 border-white/50',
};

export const FONT_CLASSES = {
  'Glow Sans': 'font-sans',
  'Elegant Serif': 'font-serif',
  'Cute Script': 'font-["Caveat"]',
};

export const WALLPAPER_OPTIONS = {
  'Default Light': 'bg-gradient-to-b from-gray-50 to-white',
  'Dark Mode': 'bg-gray-900',
  'Sunset Gradient': 'bg-gradient-to-tr from-yellow-100 via-pink-100 to-purple-100',
  'Subtle Dots': 'bg-repeat bg-[size:10px_10px]',
};

export const APP_THEMES = [
  { id: 'light', name: 'Light Mode', icon: Sun, class: 'bg-white text-gray-800' },
  { id: 'dark', name: 'Dark Mode', icon: Moon, class: 'bg-gray-900 text-white' },
  { id: 'glow', name: 'Glow Mode', icon: Zap, class: 'bg-gradient-to-br from-pink-900 to-purple-900 text-white' },
];

export const TIMER_DURATIONS = ['Off', '24 hours', '7 days', '90 days'];
export const QUICK_EMOJIS = ['❤️', '🔥', '👏', '😮', '🤣', '👍'];
export const SMART_REPLIES = ['Sounds good!', 'What products should I bring?', 'When are you free tomorrow?', '💖'];

export const LANGUAGES = ['english', 'tamil', 'hindi'];
export const FONT_SIZES = ['small', 'medium', 'large'];
export const AI_MODES = ['friendly', 'professional', 'glamour'];
export const HAPTIC_STRENGTHS = ['off', 'low', 'high'];
export const MOTION_INTENSITIES = ['low', 'medium', 'high'];

export const MOCK_DATA = {
  contacts: [
    {
      id: 'priya_123',
      name: 'Priya (Skincare Buddy)',
      status: 'Online',
      verified: false,
      lastMessage: 'Hey beautiful! ✨',
      tab: 'contacts' as ChatTab,
      avatarColor: 'bg-purple-600',
    },
    {
      id: 'akila_456',
      name: 'Akila (Hair Guru)',
      status: 'Active 1h ago',
      verified: false,
      lastMessage: 'Sent a new product link.',
      tab: 'contacts' as ChatTab,
      avatarColor: 'bg-green-600',
    },
    {
      id: 'hidden_chat',
      name: 'Hidden Chat (Secret Diary)',
      status: 'Locked',
      verified: false,
      lastMessage: 'Tap to unlock with Face ID.',
      tab: 'contacts' as ChatTab,
      avatarColor: 'bg-black',
      isHidden: true,
    },
  ],
  messenger: {
    primary: [
      {
        id: 'anna_glow',
        name: 'Glow Influencer Anna',
        status: 'Active 2m ago',
        verified: true,
        lastMessage: 'Did you see the latest look?',
        tab: 'messenger' as ChatTab,
        followers: '1.2M',
        avatarColor: 'bg-pink-600',
        bio: 'Beauty Vlogger',
      },
      {
        id: 'vlogger_vijay',
        name: 'Beauty Vlogger Vijay',
        status: 'Online',
        verified: true,
        lastMessage: 'New video is live!',
        tab: 'messenger' as ChatTab,
        followers: '500K',
        avatarColor: 'bg-blue-600',
        bio: 'Style Expert',
      },
    ],
    requests: [
      {
        id: 'stranger_1',
        name: 'User 2024',
        status: 'Active recently',
        verified: false,
        lastMessage: 'Hi, can I collaborate?',
        tab: 'messenger' as ChatTab,
        avatarColor: 'bg-red-600',
        bio: 'Just a fan',
      },
    ],
  },
  artist: [
    {
      id: 'sara_makeup',
      name: 'Makeup Artist Sara',
      status: 'Online',
      verified: true,
      tab: 'artist' as ChatTab,
      avatarColor: 'bg-amber-600',
      booking: {
        id: 'bk001',
        date: 'Dec 15, 2025',
        time: '4:00 PM',
        service: 'Bridal Trial',
        price: 5000,
        location: 'Chennai',
        status: 'Confirmed' as const,
        paidAdvance: true,
        rating: 4.8,
      },
      lastMessage: 'Booking confirmed for 4 PM.',
    },
    {
      id: 'salon_mani',
      name: "Mani's Salon Team",
      status: 'Away',
      verified: true,
      tab: 'artist' as ChatTab,
      avatarColor: 'bg-teal-600',
      booking: undefined,
      lastMessage: 'Need to reschedule.',
    },
  ],
};

// Generate sample messages for demo
export const generateSampleMessages = (chatId: string): Message[] => {
  const messages: Message[] = [
    {
      id: '1',
      text: 'Hi! How are you doing today? 💖',
      senderId: 'other',
      timestamp: Date.now() - 300000,
      isMine: false,
      status: 'seen',
    },
    {
      id: '2',
      text: "I'm doing great! Just tried the new serum you recommended.",
      senderId: 'me',
      timestamp: Date.now() - 240000,
      isMine: true,
      status: 'seen',
    },
    {
      id: '3',
      text: 'Amazing! How does it feel? ✨',
      senderId: 'other',
      timestamp: Date.now() - 180000,
      isMine: false,
      status: 'seen',
    },
    {
      id: '4',
      text: "It's so smooth! My skin is glowing already. Thank you!",
      senderId: 'me',
      timestamp: Date.now() - 120000,
      isMine: true,
      status: 'seen',
    },
  ];

  return messages;
};
