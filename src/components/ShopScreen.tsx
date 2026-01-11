import React, { useState, useEffect, useRef, useReducer, useMemo } from 'react';
import SellerPlatform from './SellerPlatform';
import { 
  ShoppingCart, MapPin, Zap, Sparkles, Scan, Layers, 
  ChevronRight, ShoppingBag, Mic, Fingerprint, 
  Building2, Users, Navigation2, ArrowRight, X, 
  Volume2, VolumeX, Music, Bell, ChevronUp, ChevronDown, Wind, Clock,
  Filter, Heart, Star, Camera, Box, Share2, ShieldCheck, Truck,
  Eye, Cpu, Ghost, Move3d, Radio, RefreshCw, User, Award, Trash2,
  Trophy, ThumbsUp, PackageCheck, Download, Search, TrendingUp,
  Gift, Crown, CreditCard, Tag, Store, MessageCircle, Briefcase,
  ArrowLeft, CheckSquare, ScanFace, Palette, Sun, Moon, CloudRain,
  AlertCircle, Wifi, Sunset, Loader2, Maximize, DollarSign, Send,
  Home, Ruler, UserPlus, PhoneCall, Percent, TrendingDown, LogOut, List,
  Video, MicOff, Baby
} from 'lucide-react';

  /*
    UI Design Specification: "Premium Futuristic Dark-Mode Shop Screen"

    Goal:
    - Recreate a premium, futuristic, dark-mode consumer app UI like a luxury AI shopping platform.
    - Feel: High-end, calm but powerful, Apple-level polish, production-ready.

    Layout Structure (Top → Bottom):

    1) Top Status / App Header
      - Brand name on left: MITHAS 2076 (thin, uppercase)
      - Accent color: neon pink
      - Subtext: location + node info in muted gray
      - Right-aligned monochrome, low-opacity icons (sound, wallet, cart)
      - Visual: floating HUD panel inside dark environment

    2) Live Activity Banner
      - Text: LIVE TRY-ON IN PROGRESS NEARBY
      - Full-width pill container, glassmorphism, left icon soft glow
      - Styling: translucent dark background, subtle white border, large radius

    3) Search Bar
      - Large rounded container with search icon inside
      - Placeholder low contrast, no harsh borders, tappable but calm
      - Feel like Apple Spotlight in dark mode

    4) Primary Action Cards (2-column): STYLE-GPT, MALL HANGOUT
      - Two equal cards in a row, large rounded corners
      - STYLE-GPT: pink→purple gradient, soft inner glow
      - MALL HANGOUT: blue→cyan gradient, calmer
      - Icons large but minimal, titles bold, subtitles lighter

    5) Neural Mirror Feature Card
      - Full-width horizontal card with left icon, stacked text, right chevron
      - Green/teal accent glow, quiet presence

    6) Secondary Navigation Card
      - Text: INTERACTIVE MALL MAP
      - Neutral dark glass card, subtle border, left icon, right chevron

    7) Bottom Voice Action (Center)
      - Floating circular mic button with pure white background and soft shadow
      - Elevated above bottom nav, centered

    8) Bottom Navigation Bar
      - Floating glass-effect bar with rounded edges
      - Icons spaced evenly; active icon neon accent, inactive low opacity

    Colors & Mood:
    - Background: deep navy → purple gradient (very dark, not pure black)
    - Accent: Pink (AI), Blue (Social), Green (Intelligence), White (primary)
    - Glow: soft, never harsh or over-bright

    UX Philosophy:
    - Effortless, uncluttered, breathable layout
    - No sharp corners, no bright white backgrounds, no cheap shadows

    Strict Don’ts:
    - No flat gray UI, no sharp corners, no dense text blocks, no harsh shadows

    Note: This block is a design guideline only — no functional code changes were made.
  */

// Use real Supabase client/helpers
import { supabase, isSupabaseConfigured, realtime } from '../lib/supabase';
import UserProfileMenu from './UserProfileMenu';

// --- CUSTOM TOAST IMPLEMENTATION ---
const ToastContainer = () => {
  const [toasts, setToasts] = useState<{id: number, message: string, type: string}[]>([]);

  useEffect(() => {
    (window as any).toast = {
      success: (msg: string) => addToast(msg, 'success'),
      error: (msg: string) => addToast(msg, 'error'),
      info: (msg: string) => addToast(msg, 'info'),
    };
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Find nearest vendor for a given product (prefers vendors with hasStock/inventory)
  const computeNearestVendorForProduct = (product: any, vendorsList: any[], loc: {lat:number; lon:number} | null) => {
    if (!vendorsList || vendorsList.length === 0) return null;
    // vendors may have product_ids or seller name matching; attempt a few heuristics
    const candidates = vendorsList.filter(v => (v.hasStock || (v.inventory && v.inventory[product.id]) || (v.inventory_count && v.inventory_count > 0) || (v.products && v.products.includes(product.id)) || (product.seller && (v.name === product.seller || v.shop_name === product.seller))));
    const listToUse = candidates.length ? candidates : vendorsList;
    if (loc) {
      const withDist = listToUse.map(v => ({ ...v, _distance_km: (v.lat != null && v.lon != null) ? computeDistanceKm(loc.lat, loc.lon, v.lat, v.lon) : (v.distance_km ?? Number.POSITIVE_INFINITY) }));
      withDist.sort((a,b) => (a._distance_km||0) - (b._distance_km||0));
      return withDist[0];
    }
    return listToUse[0];
  };

  return (
    <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`
          pointer-events-auto px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-right
          ${t.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-200' : ''}
          ${t.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : ''}
          ${t.type === 'info' ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' : ''}
        `}>
          <div className="flex items-center gap-2">
            {t.type === 'success' && <CheckSquare size={16} />}
            {t.type === 'error' && <AlertCircle size={16} />}
            {t.type === 'info' && <Sparkles size={16} />}
            <span className="text-xs font-bold uppercase tracking-wide">{t.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// UserProfileMenu is imported from ./UserProfileMenu

// --- MAIN SHOP SCREEN COMPONENT ---

interface ShopScreenProps {
  onNavigateBack?: () => void;
  onNavigateToSellerDashboard?: () => void;
}

// --- FALLBACK MOCK DATA (UPDATED WITH 6 FLOORS & SMART CATEGORIES) ---
const FALLBACK_DATA = {
  floors: [
    { id: 0, name: 'Ground Floor', displayName: 'Ground 1', category: 'Beauty', icon: '💄', color: 'from-pink-500 to-fuchsia-600', music: 'Lofi Beats', audio: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
    { id: 1, name: 'First Floor', displayName: 'Floor 1', category: 'Ethnic', icon: '👘', color: 'from-orange-500 to-red-600', music: 'Classical Veena', audio: 'https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3' },
    { id: 2, name: 'Second Floor', displayName: 'Floor 2', category: 'Western', icon: '👗', color: 'from-blue-500 to-indigo-600', music: 'Pop Hits', audio: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3' },
    { id: 3, name: 'Third Floor', displayName: 'Floor 3', category: 'Footwear', icon: '👠', color: 'from-slate-700 to-gray-900', music: 'Hip Hop', audio: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3' },
    { id: 4, name: 'Fourth Floor', displayName: 'Floor 4', category: 'Accessories', icon: '⌚', color: 'from-yellow-500 to-amber-600', music: 'Jazz', audio: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3' },
    { id: 5, name: 'Fifth Floor', displayName: 'Floor 5', category: 'Baby Care', icon: '🧸', color: 'from-green-400 to-emerald-600', music: 'Lullaby', audio: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3' }
  ],
  localVendors: [
    { id: 'V1', name: "Kanchipuram Emporium", distance_km: 1.2, trust_score: 4.8, verified_tag: true, votes: 1240, logo: '🏛️' },
    { id: 'V2', name: "Glow & Glam", distance_km: 0.8, trust_score: 4.9, verified_tag: true, votes: 980, logo: '✨' },
    { id: 'V3', name: "Karamadai Gold Hub", distance_km: 2.4, trust_score: 4.7, verified_tag: true, votes: 1560, logo: '👑' }
  ],
  products: [
    // --- FLOOR 0: BEAUTY ---
    { id: 101, name: 'Matte Lipstick Red', category: 'Beauty', gender: 'female', floor: 0, emoji: '💄', price: 899, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400', haptic: [30, 10], rating: 4.8, seller: 'GlowCo', shopLogo: '✨', liveViewers: 12 },
    { id: 102, name: 'Beard Oil Luxe', category: 'Beauty', gender: 'male', floor: 0, emoji: '🧔', price: 550, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400', haptic: [50, 50], rating: 4.5, seller: 'ManCave', shopLogo: '🎩', liveViewers: 8 },
    { id: 103, name: 'Baby Powder Soft', category: 'Beauty', gender: 'baby_girl', floor: 0, emoji: '👶', price: 299, image: 'https://images.unsplash.com/photo-1515488042361-ee00651a6a37?auto=format&fit=crop&w=400', haptic: [10, 10], rating: 4.9, seller: 'BabyBliss', shopLogo: '🧸', liveViewers: 15 },
    { id: 104, name: 'Charcoal Face Wash', category: 'Beauty', gender: 'male', floor: 0, emoji: '🧼', price: 399, image: 'https://images.unsplash.com/photo-1620917178330-802c67623a96?auto=format&fit=crop&w=400', haptic: [40, 40], rating: 4.6, seller: 'UrbanGlow', shopLogo: '✨', liveViewers: 10 },

    // --- FLOOR 1: ETHNIC ---
    { id: 201, name: 'Pure Silk Saree', category: 'Ethnic', gender: 'female', floor: 1, emoji: '👘', price: 12000, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400', haptic: [100, 100], material: 'silk', rating: 4.9, seller: 'Royal Weaves', shopLogo: '🏛️', liveViewers: 34, ar: true },
    { id: 202, name: 'Designer Sherwani', category: 'Ethnic', gender: 'male', floor: 1, emoji: '🧥', price: 8500, image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=400', haptic: [80, 80], material: 'silk', rating: 4.8, seller: 'Royal Men', shopLogo: '🏛️', liveViewers: 22 },
    { id: 203, name: 'Boy Kids Dhoti Set', category: 'Ethnic', gender: 'boy', floor: 1, emoji: '👶', price: 1500, image: 'https://images.unsplash.com/photo-1609109230303-9993306c2921?auto=format&fit=crop&w=400', haptic: [40, 40], material: 'cotton', rating: 4.7, seller: 'Little Stars', shopLogo: '⭐', liveViewers: 9 },

    // --- FLOOR 2: WESTERN ---
    { id: 301, name: 'Slim Fit Jeans', category: 'Western', gender: 'male', floor: 2, emoji: '👖', price: 2400, image: 'https://images.unsplash.com/photo-1542272617-08f083d03341?auto=format&fit=crop&w=400', haptic: [70, 70], material: 'denim', rating: 4.6, seller: 'DenimHub', shopLogo: '👖', liveViewers: 18 },
    { id: 302, name: 'Floral Summer Dress', category: 'Western', gender: 'female', floor: 2, emoji: '👗', price: 1800, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400', haptic: [50, 30], material: 'cotton', rating: 4.7, seller: 'ChicStyle', shopLogo: '👗', liveViewers: 25 },
    { id: 303, name: 'Baby Girl Onesie', category: 'Western', gender: 'baby_girl', floor: 2, emoji: '👶', price: 750, image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=400', haptic: [20, 20], material: 'cotton', rating: 4.9, seller: 'BabyBliss', shopLogo: '🧸', liveViewers: 11 },

    // --- FLOOR 3: FOOTWEAR ---
    { id: 401, name: 'High Heels Gold', category: 'Footwear', gender: 'female', floor: 3, emoji: '👠', price: 3200, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400', haptic: [80, 20], material: 'leather', rating: 4.7, seller: 'StepUp', shopLogo: '👠', liveViewers: 20 },
    { id: 402, name: 'Sport Sneakers', category: 'Footwear', gender: 'male', floor: 3, emoji: '👟', price: 4500, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400', haptic: [60, 60], material: 'synthetic', rating: 4.8, seller: 'RunFast', shopLogo: '👟', liveViewers: 28 },
    { id: 403, name: 'Kids Light Shoes', category: 'Footwear', gender: 'boy', floor: 3, emoji: '👟', price: 1200, image: 'https://images.unsplash.com/photo-1514989940723-e8875ea6ab7d?auto=format&fit=crop&w=400', haptic: [40, 20], rating: 4.6, seller: 'LittleSteps', shopLogo: '👣', liveViewers: 14 },

    // --- FLOOR 4: ACCESSORIES ---
    { id: 501, name: 'Luxury Chrono Watch', category: 'Accessories', gender: 'male', floor: 4, emoji: '⌚', price: 5500, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400', haptic: [90, 90], material: 'metal', rating: 4.9, seller: 'TimeKeepers', shopLogo: '⌚', liveViewers: 30 },
    { id: 502, name: 'Golden Choker', category: 'Accessories', gender: 'female', floor: 4, emoji: '👑', price: 2499, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400', haptic: [70, 30], material: 'gold', rating: 4.9, seller: 'Royal Jewels', shopLogo: '💎', liveViewers: 45 },
    { id: 503, name: 'School Backpack', category: 'Accessories', gender: 'unisex', floor: 4, emoji: '🎒', price: 1500, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400', haptic: [50, 50], material: 'nylon', rating: 4.7, seller: 'BagZone', shopLogo: '🎒', liveViewers: 12 },

    // --- FLOOR 5: BABY CARE ---
    { id: 601, name: 'Plush Teddy Bear', category: 'Baby Care', gender: 'unisex', floor: 5, emoji: '🧸', price: 899, image: 'https://images.unsplash.com/photo-1559454403-b8fb87521bc7?auto=format&fit=crop&w=400', haptic: [20, 10], material: 'cotton', rating: 5.0, seller: 'ToyLand', shopLogo: '🧸', liveViewers: 18 },
    { id: 602, name: 'Diaper Pack XL', category: 'Baby Care', gender: 'unisex', floor: 5, emoji: '👶', price: 1200, image: 'https://images.unsplash.com/photo-1574315042621-5039218d6ee6?auto=format&fit=crop&w=400', haptic: [10, 10], rating: 4.8, seller: 'CarePlus', shopLogo: '👶', liveViewers: 22 },
    { id: 603, name: 'Baby Feeding Set', category: 'Baby Care', gender: 'baby_girl', floor: 5, emoji: '🍼', price: 650, image: 'https://images.unsplash.com/photo-1595246759086-63570415a77b?auto=format&fit=crop&w=400', haptic: [30, 30], material: 'plastic', rating: 4.6, seller: 'CarePlus', shopLogo: '👶', liveViewers: 9 }
  ],
  liveActivity: [
    "Low stock in Node-42 (Karamadai)",
    "Live try-on in progress nearby",
    "3 orders placed in last 5 min"
  ]
};

const cartReducer = (state: any[], action: any) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existing = state.find(item => item.id === action.payload.id);
      if (existing) return state.map(item => item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...state, { ...action.payload, quantity: 1 }];
    case 'UPDATE_QTY':
      return state.map(item => item.id === action.id ? { ...item, quantity: Math.max(1, item.quantity + action.delta) } : item);
    case 'REMOVE_FROM_CART': return state.filter(item => item.id !== action.id);
    case 'CLEAR_CART': return [];
    default: return state;
  }
};

const toast = {
  success: (msg: string) => (window as any).toast?.success(msg),
  error: (msg: string) => (window as any).toast?.error(msg),
  info: (msg: string) => (window as any).toast?.info(msg),
};

const [userProfile, setUserProfile] = useState<any>(null);

useEffect(() => {
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(data);
    }
  };
  fetchProfile();
}, []);


export default function ShopScreen({ onNavigateBack, onNavigateToSellerDashboard }: ShopScreenProps) {
  const [gender, setGender] = useState<string | null>(null);
  const [page, setPage] = useState('mall');
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [glowPoints, setGlowPoints] = useState(2500);
  const [activeFloor, setActiveFloor] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isElevating, setIsElevating] = useState(false);
  const [targetFloor, setTargetFloor] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDroneDelivering, setIsDroneDelivering] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showStoreFront, setShowStoreFront] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [lightingMode, setLightingMode] = useState<'day' | 'night' | 'party'>('day');
  const [showMallMap, setShowMallMap] = useState(false);
  const [arCapturedImage, setArCapturedImage] = useState<string | null>(null);
  const [liveActivityIndex, setLiveActivityIndex] = useState(0);
  const [elevatorDirection, setElevatorDirection] = useState<'up' | 'down'>('up');
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [privacyShield, setPrivacyShield] = useState(false);
  const [wardrobeIndex, setWardrobeIndex] = useState(0);
  
  // Real-time data from Supabase
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lon: number} | null>(null);
  const [nearbyVendors, setNearbyVendors] = useState<any[]>([]);
  
  // NEW KILLER FEATURES STATE
  // 1. Neural Size-Sync Scanner
  const [showBodyScanner, setShowBodyScanner] = useState(false);
  const [bodyScanProgress, setBodyScanProgress] = useState(0);
  const [userBodyMesh, setUserBodyMesh] = useState<any>(null);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  
  // 2. Multi-User Mall Hangout (VIDEO CALL ENHANCED)
  const [showShoppingRoom, setShowShoppingRoom] = useState(false);
  const [shoppingRoomId, setShoppingRoomId] = useState<string | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<any[]>([]);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  
  // 3. Style-GPT Assistant
  const [showStyleGPT, setShowStyleGPT] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  
  // 4. Glow Bid (Live Bargaining)
  const [showBidModal, setShowBidModal] = useState(false);
  const [userOffer, setUserOffer] = useState('');
  const [vendorCounterOffer, setVendorCounterOffer] = useState<number | null>(null);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  
  // 5. XR Try-Before-Buy (Home Placement)
  const [showHomeAR, setShowHomeAR] = useState(false);
  const [arPlacementMode, setArPlacementMode] = useState<'wardrobe' | 'wall' | 'table'>('wardrobe');
  const [hasShownDemoTip, setHasShownDemoTip] = useState(false);
  
  // 6. Fabric X-Ray & Smart Mirror
  const [showFabricXRay, setShowFabricXRay] = useState(false);
  const [fabricDetails, setFabricDetails] = useState<any>(null);
  const [showSmartMirrorDashboard, setShowSmartMirrorDashboard] = useState(false);
  const [mirrorAnalysis, setMirrorAnalysis] = useState<any>(null);
  const [recommendedOutfit, setRecommendedOutfit] = useState<any[]>([]);
  const [selectedWardrobeImage, setSelectedWardrobeImage] = useState<string>("");
  const [deliveryProgress, setDeliveryProgress] = useState(0);

  // ========== NEW GLOBAL FEATURES ==========
  // Virtual Try-On (VTO)
  const [vtoMode, setVtoMode] = useState<'face'|'body'|'accessory'|'foot'|null>(null);
  const [neuralScanStatus, setNeuralScanStatus] = useState<'none'|'scanned'|'processing'>('none');

  // Reels deep-link / bundles
  const [deepLinkProductId, setDeepLinkProductId] = useState<string | number | null>(null);

  // Selected vendor for product / deep-link flows
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);

  // Skin tone scan overlay
  const [showSkinToneScan, setShowSkinToneScan] = useState(false);
  const [skinToneScanInProgress, setSkinToneScanInProgress] = useState(false);

  // Unified Active Chat Module: 'style' | 'vendor' | 'logistics'
  const [activeChatModule, setActiveChatModule] = useState<'style'|'vendor'|'logistics'|null>(null);

  // i18n / currency
  const [locale, setLocale] = useState<'en'|'ta'|'hi'|'es'>('en');
  const [currency, setCurrency] = useState<'INR'|'USD'|'EUR'>('INR');

  // Simple i18n helper (local file fallback)
  const translations: Record<string, Record<string,string>> = {
    en: {
      neural_scan: 'Neural Body Scan',
      lipstick_mode: 'Lipstick AR Mode',
      add_to_cart: 'Add to Cart',
      inject_to_bag: 'Inject to Bag',
      try_on: 'Try On (VTO)',
      feel_material: 'Feel Material',
      buy_the_look: 'Buy the Look',
      ar_mode: 'AR Simulation Mode',
      location_enabled: 'Location enabled — showing nearby shops'
    }
  };
  const t = (key: string) => translations[locale]?.[key] || key;

  const formatPrice = (amount?: number | null) => {
    if (amount == null) return '-';
    try {
      const opts: Intl.NumberFormatOptions = { style: 'currency', currency: currency === 'INR' ? 'INR' : currency };
      return new Intl.NumberFormat(locale === 'en' ? 'en-IN' : locale, opts).format(amount);
    } catch (e) { return `${amount}`; }
  };

  // Chat modules placeholders
  const [showAdminChat, setShowAdminChat] = useState(false);
  const [showLogisticsChat, setShowLogisticsChat] = useState(false);
  const [showAIChatModule, setShowAIChatModule] = useState(false);

  // Beauty enhancements
  const [skinAnalysis, setSkinAnalysis] = useState<any>(null);

  // Dynamic background music (URL)
  const [bgmTrackUrl, setBgmTrackUrl] = useState<string | null>(null);

  // Haptic helper available flag
  const hasHaptics = typeof navigator !== 'undefined' && !!(navigator as any).vibrate;
  
  // User Profile Menu
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef(new Audio());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isSupabaseReady = isSupabaseConfigured();

  // Floor configuration (static)
  const floors = FALLBACK_DATA.floors;

  // --- INITIALIZE USER SESSION ---
  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          // Fetch user's glow points from profiles table
          try {
            const { data: profile } = await supabase.from('profiles').select('glow_points').eq('id', user.id).single();
            if (profile && profile.glow_points != null) {
              setGlowPoints(profile.glow_points || 2500);
            }
          } catch (e) {
            console.warn('Could not fetch profile glow_points', e);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

      initUser();
      // attempt to get location silently (will prompt user if not allowed)
      try {
        if (navigator && (navigator as any).geolocation) {
          (navigator as any).geolocation.getCurrentPosition((pos: any) => {
            setCurrentLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          }, () => {}, { enableHighAccuracy: false, maximumAge: 1000 * 60 * 5 });
        }
      } catch (e) {}
  }, []);

  // --- FETCH PRODUCTS FROM SUPABASE ---
  useEffect(() => {
    const fetchProducts = async () => {
      if (!isSupabaseReady) {
        // Supabase not configured: don't run demo fallback data. Keep lists empty.
        setProducts([]);
        setVendors([]);
        setIsLoading(false);
        console.warn('Supabase not configured; ShopScreen running without backend');
        return;
      }

      try {
        // Fetch products and vendors from Supabase
        const [{ data: prodData, error: prodErr }, { data: vendorData, error: vendorErr }] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('vendors').select('*')
        ]);

        if (prodErr) throw prodErr;
        if (vendorErr) throw vendorErr;

        const prods = prodData || [];
        const vends = vendorData || [];
        setProducts(prods);
        setVendors(vends);
        // compute nearby vendors if we have location
        if (currentLocation) {
          const nearby = computeNearbyVendors(vends, currentLocation, 10);
          setNearbyVendors(nearby);
        }
        setIsLoading(false);

        // Subscribe to realtime changes for products and vendors
        const prodChannel = realtime.subscribe('products', (payload: any) => {
          try {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            if (eventType === 'INSERT') setProducts(prev => [newRecord, ...prev]);
            else if (eventType === 'UPDATE') setProducts(prev => prev.map(p => (p.id === newRecord.id ? newRecord : p)));
            else if (eventType === 'DELETE') setProducts(prev => prev.filter(p => p.id !== oldRecord.id));
          } catch (e) { console.warn('Realtime products handler error', e); }
        });

        const vendorChannel = realtime.subscribe('vendors', (payload: any) => {
          try {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            if (eventType === 'INSERT') setVendors(prev => [newRecord, ...prev]);
            else if (eventType === 'UPDATE') setVendors(prev => prev.map(v => (v.id === newRecord.id ? newRecord : v)));
            else if (eventType === 'DELETE') setVendors(prev => prev.filter(v => v.id !== oldRecord.id));
            // update nearby vendors dynamically if location available
            try {
              if (currentLocation) {
                setNearbyVendors(prev => computeNearbyVendors([...(eventType === 'INSERT' ? [newRecord] : []), ...vendors], currentLocation, 10));
              }
            } catch (e) {}
          } catch (e) { console.warn('Realtime vendors handler error', e); }
        });

        // After initial load: handle deep-link from Reels (e.g. ?reel=PRODUCT_ID)
        try {
          const params = new URLSearchParams(window.location.search);
          const reel = params.get('reel');
          if (reel) {
            const pid = isNaN(Number(reel)) ? reel : Number(reel);
            const found = prods.find((p: any) => p.id === pid || p.productId === pid);
            if (found) {
              // Prioritize nearby vendors with hasStock & distance < 10km
              const nearby = vends.filter((v: any) => (v.hasStock || v.inventory_count > 0) && (v._distance_km == null || v._distance_km < 10));
              if (nearby.length) setVendors(prev => [...nearby, ...prev.filter((v:any)=>!nearby.includes(v))]);
              setDeepLinkProductId(pid);
              setSelectedProduct(found);
              // compute nearest vendor for the product
              try {
                const nearest = computeNearestVendorForProduct(found, vends, currentLocation);
                if (nearest) setSelectedVendor(nearest);
              } catch (e) {}
              navigateTo('product');
            }
          }
        } catch (e) { console.warn('deep link handling failed', e); }

        return () => {
          try { realtime.unsubscribe(prodChannel); } catch (e) {}
          try { realtime.unsubscribe(vendorChannel); } catch (e) {}
        };
      } catch (error) {
        console.error('Error fetching products/vendors:', error);
        setProducts([]);
        setVendors([]);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isSupabaseReady]);
useEffect(() => {
  const syncWithSupabase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(profile);

      const { data: seller } = await supabase
        .from('sellers')
        .select('onboarding_status')
        .eq('user_id', user.id)
        .single();
      
      if (seller?.onboarding_status === 'completed') {
        setPage('seller-dashboard');
      }
    }
  };
  syncWithSupabase();
}, []);

  



  // Live Activity Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveActivityIndex((prev) => (prev + 1) % FALLBACK_DATA.liveActivity.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- AUDIO AMBIENCE ---
  useEffect(() => {
    if (!gender || !isAudioEnabled) {
      audioRef.current.pause();
      return;
    }
  }, [activeFloor, gender, isAudioEnabled]);

  // Dynamic BGM based on floor
  useEffect(() => {
    setBGMForFloor(activeFloor);
  }, [activeFloor]);

  // --- LOGIC: SMART GENDER FILTER ---
  // This is the core logic you requested
  const getFilteredProducts = () => {
    const base = products.filter((p) => {
      // 1. Gender Grouping
      // FemNode: female + girl + baby_girl + unisex
      const isFemalePath = gender === 'female' && ['female', 'girl', 'baby_girl', 'unisex'].includes(p.gender);
      // MaleNode: male + boy + baby_boy + unisex
      const isMalePath = gender === 'male' && ['male', 'boy', 'baby_boy', 'unisex'].includes(p.gender);

      // 2. Floor Matching
      const isCorrectFloor = p.floor === activeFloor;

      // 3. Search Matching
      const isSearchMatch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Combine conditions
      return (isFemalePath || isMalePath) && isCorrectFloor && isSearchMatch;
    });

    // If we have nearby vendors, prioritize products that are available nearby (heuristic: seller matches vendor.name or vendor.products include id)
    if (nearbyVendors && nearbyVendors.length) {
      const nearbyNames = nearbyVendors.map(v => v.name);
      const preferred: any[] = [];
      const others: any[] = [];
      base.forEach(p => {
        const byName = p.seller && nearbyNames.includes(p.seller);
        const byVendorId = nearbyVendors.some(v => v.products && v.products.includes(p.id));
        if (byName || byVendorId) preferred.push(p); else others.push(p);
      });
      return [...preferred, ...others];
    }

    return base;
  };

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    // Auto-navigate to first relevant floor (Fashion is usually floor 1)
    if(selectedGender === 'male') {
       toast.success("Welcome to MaleNode: Men, Boys & Baby Boys");
    } else {
       toast.success("Welcome to FemNode: Women, Girls & Baby Girls");
    }
    handleFloorChange(1);
  }

  // --- VOICE COMMANDS ---
  const startVoiceCommand = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
        setIsListening(false);
        const samples = ['fashion floor', 'makeup', 'ai stylist'];
        const recognized = samples[Math.floor(Math.random() * samples.length)];
        toast.info(`🎤 Recognized: "${recognized}"`);
        handleVoiceResult(recognized);
        (async () => {
          try {
            if (isSupabaseReady && currentUserId) {
              await supabase.from('support_requests').insert({ user_id: currentUserId, type: 'voice_command', payload: { text: recognized }, created_at: new Date().toISOString() });
            }
          } catch (e) { console.warn('voice log failed', e); }
        })();
    }, 1200);
  };

  const handleVoiceResult = (text: string) => {
    const t = text.toLowerCase();
    if (t.includes('fashion')) {
      toast.success('Navigating to Fashion Floor');
      handleFloorChange(1);
    } else if (t.includes('makeup')) {
      toast.success('Opening AR Try-On (Makeup)');
      setVtoMode('face');
      openChatModule && openChatModule('style');
      setShowSmartMirrorDashboard(true);
    } else if (t.includes('ai') || t.includes('stylist')) {
      toast.success('Calling AI Stylist');
      openChatModule && openChatModule('style');
    }
  };

  const handleFloorChange = (floorId: number) => {
    if (floorId === activeFloor || isElevating) return;
    setTargetFloor(floorId);
    setElevatorDirection(floorId > activeFloor ? 'up' : 'down');
    setIsElevating(true);
    setIsWardrobeOpen(false);
    
    setTimeout(() => {
      setActiveFloor(floorId);
      setIsElevating(false);
      const d = floors[floorId]?.displayName || floors[floorId]?.name || `Floor ${floorId}`;
      toast.success(`Arrived at ${d}: ${floors[floorId].category}`);
    }, 2500);
  };

  // Chat module helpers
  const openChatModule = (module: 'style'|'vendor'|'logistics') => {
    setActiveChatModule(module);
    // keep legacy toggles in sync
    if (module === 'style') setShowStyleGPT(true);
    if (module !== 'style') setShowStyleGPT(false);
    if (module === 'vendor') setShowAdminChat(true); else setShowAdminChat(false);
    if (module === 'logistics') setShowLogisticsChat(true); else setShowLogisticsChat(false);
  };

  const logOpenStyleGPT = async () => {
    setShowStyleGPT(true);
    try {
      if (isSupabaseReady && currentUserId) {
        await supabase.from('support_requests').insert({ user_id: currentUserId, type: 'assistant_open', payload: { module: 'style' }, created_at: new Date().toISOString() });
      }
    } catch (e) { console.warn('logOpenStyleGPT failed', e); }
  };

  const closeChatModule = () => {
    setActiveChatModule(null);
    setShowStyleGPT(false);
    setShowAdminChat(false);
    setShowLogisticsChat(false);
  };

  // --- LOCATION / NEARBY VENDORS HELPERS ---
  const computeDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const computeNearbyVendors = (vendorsList: any[], loc: {lat: number; lon: number}, maxKm = 10) => {
    const withDistance = vendorsList.map(v => {
      if (v.lat != null && v.lon != null) {
        const d = computeDistanceKm(loc.lat, loc.lon, v.lat, v.lon);
        return { ...v, _distance_km: d };
      }
      if (v.distance_km != null) return { ...v, _distance_km: v.distance_km };
      return { ...v, _distance_km: Number.POSITIVE_INFINITY };
    });
    return withDistance.filter(v => v._distance_km <= maxKm).sort((a,b) => (a._distance_km || 0) - (b._distance_km || 0));
  };

  const requestLocation = () => {
    if (!(navigator as any).geolocation) {
      toast.error('Geolocation not supported by this browser');
      return;
    }
    (navigator as any).geolocation.getCurrentPosition((pos: any) => {
      const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setCurrentLocation(loc);
      // update nearby vendors from current vendors list
      setNearbyVendors(computeNearbyVendors(vendors, loc, 10));
      toast.success('Location enabled — showing nearby shops');
    }, (err: any) => {
      console.warn('Location denied', err);
      toast.info('Location access denied');
    }, { enableHighAccuracy: false, timeout: 10000 });
  };

  const openAR = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      toast.success('📸 Camera activated!');
    } catch (err) { 
      setIsCameraOpen(false);
      toast.info("📱 Camera not available. Using AR simulation mode");
      setTimeout(() => {
        toast.success("✨ AR Try-On simulation active!");
        setIsCameraOpen(true);
      }, 500);
    }
  };

  const closeAR = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraOpen(false);
    setArCapturedImage(null);
  };

  const captureLook = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setArCapturedImage(imageData);
        toast.success("Look captured! ✨");
      }
    } else {
        // Mock capture
        setArCapturedImage(selectedProduct?.image);
        toast.success("Look captured! ✨");
    }
  };

  const shareArLook = () => {
    if (arCapturedImage) {
      toast.success("Shared to social! 📱");
      setGlowPoints(prev => prev + 50);
      // Persist try-on/share to backend (best-effort)
      (async () => {
        try {
          if (isSupabaseReady && currentUserId) {
            await supabase.from('try_ons').insert({ user_id: currentUserId, product_id: selectedProduct?.id || null, image: arCapturedImage, shared_at: new Date().toISOString() });
          }
        } catch (e) { console.warn('shareArLook save failed', e); }
      })();
    }
  };

  const handleCheckout = async () => {
    const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const isBundle = totalItems > 1;
    const bonusPoints = isBundle ? 100 : 50;

    setGlowPoints(prev => prev + bonusPoints);
    if (isBundle) {
        toast.success(`Bundle bonus! +${bonusPoints} Glow Points 🎁`);
    }
    // Persist order to backend (best-effort)
    try {
      if (isSupabaseReady && currentUserId) {
        const items = cart.map(it => ({ product_id: it.id, name: it.name, price: it.price, quantity: it.quantity || 1 }));
        const total = items.reduce((s: number, it: any) => s + (it.price || 0) * (it.quantity || 1), 0);
        await supabase.from('orders').insert({ user_id: currentUserId, items, total_amount: total, currency, status: 'placed', created_at: new Date().toISOString() });
      }
    } catch (e) { console.warn('order persist failed', e); }

    setIsDroneDelivering(true);
    startDroneTracking();
    toast.success("Order placed successfully! 🚁");
    startHapticPulse([40,20,40]);
    
    setTimeout(() => {
        setIsDroneDelivering(false);
        dispatch({ type: 'CLEAR_CART' });
      navigateTo('mall');
        toast.success("Package delivered!");
        startHapticPulse([30,60,30]);
    }, 5000);
  };

  const handleProductTap = (product: any) => {
    const shop = vendors.find(v => v.name === product.seller);
    if (shop) {
      setSelectedShop(shop);
      setShowStoreFront(true);
      setTimeout(() => {
        setShowStoreFront(false);
        setSelectedProduct(product);
        navigateTo('product');
      }, 1500);
    } else {
      setSelectedProduct(product);
      navigateTo('product');
    }
    // Log product view for analytics/backend (best-effort)
    (async () => {
      try {
        if (isSupabaseReady && currentUserId) {
          await supabase.from('product_views').insert({ user_id: currentUserId, product_id: product.id, vendor: product.seller || null, viewed_at: new Date().toISOString() });
        }
      } catch (e) { console.warn('product view log failed', e); }
    })();
  };

  const voteForShop = async (shopId: string) => {
    setVendors(prev => prev.map(v => v.id === shopId ? { ...v, votes: (v.votes || 0) + 1 } : v));
    setGlowPoints(prev => prev + 10);
    toast.success(`Voted for shop! +10 GP`);
    // Persist vote to Supabase (best-effort)
    try {
      if (isSupabaseReady && currentUserId) {
        await supabase.from('vendor_votes').insert({ user_id: currentUserId, vendor_id: shopId, voted_at: new Date().toISOString() });
        // Best-effort vendor counter update
        try {
          const v = vendors.find(x => x.id === shopId);
          const newVotes = (v?.votes || 0) + 1;
          await supabase.from('vendors').update({ votes: newVotes }).eq('id', shopId);
        } catch (e) {}
      }
    } catch (e) { console.warn('vote persist failed', e); }
  };

  // ==================== FEATURES LOGIC ====================
  
  const startBodyScan = async () => {
    setShowBodyScanner(true);
    setBodyScanProgress(0);
    toast.info('📐 Activating Neural Body Mesh Scanner...');
    const scanInterval = setInterval(() => {
      setBodyScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          const mockBodyData = { height: 165 + Math.random() * 15 };
          setUserBodyMesh(mockBodyData);
          setRecommendedSize('M');
          toast.success(`✨ Size M fits 96% of your body mesh!`);
          (async () => {
            try {
              if (isSupabaseReady && currentUserId) {
                await supabase.from('body_scans').insert({ user_id: currentUserId, scan_data: mockBodyData, completed_at: new Date().toISOString() });
              }
            } catch (e) { console.warn('body scan persist failed', e); }
          })();
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  };

  const createShoppingRoom = async () => {
    const roomId = `room_${Date.now()}`;
    setShoppingRoomId(roomId);
    setShowShoppingRoom(true);
    toast.success('🎉 Shopping Room Created! Share the link with friends');
    setGlowPoints(prev => prev + 25);
    (async () => {
      try {
        if (isSupabaseReady && currentUserId) {
          await supabase.from('support_requests').insert({ user_id: currentUserId, type: 'shopping_room', payload: { roomId }, created_at: new Date().toISOString() });
        }
      } catch (e) { console.warn('create shopping room save failed', e); }
    })();
  };

  const toggleVoiceChat = () => {
    setIsVoiceChatActive(!isVoiceChatActive);
    if (!isVoiceChatActive) {
      toast.info('🎤 Voice chat activated');
    } else {
      toast.info('🔇 Voice chat muted');
    }
  };

  const initializeVideoCall = async () => {
    try {
      setIsVideoCallActive(true);
      toast.success("📹 Video call started!");
      if (localVideoRef.current) {
        toast.info("Using simulated video stream");
      }
    } catch (error) {
      toast.error("Failed to start video call");
    }
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
    toast.info("📹 Video call ended");
  };

  const sendMessageToStyleGPT = async () => {
    if (!userInput.trim()) return;
    const context = {
      gender,
      floor: activeFloor,
      scan_status: neuralScanStatus,
      weather: 'unknown', // placeholder — integrate weather API if available
      glowPoints,
      locale,
    };

    const userMessage = { role: 'user', content: userInput, timestamp: Date.now(), context };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAITyping(true);

    setTimeout(() => {
      let aiResponse = '';
      const input = userInput.toLowerCase();
      // Context-aware suggestions
      if (input.includes('wedding') || input.includes('function')) {
        aiResponse = `✨ Based on your location and profile (Floor ${activeFloor}), I recommend:\n\n1. Kanchipuram Silk Saree (Floor 1)\n2. Temple Jewelry Set (Floor 4)\n\n💡 Bundle & Save: ₹14,499. Should I add this bundle to your cart?`;
        setTimeout(() => toast.success('🎯 AI curated 3 products for you!'), 1000);
      } else if (neuralScanStatus === 'scanned' && input.includes('size')) {
        const suggested = mapSize(recommendedSize || 'M');
        aiResponse = `Based on your Neural Scan, recommended size is ${recommendedSize} (${suggested}). I recommend choosing ${suggested} for comfortable fit.`;
      } else {
        aiResponse = `I understand you're looking for "${userMessage.content}". Using context: ${JSON.stringify(context)} — searching Neural Index...\n\n🔍 Found matching items.`;
      }

      const aiMessage = { role: 'assistant', content: aiResponse, timestamp: Date.now() };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAITyping(false);
    }, 1200);
  };

  // ====== SUPPORT HELPERS ======
  const convertCurrency = (amount: number, to: 'INR'|'USD'|'EUR') => {
    // Placeholder conversion rates; integrate real FX API as needed
    const rates: any = { INR: 1, USD: 0.012, EUR: 0.011 };
    return Math.round(amount * (rates[to] || 1));
  };

  const mapSize = (size: string) => {
    // Primitive mapping: maps M/L etc. to international sizing
    if (!size) return 'M';
    const map: any = { XS: 'US 2 / EU 32', S: 'US 4-6 / EU 34-36', M: 'US 8-10 / EU 38-40', L: 'US 12 / EU 42', XL: 'US 14 / EU 44' };
    return map[size] || size;
  };

  const startVTO = (product: any) => {
    if (!product) return;
    // Determine VTO mode by explicit type or category
    const ptype = (product.type || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();
    if (ptype === 'beauty' || cat.includes('beauty') || ptype === 'makeup') setVtoMode('face');
    else if (ptype === 'apparel' || cat.includes('ethnic') || cat.includes('western') || cat.includes('saree') ) setVtoMode('body');
    else if (ptype === 'accessory' || cat.includes('accessories') || ptype === 'jewellery') setVtoMode('accessory');
    else if (cat.includes('shoe') || cat.includes('foot') || cat.includes('footwear')) setVtoMode('foot');
    else setVtoMode('body');

    // Activate the mirror/AR view
    setNeuralScanStatus(neuralScanStatus === 'scanned' ? 'scanned' : 'processing');
    setShowSmartMirrorDashboard(true);
    toast.info('Launching Virtual Try-On...');
    // placeholder: real AR logic integrates face/body mesh within the AR overlay
    setTimeout(() => {
      setNeuralScanStatus('scanned');
      toast.success('VTO Ready — try items in the mirror');
      (async () => {
        try {
          if (isSupabaseReady && currentUserId) {
            await supabase.from('ar_try_sessions').insert({ user_id: currentUserId, product_id: product?.id || null, saved: false, created_at: new Date().toISOString() });
          }
        } catch (e) { console.warn('ar try session create failed', e); }
      })();
    }, 900);
  };

  const addToCartAndSync = async (product: any, qty = 1) => {
    if (!product) return;
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity: qty } });
    try {
      if (isSupabaseReady && currentUserId) {
        await supabase.from('cart_items').upsert({
          user_id: currentUserId,
          product_id: product.id,
          quantity: qty,
          price: product.price || null,
        }, { onConflict: ['user_id', 'product_id'] });
      }
    } catch (e) {
      console.warn('cart sync failed', e);
    }
  };

  const buyTheLook = async (product?: any) => {
    const items = recommendedOutfit && recommendedOutfit.length ? recommendedOutfit : (product ? [product] : []);
    if (!items || items.length === 0) { toast.info('No bundle available'); return; }
    for (const it of items) await addToCartAndSync(it, 1);
    toast.success('Smart Bundle added to cart');
    navigateTo('cart');
  };

  const analyzeSkin = async (imageData?: string) => {
    // Placeholder skin analysis logic
    setSkinAnalysis(null);
    setTimeout(() => {
      const analysis = { undertone: 'Warm', recommendedFoundation: 'Warm Beige 02', hydrationScore: 78 };
      setSkinAnalysis(analysis);
      toast.success('Skin analysis complete');
    }, 1500);
  };

  const startHapticPulse = (pattern: number[] = [30, 20, 30]) => {
    if (hasHaptics) (navigator as any).vibrate(pattern);
  };

  const setBGMForFloor = (floorId: number) => {
    const audioUrl = floors[floorId]?.audio || floors[floorId]?.music || null;
    setBgmTrackUrl(audioUrl);
    // audioRef will handle playback via effect
  };

  useEffect(() => {
    // Disable continuous background music playback here per product request.
    // Keep audioRef paused; only play short beep when elevator moves.
    try {
      const a = audioRef.current;
      a.pause();
      // clear src so it doesn't autoplay
      try { a.src = ''; } catch (e) {}
    } catch (e) { console.warn('bgm pause error', e); }
  }, [bgmTrackUrl, isAudioEnabled]);

  // Play a short beep using WebAudio (one-off) to simulate lift movement sound
  const playBeep = (freq = 880, duration = 0.12) => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      o.stop(now + duration + 0.02);
      // close context shortly after to free resources
      setTimeout(() => { try { ctx.close(); } catch (e) {} }, (duration + 0.05) * 1000);
    } catch (e) { console.warn('beep failed', e); }
  };

  useEffect(() => {
    if (isElevating && isAudioEnabled) {
      // play single beep when elevator starts moving
      playBeep(700, 0.14);
    }
  }, [isElevating, isAudioEnabled]);

  const generateEcoReceipt = (order: any) => {
    // Simple eco receipt stub
    return {
      orderId: `eco_${Date.now()}`,
      carbon_kg: Math.round((Math.random() * 2 + 0.1) * 100) / 100,
      savings: Math.round(Math.random() * 50),
      items: order?.items || [],
    };
  };

  const submitOffer = async () => {
    if (!userOffer || !selectedProduct) return;
    const offerPrice = parseInt(userOffer);
    const originalPrice = selectedProduct.price;
    if (offerPrice >= originalPrice) {
      toast.error('Offer must be lower than original price!');
      return;
    }
    toast.info('📤 Sending offer to vendor...');
    setBidHistory(prev => [...prev, { type: 'offer', amount: offerPrice, timestamp: Date.now() }]);
    try {
      if (isSupabaseReady && currentUserId) {
        await supabase.from('offers').insert({ user_id: currentUserId, product_id: selectedProduct.id, offered_price: offerPrice, status: 'pending', created_at: new Date().toISOString() });
      }
    } catch (e) { console.warn('offer save failed', e); }
    setTimeout(() => {
      const vendorAccepts = true; 
      if (vendorAccepts) {
        const finalPrice = offerPrice + Math.floor(Math.random() * 200);
        setVendorCounterOffer(finalPrice);
        setBidHistory(prev => [...prev, { type: 'counter', amount: finalPrice, timestamp: Date.now() }]);
        toast.success(`✅ Counter Offer: ₹${finalPrice} (Save ₹${originalPrice - finalPrice})`);
        setGlowPoints(prev => prev + 15);
      }
    }, 2000);
  };

  const acceptCounterOffer = async () => {
    if (vendorCounterOffer && selectedProduct) {
      const updatedProduct = { ...selectedProduct, price: vendorCounterOffer };
      await addToCartAndSync(updatedProduct, 1);
      toast.success('🎉 Deal accepted! Added to cart at bargained price');
      setShowBidModal(false);
      startHapticPulse([20,40,20]);
      navigateTo('cart');
    }
  };

  const placeInHome = () => {
    toast.success(`✨ ${selectedProduct?.name} placed in ${arPlacementMode}!`);
  };

  const handleFabricXRay = async (product: any) => {
    setShowFabricXRay(true);
    setTimeout(() => {
      const details = {
        material: product.material || "Silk",
        quality: "Premium Neural-Weave",
        handMade: true,
        durability: "5-7 years",
        origin: "Kanchipuram Node",
        sustainabilityScore: 9.2,
      };
      setFabricDetails(details);
      // Persist fabric scan request/result (best-effort)
      (async () => {
        try {
          if (isSupabaseReady && currentUserId) {
            await supabase.from('support_requests').insert({ user_id: currentUserId, type: 'fabric_scan', payload: { product_id: product.id, details }, created_at: new Date().toISOString() });
          }
        } catch (e) { console.warn('fabric scan persist failed', e); }
      })();
    }, 800);
  };

  const handleSmartMirror = async (file?: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedWardrobeImage(e.target?.result as string);
        analyzeWardrobeWithAI(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setShowSmartMirrorDashboard(true);
      setTimeout(() => {
        const mockAnalysis = {
          dominant_color: "Gold",
          style_profile: "Traditional Luxe",
          suggested_items: FALLBACK_DATA.products.slice(0, 3).map(p => ({...p, match_score: Math.floor(80 + Math.random() * 15)})),
          complete_look_price: 11949,
          savings: 1799,
        };
        setMirrorAnalysis(mockAnalysis);
        setRecommendedOutfit(mockAnalysis.suggested_items);
        toast.success("✨ Neural Mirror analyzed your style!");
      }, 2000);
    }
  };

  const analyzeWardrobeWithAI = (imageData: string) => {
    setShowSmartMirrorDashboard(true);
    setTimeout(() => {
      const analysis = {
        dominant_color: "Emerald Green",
        style_profile: "Modern Ethnic",
        suggested_items: FALLBACK_DATA.products.slice(2, 5).map(p => ({...p, match_score: Math.floor(80 + Math.random() * 15)})),
        complete_look_price: 8997, 
        savings: 1998,
      };
      setMirrorAnalysis(analysis);
      setRecommendedOutfit(analysis.suggested_items);
      toast.success("🎨 Found perfect matches for your wardrobe!");
    }, 2500);
  };

  const startDroneTracking = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        clearInterval(interval);
        setDeliveryProgress(100);
      } else {
        setDeliveryProgress(Math.min(progress, 100));
      }
    }, 800);
  };

  // Centralized navigation helper: closes overlays and navigates
  const navigateTo = (p: string) => {
    // close overlays
    setShowStoreFront(false);
    setShowMallMap(false);
    setIsCameraOpen(false);
    setIsListening(false);
    setIsElevating(false);
    setShowBodyScanner(false);
    setShowShoppingRoom(false);
    setShowStyleGPT(false);
    setShowBidModal(false);
    setShowHomeAR(false);
    setShowFabricXRay(false);
    setShowSmartMirrorDashboard(false);
    setIsDroneDelivering(false);
    setShowProfileMenu(false);
    setActiveChatModule(null);
    setPage(p);
  };

  const isOverlayOpen = (
    showStoreFront || showMallMap || isCameraOpen || isListening || isElevating || showBodyScanner || showShoppingRoom || showStyleGPT || showBidModal || showHomeAR || showFabricXRay || showSmartMirrorDashboard || isDroneDelivering || showProfileMenu
  );

  // Single overlay controller required by layout rules — do not rename existing states
  const overlayActive = isOverlayOpen;

  // --- RENDER CONTENT ---
  const renderContent = () => {
  switch (page) {
    case 'mall':
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-sm md:text-base">
          {/* Search */}
          <div className="relative group z-10">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${gender === 'male' ? 'Men' : 'Women'}'s Fashion...`}
              className={`w-full bg-white/5 border border-white/10 rounded-[25px] py-4 pl-14 pr-6 ${searchQuery ? 'text-lg' : 'text-sm'} focus:outline-none focus:border-pink-500 transition-all text-white placeholder:text-slate-400`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* NEW KILLER FEATURES */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={logOpenStyleGPT} className="p-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[35px] relative overflow-hidden group shadow-lg text-left">
              <MessageCircle size={32} className="mb-3 text-white" />
              <h3 className="text-sm font-black uppercase text-white">Style-GPT</h3>
              <p className="text-[8px] opacity-80 mt-1 text-white">AI Fashion Assistant</p>
            </button>
            <button onClick={createShoppingRoom} className="p-5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[35px] relative overflow-hidden group shadow-lg text-left">
              <UserPlus size={32} className="mb-3 text-white" />
              <h3 className="text-sm font-black uppercase text-white">Mall Hangout</h3>
              <p className="text-[8px] opacity-80 mt-1 text-white">Shop with Friends</p>
            </button>
          </div>
          
          {/* Neural Mirror Button */}
          <button 
             onClick={() => handleSmartMirror()} 
             className="w-full p-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-[35px] flex items-center justify-between group"
          >
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl">✨</div>
                <div className="text-left">
                   <h3 className="text-sm font-black uppercase text-white">Neural Mirror</h3>
                   <p className="text-[10px] text-emerald-300">Upload wardrobe & get matches</p>
                </div>
             </div>
             <ChevronRight size={20} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Floor Switcher & Map */}
          <button onClick={() => setShowMallMap(!showMallMap)} className="w-full p-4 bg-white/5 border border-white/10 rounded-[30px] flex items-center justify-between hover:border-pink-500/30 transition-all text-white">
            <div className="flex items-center gap-3"><Layers size={20} className="text-pink-500" /><span className="text-sm font-black uppercase">Interactive Mall Map</span></div>
            <ChevronRight size={20} />
          </button>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {floors.map(f => (
              <button key={f.id} onClick={() => handleFloorChange(f.id)} className={`min-w-[120px] p-4 md:p-5 rounded-[35px] border transition-all flex flex-col items-center gap-2 relative overflow-hidden ${activeFloor === f.id ? 'border-pink-500 bg-pink-500/10' : 'border-white/5 bg-white/5 opacity-50'}`}>
                <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">{f.icon}</span>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white">{f.displayName}</span>
                <span className="text-[8px] opacity-60 text-white mt-1">{f.category}</span>
              </button>

            ))}
          </div>

          {/* Neural Boutique Logic */}
          <div className="relative min-h-[500px] py-10 overflow-hidden">
             {!isWardrobeOpen && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[50px] mx-4 animate-in fade-in zoom-in duration-700">
                      <div className="text-5xl mb-6 animate-bounce">{floors[activeFloor].icon}</div>
                      <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">{floors[activeFloor].displayName} — {floors[activeFloor].category} Node</h3>
                  <button onClick={() => { setIsWardrobeOpen(true); toast.success(`${floors[activeFloor].category} Unlocked`); }} className="mt-10 px-12 py-5 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_10px_40px_rgba(236,72,153,0.4)] text-white hover:scale-105 transition-transform">Neural Handshake to Open</button>
                </div>
             )}
             
             <div className={`transition-all duration-1000 ${isWardrobeOpen ? 'opacity-100 scale-100' : 'opacity-20 scale-90 blur-lg pointer-events-none'}`}>
               <div className="flex gap-8 overflow-x-auto no-scrollbar px-10 py-16 perspective-[2500px]">
                 {getFilteredProducts().length === 0 ? (
                    <div className="w-full text-center text-white/50 py-10">No items found in this section for {gender}.</div>
                 ) : (
                    getFilteredProducts().map((p, idx) => (
                        <div key={p.id} onClick={() => handleProductTap(p)} className="min-w-[240px] h-[380px] relative transition-all duration-500 cursor-pointer hover:scale-105 transform-gpu group" style={{ transform: `rotateY(-10deg) translateZ(${20}px)`, transformStyle: 'preserve-3d' }}>
                        <div className="w-full h-full bg-slate-800/40 border border-white/10 rounded-[45px] overflow-hidden backdrop-blur-2xl group-hover:border-pink-500 shadow-2xl relative">
                            <img src={p.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700" alt={p.name} />
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-2 py-1 rounded-lg text-xl">{p.emoji}</div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                              <h4 className="text-base md:text-lg font-black italic uppercase leading-none mb-1 text-white">{p.name}</h4>
                                              <p className="text-pink-400 font-bold text-sm">₹{p.price}</p>
                            </div>
                        </div>
                        </div>
                    ))
                 )}
               </div>
             </div>
          </div>
        </div>
      );

    case 'product':
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 pb-32">
          <div className="flex gap-2 justify-center pt-4">
            {['day', 'night', 'party'].map(m => (
              <button key={m} onClick={() => setLightingMode(m as any)} className={`px-3 py-2 rounded-2xl flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase text-white ${lightingMode === m ? 'bg-pink-500/20 border border-pink-500/40' : 'bg-white/5 border border-white/10'}`}>
                {m}
              </button>
            ))}
          </div>

          {selectedProduct && (
            <div className="space-y-6 px-4">
              <div className="relative h-[450px] rounded-[55px] overflow-hidden border border-white/10 transition-all">
                <img src={selectedProduct.image} className={`w-full h-full object-cover ${lightingMode === 'night' ? 'brightness-50' : lightingMode === 'party' ? 'hue-rotate-90' : ''} transition-all duration-500`} alt={selectedProduct.name} />
                <button onClick={() => navigateTo('mall')} className="absolute top-6 left-6 p-4 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 text-white"><X size={20} /></button>
                 <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                   <h2 className="text-lg md:text-xl lg:text-2xl font-black italic uppercase text-white drop-shadow-lg">{selectedProduct.name}</h2>
                   <div className="text-lg md:text-xl lg:text-2xl font-black italic text-pink-500 drop-shadow-lg">{formatPrice(selectedProduct.price)}</div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => startVTO(selectedProduct)} className="flex items-center justify-center gap-2 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-[25px] font-black text-[9px] uppercase text-indigo-300 hover:bg-indigo-500/20 transition-colors"><ScanFace size={18} /> Try On (VTO)</button>
                <button onClick={startBodyScan} className="flex items-center justify-center gap-2 py-4 bg-green-500/10 border border-green-500/20 rounded-[25px] font-black text-[9px] uppercase text-green-300 hover:bg-green-500/20 transition-colors"><Ruler size={18} /> Size Scan</button>
              </div>
              
              {/* Fabric X-Ray Button */}
              <button 
                onClick={() => handleFabricXRay(selectedProduct)}
                className="w-full py-4 bg-blue-500/10 border border-blue-500/20 rounded-[25px] font-black text-[9px] uppercase text-blue-300 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Scan size={18} /> Deep Material Scan
              </button>

              <div className="flex gap-4">
                 <button onClick={() => setShowBidModal(true)} className="flex-1 py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-[25px] font-black text-[9px] uppercase text-yellow-300 hover:bg-yellow-500/20 transition-colors">Glow Bid</button>
                 <button onClick={() => setShowHomeAR(true)} className="flex-1 py-4 bg-purple-500/10 border border-purple-500/20 rounded-[25px] font-black text-[9px] uppercase text-purple-300 hover:bg-purple-500/20 transition-colors">Home View</button>
              </div>

              <div className="flex gap-4 mt-3">
                <button onClick={() => startMaterialHaptic(selectedProduct?.material)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-[25px] font-black text-[9px] uppercase text-white hover:bg-white/10 transition-colors">🤚 Feel Material</button>
                <button onClick={() => buyTheLook(selectedProduct)} className="flex-1 py-3 bg-pink-500 text-white rounded-[25px] font-black text-[9px] uppercase hover:bg-pink-600 transition-colors">🎁 Buy the Look</button>
              </div>

                <button onClick={async () => { await addToCartAndSync(selectedProduct, 1); navigateTo('cart'); toast.success('Added to cart! 🛒'); }} className="w-full py-6 bg-white text-black rounded-[35px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:bg-pink-50 transition-colors">Inject to Bag</button>
            </div>
          )}
        </div>
      );

    case 'cart':
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 pb-32">
          <div className="flex items-center gap-4">
             <button onClick={() => navigateTo('mall')} className="p-2 bg-white/5 rounded-full text-white"><ArrowLeft size={20} /></button>
             <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">Secure Bag</h2>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-20 opacity-20 text-white"><ShoppingBag size={80} className="mx-auto mb-6" /><p className="text-sm font-black uppercase">Bag is Empty</p></div>
          ) : (
            <div className="space-y-4">
              {cart.map((item: any) => (
                <div key={item.id} className="p-5 bg-white/5 border border-white/5 rounded-[35px] flex items-center gap-5 group">
                  <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" alt={item.name} />
                  <div className="flex-grow">
                    <h4 className="text-[10px] font-black uppercase text-white">{item.name}</h4>
                    <p className="text-pink-500 font-black italic">₹{item.price}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, delta: -1 })} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">-</button>
                        <span className="text-xs font-bold text-white">{item.quantity}</span>
                        <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, delta: 1 })} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white">+</button>
                    </div>
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', id: item.id })} className="p-3 text-red-500 hover:bg-red-500/10 rounded-full"><Trash2 size={16} /></button>
                </div>
              ))}
              <div className="mt-12 p-8 bg-white/5 rounded-[45px] border border-white/10 text-white">
                <div className="flex justify-between items-end mb-4"><span className="text-[10px] font-black uppercase opacity-40">Total Credits</span><span className="text-xl md:text-3xl font-black italic">₹{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span></div>
                <button onClick={handleCheckout} className="w-full py-6 bg-pink-500 rounded-[30px] font-black uppercase tracking-[0.2em] hover:bg-pink-600 transition-colors">Authorize Payment</button>
              </div>
            </div>
          )}
        </div>
      );

    case 'orders':
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 pb-32">
          <div className="flex items-center gap-4">
             <button onClick={() => navigateTo('mall')} className="p-2 bg-white/5 rounded-full text-white"><ArrowLeft size={20} /></button>
             <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">My Orders</h2>
          </div>
          <div className="text-center py-20 text-white/50">No recent orders in demo mode.</div>
        </div>
      );

    case 'wishlist':
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 pb-32">
          <div className="flex items-center gap-4">
             <button onClick={() => navigateTo('mall')} className="p-2 bg-white/5 rounded-full text-white"><ArrowLeft size={20} /></button>
             <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">Wishlist</h2>
          </div>
          <div className="text-center py-20 text-white/50">Your wishlist is empty.</div>
        </div>
      );

      case 'seller-dashboard':
  return (
    <SellerPlatform 
      onNavigateBack={() => setPage('mall')} 
      // Profile data-ah inga anuprom
      profileData={{
        name: userProfile?.businessName || userProfile?.displayName,
        city: userProfile?.city,
        industry: userProfile?.industry
      }}
    />
  );

    case 'creators':
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 pb-32">
          <div className="flex items-center gap-4">
             <button onClick={() => navigateTo('mall')} className="p-2 bg-white/5 rounded-full text-white"><ArrowLeft size={20} /></button>
             <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">Creators</h2>
          </div>
          <div className="text-center py-20 text-white/50">Explore creators coming soon.</div>
        </div>
      );

    default:
      return null;
  }
};

  if (!gender) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <ToastContainer />
        <div className="w-24 h-24 bg-pink-500 rounded-[35px] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(236,72,153,0.4)] animate-pulse">
          <Cpu size={48} />
        </div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tighter mb-2 italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">MITHAS 2076</h1>
        <p className="text-slate-500 mb-12 text-center italic text-[10px] uppercase tracking-[0.5em]">Neural Link Protocol Active</p>
        
        {!isSupabaseReady && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3 max-w-sm">
            <AlertCircle size={20} className="text-yellow-500" />
            <p className="text-xs text-yellow-200">Running in offline mode</p>
          </div>
        )}

        {/* Neural Wardrobe: 3D carousel with privacy shield */}
        {isWardrobeOpen && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-2xl p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Neural Wardrobe</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setPrivacyShield(!privacyShield)} className="px-3 py-2 bg-white/5 rounded-lg text-sm">{privacyShield ? 'Shield On' : 'Shield Off'}</button>
                <button onClick={() => setIsWardrobeOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={18} /></button>
              </div>
            </div>

            <div className={`relative flex-1 ${privacyShield ? 'backdrop-blur-xl bg-black/60' : ''}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-md perspective-[1200px]">
                  <div className="relative h-64">
                    {(recommendedOutfit.length ? recommendedOutfit : FALLBACK_DATA.products.slice(0,6)).map((it: any, idx: number) => {
                      const offset = idx - wardrobeIndex;
                      const transform = `translateX(${offset * 70}px) translateZ(${Math.max(0, 100 - Math.abs(offset) * 40)}px) rotateY(${offset * -10}deg)`;
                      const z = 200 - Math.abs(offset);
                      return (
                        <div key={idx} style={{ transform, zIndex: z }} className="absolute left-1/2 -translate-x-1/2 top-0 w-40 h-56 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl transition-transform duration-500">
                          <img src={it.image} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
                <button onClick={() => setWardrobeIndex(i => Math.max(0, i-1))} className="px-4 py-3 bg-white/5 rounded-2xl">Prev</button>
                <button onClick={() => setWardrobeIndex(i => i+1)} className="px-4 py-3 bg-white/5 rounded-2xl">Next</button>
              </div>
            </div>
          </div>
        )}

        {/* Shop Leaderboard */}
        {showLeaderboard && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-2xl p-6 overflow-y-auto">
            <button onClick={() => setShowLeaderboard(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-white"><X size={20} /></button>
            <h2 className="text-3xl font-black italic uppercase mb-6 text-center text-white">Shop Leaderboard</h2>
            <div className="max-w-md mx-auto space-y-4">
              {vendors.sort((a,b) => (b.votes||0) - (a.votes||0)).map((v: any) => (
                <div key={v.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-[30px]">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">{v.logo || '🏬'}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-white">{v.name}</h3>
                    <p className="text-xs opacity-60 text-white">{v.distance_km ? `${v.distance_km} km` : ''} • {v.trust_score || '—'} ★</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-pink-500">{v.votes || 0} votes</div>
                    <button onClick={() => voteForShop(v.id)} className="mt-2 px-3 py-2 bg-pink-500 rounded-xl text-xs font-black">Vote</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
          <button onClick={() => handleGenderSelect('female')} className="aspect-square rounded-[45px] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 hover:border-pink-500 transition-all group hover:bg-pink-500/5">
            <span className="text-6xl group-hover:scale-110 transition-transform">👩</span>
            <span className="font-black text-[10px] uppercase tracking-widest text-pink-500">FemNode</span>
          </button>
          <button onClick={() => handleGenderSelect('male')} className="aspect-square rounded-[45px] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-all group hover:bg-blue-500/5">
            <span className="text-6xl group-hover:scale-110 transition-transform">👨</span>
            <span className="font-black text-[10px] uppercase tracking-widest text-blue-500">MaleNode</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-sm font-bold uppercase tracking-widest">Loading Neural Mall...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] text-white font-sans overflow-x-hidden selection:bg-pink-500/30 ${overlayActive ? 'overflow-hidden h-screen' : ''}`} style={{ background: 'linear-gradient(180deg,#061029 0%, #1b0f2b 100%)' }}>
      <ToastContainer />
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[430px] min-h-screen relative shadow-2xl bg-slate-950 border-x border-white/5 text-sm md:text-base"
             style={{ ['--shop-header-height' as any]: '72px', ['--shop-nav-height' as any]: '92px' }}>
        
        {/* Universal Header */}
        <header
          className="fixed top-0 bg-slate-950/80 backdrop-blur-3xl p-6 flex items-center justify-between z-[900] border-b border-white/5"
          style={{ height: 'var(--shop-header-height)', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px' }}
        >
          <div className="flex items-center gap-4">
            {page !== 'mall' && (
              <button onClick={() => navigateTo('mall')} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                <ArrowLeft size={18} className="text-pink-500" />
                </button>
            )}
            <div>
              <h1 className="text-sm font-thin tracking-widest uppercase italic text-pink-400">MITHAS 2076</h1>
              <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-slate-400">
                <MapPin size={10} className="text-slate-400 opacity-70" />
                {currentLocation ? (
                  <span className="opacity-70">Near {currentLocation.lat.toFixed(2)},{currentLocation.lon.toFixed(2)}</span>
                ) : (
                  <button onClick={requestLocation} className="text-[9px] text-slate-300 underline underline-offset-2">Enable Location</button>
                )}
                {!isSupabaseReady && <span className="ml-1 text-yellow-400 opacity-80">• Demo</span>}
              </div>
            </div>
          </div>
          {!isOverlayOpen && (
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsAudioEnabled(!isAudioEnabled)}
               className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
             >
               {isAudioEnabled ? <Volume2 size={14} className="text-white/60" /> : <VolumeX size={14} className="text-white/40" />}
             </button>
             <div className="bg-pink-500/10 px-3 py-1.5 rounded-2xl border border-pink-500/20 flex items-center gap-2">
                <Award size={12} className="text-white/60" />
                <span className="text-[10px] font-black text-white/80">{glowPoints} GP</span>
             </div>
            <button onClick={() => setShowLeaderboard(true)} className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <Trophy size={16} className="text-yellow-400" />
            </button>
             <button
               onClick={() => {
                 if (onNavigateToSellerDashboard) onNavigateToSellerDashboard();
                 else toast.info('Seller Node onboarding coming soon');
               }}
               className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
             >
               <Briefcase size={18} className="text-white/60" />
               <span className="text-xs font-black uppercase tracking-wider text-white/80">Seller Node</span>
             </button>
          </div>
          )}
        </header>

        {/* Live Activity Banner */}
        {!isOverlayOpen && (
        <div className="fixed top-20 left-0 right-0 max-w-md mx-auto z-40 px-6">
          <div className="bg-indigo-500/10 backdrop-blur-xl border border-indigo-500/20 rounded-2xl px-4 py-2 flex items-center gap-2 animate-in slide-in-from-top-2">
            <Ghost size={12} className="text-indigo-400 animate-pulse" />
            <p className="text-[9px] font-bold uppercase tracking-wide flex-grow">{FALLBACK_DATA.liveActivity[liveActivityIndex]}</p>
          </div>
        </div>
        )}

        {/* --- MAIN CONTENT --- */}
        {!isOverlayOpen && (
        <main style={{ paddingTop: 'var(--shop-header-height)', paddingBottom: 'var(--shop-nav-height)' }} className="px-6 z-[10]">
          {renderContent()}
        </main>
        )}

        {/* --- OVERLAYS --- */}

        {/* Store Front Transition */}
        {showStoreFront && selectedShop && (
          <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center animate-in zoom-in duration-500">
            <div className="text-8xl mb-6 animate-bounce">{selectedShop.logo}</div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-white">{selectedShop.name}</h2>
            <p className="text-sm opacity-60 uppercase tracking-widest text-white">Entering Store...</p>
            <div className="mt-8 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full animate-loading-bar" />
            </div>
          </div>
        )}

        {/* Mall Map View */}
        {showMallMap && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-2xl p-6 overflow-y-auto">
            <button onClick={() => setShowMallMap(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-white"><X size={20} /></button>
            <h2 className="text-3xl font-black italic uppercase mb-8 text-center text-white">Interactive Mall Directory</h2>
            
            <div className="space-y-6 max-w-md mx-auto">
              {floors.map((floor, idx) => (
                <button
                  key={floor.id}
                  onClick={() => { handleFloorChange(floor.id); setShowMallMap(false); }}
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-[40px] hover:border-pink-500/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${floor.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                      {floor.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-black italic uppercase text-white">{floor.name}</h3>
                      <p className="text-sm opacity-60 text-white">{floor.category}</p>
                    </div>
                    <ChevronRight size={24} className="text-pink-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AR UI */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-[300] bg-black">
            {videoRef.current?.srcObject ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-70" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                  <ScanFace size={80} className="mx-auto mb-6 text-pink-500 animate-pulse" />
                  <p className="text-xl font-black uppercase mb-2 text-white">AR Simulation Mode</p>
                  <p className="text-sm opacity-60 text-white">Preview how products look on you</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {selectedProduct && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center opacity-90">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>
              )}
              {selectedProduct?.category === 'Beauty' && (
                <div className="w-72 h-[50vh] border border-pink-500/30 rounded-[100px] relative">
                  <p className="absolute bottom-10 left-0 right-0 text-center text-xs font-bold uppercase tracking-widest text-white">{t('lipstick_mode') || 'Lipstick AR Mode'}</p>
                  {/* Skin Tone Scan overlay for beauty products */}
                  {showSkinToneScan && (
                    <div className="absolute inset-4 bg-black/50 rounded-2xl flex flex-col items-center justify-center gap-4">
                      <p className="text-sm font-bold text-white">Skin Tone Scan</p>
                      <div className="w-40 h-24 rounded-xl bg-gradient-to-r from-yellow-200 via-amber-400 to-rose-200 shadow-inner" />
                      <button onClick={async () => {
                        // simulate scan
                        setSkinToneScanInProgress(true);
                        setTimeout(() => {
                          const tone = ['Cool', 'Warm', 'Neutral'][Math.floor(Math.random()*3)];
                          setSkinAnalysis({ tone, recommended: tone === 'Warm' ? 'Warm Beige 02' : 'Porcelain 01' });
                          setSkinToneScanInProgress(false);
                          toast.success('Skin tone analysis complete');
                          setShowSkinToneScan(false);
                        }, 1200);
                      }} className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-bold">Scan</button>
                    </div>
                  )}
                </div>
              )}
              <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-pink-500/30 animate-scan-line" />
            </div>
            
            <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-10 z-[160] pointer-events-auto">
               <button onClick={closeAR} className="p-5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10 text-white"><X size={24} /></button>
               <button onClick={captureLook} className="w-24 h-24 bg-white rounded-full border-[8px] border-pink-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-90 transition-transform">
                  <Camera size={36} className="text-black" />
               </button>
               <button onClick={shareArLook} className="p-5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10 text-white"><Share2 size={24} /></button>
            </div>
          </div>
        )}

        {/* Voice UI */}
        {isListening && (
          <div className="fixed inset-0 z-[300] bg-indigo-600/20 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
             <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(99,102,241,0.6)]">
                <Mic size={50} className="text-white" />
             </div>
             <p className="mt-10 font-black uppercase tracking-[0.4em] text-xs italic text-white">Awaiting Voice Input...</p>
          </div>
        )}

        {/* Lift Animation */}
        {isElevating && (
          <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-56 h-96 border-4 border-white/5 rounded-[60px] flex flex-col items-center justify-center gap-10 relative bg-white/5 backdrop-blur-3xl shadow-2xl">
              <ChevronUp size={50} className={`text-pink-500 ${elevatorDirection === 'up' ? 'animate-bounce' : 'rotate-180 animate-bounce'}`} />
              <div className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                {floors[targetFloor]?.displayNameShort || (targetFloor === 0 ? 'G' : targetFloor)}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 text-white">
                {elevatorDirection === 'up' ? 'Going Up' : 'Going Down'}
              </p>
            </div>
          </div>
        )}

        {/* ========== OVERLAYS ========== */}
        
        {/* 1. NEURAL SIZE-SYNC SCANNER */}
        {showBodyScanner && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
            <button onClick={() => setShowBodyScanner(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-white"><X size={20} /></button>
            
            <div className="text-center mb-8">
              <Ruler size={64} className="mx-auto text-green-400 mb-4 animate-pulse" />
              <h2 className="text-3xl font-black uppercase mb-2 text-white">Neural Size-Sync</h2>
              <p className="text-sm opacity-60 text-white">Scanning body mesh...</p>
            </div>
            
            {/* 3D Body Wireframe */}
            <div className="w-64 h-96 border-2 border-green-500/30 rounded-[50px] relative mb-6 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-8 gap-px">
                {[...Array(64)].map((_, i) => (
                  <div key={i} className="bg-green-500/10 animate-pulse" style={{ animationDelay: `${i * 20}ms` }} />
                ))}
              </div>
              <div className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_20px_#22c55e]" style={{ top: `${bodyScanProgress}%` }} />
            </div>
            
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs mb-2 text-white">
                <span>Analyzing...</span>
                <span className="font-black">{bodyScanProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${bodyScanProgress}%` }} />
              </div>
            </div>
            
            {userBodyMesh && (
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-[30px] w-full max-w-sm">
                <h3 className="text-sm font-black uppercase mb-4 text-center text-green-200">Body Mesh Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-black text-white">{Math.round(userBodyMesh.height)} cm</p>
                    <p className="text-xs opacity-60 text-white">Height</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-green-400">{recommendedSize}</p>
                    <p className="text-xs opacity-60 text-white">Perfect Size</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MULTI-USER MALL HANGOUT WITH VIDEO */}
        {showShoppingRoom && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-2xl p-6 overflow-y-auto">
            <button onClick={() => setShowShoppingRoom(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-white"><X size={20} /></button>
            
            <div className="max-w-md mx-auto pt-10">
              <div className="text-center mb-8">
                <Users size={64} className="mx-auto text-blue-400 mb-4" />
                <h2 className="text-3xl font-black uppercase mb-2 text-white">Mall Hangout</h2>
                <p className="text-sm opacity-60 text-white">Room ID: {shoppingRoomId}</p>
              </div>
              
              {/* Video Grid */}
              <div className="mb-6">
                 {isVideoCallActive ? (
                   <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-[30px] border border-white/10">
                     {/* Self */}
                     <div className="aspect-square bg-black rounded-2xl relative overflow-hidden border border-white/20">
                        {/* Simulated Camera Feed */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                           <User size={32} className="text-white/50" />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white font-bold">You</div>
                     </div>
                     {/* Friend Placeholder */}
                     <div className="aspect-square bg-slate-900 rounded-2xl relative overflow-hidden border border-white/10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white/30" />
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white font-bold">Connecting...</div>
                     </div>
                   </div>
                 ) : (
                    <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 text-center">
                       <p className="text-xs text-slate-400 mb-4">Start a live video session with friends</p>
                       <button onClick={initializeVideoCall} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all">
                          <Video size={16} /> Start Video Call
                       </button>
                    </div>
                 )}
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-6">
                <h3 className="text-sm font-black uppercase mb-4 text-white">Active Shoppers ({roomParticipants.length + 1})</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-black text-white">You (Host)</p>
                      <p className="text-[8px] opacity-40 text-white">Currently browsing {FALLBACK_DATA.floors[activeFloor].category}</p>
                    </div>
                    <Crown size={16} className="text-yellow-500" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={toggleVoiceChat}
                  className={`flex-1 py-4 rounded-[25px] flex items-center justify-center gap-2 font-black uppercase text-xs text-white ${isVoiceChatActive ? 'bg-green-500' : 'bg-white/5 border border-white/10'}`}
                >
                  {isVoiceChatActive ? <PhoneCall size={18} /> : <Mic size={18} />}
                  {isVoiceChatActive ? 'Voice Active' : 'Start Voice'}
                </button>
                {isVideoCallActive && (
                    <button onClick={endVideoCall} className="flex-1 py-4 rounded-[25px] bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center gap-2 font-black uppercase text-xs hover:bg-red-500 hover:text-white transition-all">
                        End Call
                    </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. STYLE-GPT AI CHATBOT */}
        {showStyleGPT && (
          <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Style-GPT</h2>
                  <p className="text-[9px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    AI Online
                  </p>
                </div>
              </div>
              <button onClick={() => closeChatModule()} className="p-2 bg-white/5 rounded-full text-white"><X size={20} /></button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-20 opacity-40 text-white">
                  <Sparkles size={48} className="mx-auto mb-4" />
                  <p className="text-sm font-black uppercase">Ask me anything!</p>
                  <p className="text-xs mt-2">"Next week enga veettu function, suggest something traditional"</p>
                </div>
              )}
              
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-[25px] ${msg.role === 'user' ? 'bg-pink-500 text-white' : 'bg-white/5 border border-white/10 text-white'}`}>
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isAITyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-[25px]">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-slate-900">
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessageToStyleGPT()}
                  placeholder="Ask Style-GPT..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-[25px] px-6 py-4 focus:outline-none focus:border-purple-500 text-white"
                />
                <button 
                  onClick={sendMessageToStyleGPT}
                  className="px-6 py-4 bg-purple-500 rounded-[25px] flex items-center justify-center text-white"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. GLOW BID - LIVE BARGAINING */}
        {showBidModal && selectedProduct && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 rounded-[40px] border border-white/10 p-8">
              <button onClick={() => setShowBidModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-white"><X size={20} /></button>
              
              <div className="text-center mb-6">
                <DollarSign size={48} className="mx-auto text-yellow-400 mb-3" />
                <h2 className="text-2xl font-black uppercase text-white">Glow Bid</h2>
                <p className="text-sm opacity-60 mt-2 text-white">{selectedProduct.name}</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-2xl mb-6 text-center">
                <p className="text-xs opacity-60 mb-1 text-white">Original Price</p>
                <p className="text-3xl font-black text-red-400 line-through">₹{selectedProduct.price}</p>
              </div>
              
              <div className="mb-6">
                <label className="text-xs font-black uppercase mb-2 block text-white">Your Offer (Max 30% off)</label>
                <input 
                  type="number"
                  value={userOffer}
                  onChange={(e) => setUserOffer(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black text-center focus:outline-none focus:border-yellow-500 text-white"
                />
              </div>
              
              {vendorCounterOffer && (
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[30px] mb-6 animate-in zoom-in">
                  <p className="text-xs font-black uppercase text-green-400 mb-2">✅ Vendor Counter Offer</p>
                  <p className="text-3xl md:text-4xl font-black text-green-400">₹{vendorCounterOffer}</p>
                  <button 
                    onClick={acceptCounterOffer}
                    className="w-full mt-4 py-3 bg-green-500 rounded-2xl font-black uppercase text-sm text-white"
                  >
                    Accept & Add to Cart
                  </button>
                </div>
              )}
              
              {!vendorCounterOffer && (
                <button 
                  onClick={submitOffer}
                  disabled={!userOffer}
                  className="w-full py-4 bg-yellow-500 rounded-[25px] font-black uppercase disabled:opacity-30 text-black hover:bg-yellow-400 transition-colors"
                >
                  Submit Offer
                </button>
              )}
            </div>
          </div>
        )}

        {/* 5. XR HOME PLACEMENT */}
        {showHomeAR && (
          <div className="fixed inset-0 z-[300] bg-black">
              <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                  <Home size={80} className="mx-auto mb-6 text-purple-400 animate-pulse" />
                  <p className="text-xl font-black uppercase mb-2 text-white">Home AR Simulation</p>
                  <p className="text-sm opacity-60 text-white">Visualize products in your space</p>
                </div>
              </div>
            
            {/* Controls */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-6 z-10">
              <button 
                onClick={() => setShowHomeAR(false)} 
                className="p-5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-white"
              >
                <X size={24} />
              </button>
              
              <div className="flex gap-2 bg-white/10 backdrop-blur-xl rounded-full p-2 border border-white/10">
                <button onClick={() => setArPlacementMode('wardrobe')} className={`px-4 py-2 rounded-full text-xs font-black uppercase text-white ${arPlacementMode === 'wardrobe' ? 'bg-purple-500' : 'bg-transparent'}`}>Wardrobe</button>
                <button onClick={() => setArPlacementMode('wall')} className={`px-4 py-2 rounded-full text-xs font-black uppercase text-white ${arPlacementMode === 'wall' ? 'bg-purple-500' : 'bg-transparent'}`}>Wall</button>
              </div>
              
              <button 
                onClick={placeInHome}
                className="px-8 py-4 bg-purple-500 rounded-full font-black uppercase text-sm flex items-center gap-2 text-white hover:bg-purple-600"
              >
                <Maximize size={20} />
                Place Here
              </button>
            </div>
          </div>
        )}
        
        {/* 6. FABRIC X-RAY OVERLAY */}
        {showFabricXRay && fabricDetails && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in zoom-in">
             <button 
               onClick={() => { setShowFabricXRay(false); setFabricDetails(null); }} 
               className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-white"
             >
                <X size={20} />
             </button>
             
             <div className="w-full max-w-sm bg-slate-900 border border-blue-500/30 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan-line"></div>
                <div className="text-center mb-6">
                   <Scan size={48} className="text-blue-400 mx-auto mb-3" />
                   <h2 className="text-2xl font-black uppercase text-white">Deep Material Scan</h2>
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-xs uppercase text-slate-400 font-bold">Material</span>
                      <span className="text-sm text-white font-black">{fabricDetails.material}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-xs uppercase text-slate-400 font-bold">Neural Quality</span>
                      <span className="text-sm text-blue-400 font-black">{fabricDetails.quality}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-xs uppercase text-slate-400 font-bold">Origin Node</span>
                      <span className="text-sm text-white font-black">{fabricDetails.origin}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs uppercase text-slate-400 font-bold">Eco Score</span>
                      <span className="text-sm text-green-400 font-black">{fabricDetails.sustainabilityScore}/10</span>
                   </div>
                </div>
             </div>
          </div>
        )}
        
        {/* 7. SMART MIRROR DASHBOARD */}
          {showSmartMirrorDashboard && (
            <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                 <h2 className="text-xl font-black uppercase text-white">Neural Mirror</h2>
                 <button onClick={() => setShowSmartMirrorDashboard(false)} className="p-2 bg-white/5 rounded-full text-white"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                 {!selectedWardrobeImage && !mirrorAnalysis ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                       <button onClick={() => handleSmartMirror()} className="w-full max-w-xs p-8 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[40px] text-left relative overflow-hidden group">
                          <Sparkles size={40} className="text-white mb-4" />
                          <h3 className="text-2xl font-black uppercase text-white">Live Mirror</h3>
                          <p className="text-xs text-emerald-200 mt-2">Real-time style analysis</p>
                       </button>
                       <label className="w-full max-w-xs p-8 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[40px] text-left relative overflow-hidden group cursor-pointer">
                          <Camera size={40} className="text-white mb-4" />
                          <h3 className="text-2xl font-black uppercase text-white">Wardrobe Sync</h3>
                          <p className="text-xs text-blue-200 mt-2">Upload outfit photo</p>
                          <input type="file" accept="image/*" onChange={(e) => e.target.files && handleSmartMirror(e.target.files[0])} hidden />
                       </label>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {selectedWardrobeImage && (
                          <div className="rounded-[30px] overflow-hidden border border-white/10">
                             <img src={selectedWardrobeImage} className="w-full h-64 object-cover" />
                          </div>
                       )}
                       
                       {mirrorAnalysis && (
                          <>
                             <div className="bg-white/5 rounded-[30px] p-6 border border-white/10">
                                <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Neural Analysis</h3>
                                <div className="grid grid-cols-2 gap-4">
                                   <div>
                                      <p className="text-[10px] uppercase text-slate-500">Style Profile</p>
                                      <p className="text-lg font-black text-white">{mirrorAnalysis.style_profile}</p>
                                   </div>
                                   <div>
                                      <p className="text-[10px] uppercase text-slate-500">Palette</p>
                                      <p className="text-lg font-black text-emerald-400">{mirrorAnalysis.dominant_color}</p>
                                   </div>
                                </div>
                             </div>
                             
                             <h3 className="text-sm font-black uppercase text-white pl-2">AI Matched Items</h3>
                             <div className="space-y-3">
                                {recommendedOutfit.map((item, idx) => (
                                   <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-[25px] border border-white/5">
                                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">{item.emoji}</div>
                                      <div className="flex-1">
                                         <h4 className="text-sm font-bold text-white">{item.name}</h4>
                                         <p className="text-xs text-slate-400">Match Score: <span className="text-green-400">{item.match_score}%</span></p>
                                      </div>
                                      <div className="text-right">
                                           <p className="text-sm font-bold text-white">{formatPrice(item.price)}</p>
                                          <button onClick={async () => { await addToCartAndSync(item, 1); toast.success('Added match to cart!'); }} className="text-[10px] text-pink-500 font-bold uppercase mt-1">Add +</button>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </>
                       )}
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* Drone Delivery with Map & Tracking (ENHANCED) */}
        {isDroneDelivering && (
          <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center p-10 text-center animate-in zoom-in duration-500">
            <div className="w-full max-w-xs h-80 bg-white/5 rounded-[60px] border border-white/10 relative overflow-hidden mb-10 shadow-2xl">
              <div className="absolute top-10 left-10 opacity-20"><Building2 size={32} className="text-white" /></div>
              <div className="absolute bottom-10 right-10 text-pink-500"><Navigation2 size={32} /></div>
              
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <path d="M 50 100 Q 150 50, 250 250" stroke="cyan" strokeWidth="2" fill="none" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" from="0" to="20" dur="1s" repeatCount="indefinite" />
                </path>
              </svg>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-drone-path">
                 <div className="relative">
                    <Cpu size={48} className="text-white animate-spin-slow" />
                    <div className="absolute inset-0 bg-pink-500/20 blur-xl animate-pulse" />
                 </div>
              </div>
            </div>
            
            {/* New Tracking Info */}
            <div className="w-full max-w-xs space-y-4">
                <div className="flex justify-between text-xs text-white/50 uppercase font-bold">
                    <span>Dispatch</span>
                    <span>Arrival</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${deliveryProgress}%` }}></div>
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Drone Dispatched</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mt-3 animate-pulse">Neural Path Locked: Karamadai → Hub</p>
            </div>
          </div>
        )}

        {/* Global Nav */}
        {!isOverlayOpen && (
        <nav
          className="fixed bottom-0 bg-slate-950/90 backdrop-blur-3xl p-8 flex justify-around items-center z-[90] border-t border-white/5 rounded-t-[60px]"
          style={{ height: 'var(--shop-nav-height)', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <button onClick={() => navigateTo('mall')} className={page === 'mall' ? 'text-pink-500' : 'text-slate-500 hover:text-white transition-colors'}><Zap size={26} /></button>
          <button onClick={() => navigateTo('creators')} className={page === 'creators' ? 'text-pink-500' : 'text-slate-500 hover:text-white transition-colors'}><Users size={26} /></button>
          <div className="relative -mt-16">
             <button 
              onClick={startVoiceCommand}
              className={`w-18 h-18 p-4 rounded-[25px] flex items-center justify-center shadow-2xl border-[6px] border-slate-950 transition-all ${isListening ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-black'}`}
             >
               <Mic size={28} />
             </button>
          </div>
          <button onClick={() => navigateTo('cart')} className={page === 'cart' ? 'text-pink-500' : 'text-slate-500 hover:text-white transition-colors'}><ShoppingBag size={26} /></button>
          <button onClick={() => setShowProfileMenu(true)} className="text-slate-500 hover:text-white transition-colors relative">
            <User size={26} />
            {currentUserId && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950" />
            )}
          </button>
        </nav>
        )}

        {/* USER PROFILE MENU */}
        <UserProfileMenu 
          isOpen={showProfileMenu}
          onClose={() => setShowProfileMenu(false)}
          userId={currentUserId}
          glowPoints={glowPoints}
          onNavigateToOrders={() => {
            setShowProfileMenu(false);
            navigateTo('orders');
          }}
          onNavigateToCart={() => {
            setShowProfileMenu(false);
            navigateTo('cart');
          }}
          onNavigateToWishlist={() => {
            setShowProfileMenu(false);
            navigateTo('wishlist');
          }}
        />

      </div>

      <style>{`
        @keyframes scan-line { 0% { top: 20%; } 100% { top: 80%; } }
        .animate-scan-line { animation: scan-line 2s linear infinite; }
        @keyframes drone-path {
          0% { transform: translate(-100px, -100px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(100px, 100px); opacity: 0; }
        }
        .animate-drone-path { animation: drone-path 4s ease-in-out forwards; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        @keyframes loading-bar { from { width: 0%; } to { width: 100%; } }
        .animate-loading-bar { animation: loading-bar 1.5s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  </div>
  );
}










