import React, { useState, useEffect, useRef, useReducer, useMemo } from 'react';
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
  Home, Ruler, UserPlus, PhoneCall, Percent, TrendingDown
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase, isSupabaseConfigured, realtime } from '../lib/supabase';
import { UserProfileMenu } from './UserProfileMenu';

interface ShopScreenProps {
  onNavigateBack?: () => void;
  onNavigateToSellerDashboard?: () => void;
}

// --- FALLBACK MOCK DATA (Used if Supabase not configured) ---
const FALLBACK_DATA = {
  floors: [
    { id: 0, name: 'Ground Floor', category: 'Makeup', icon: '💄', color: 'from-pink-500 to-fuchsia-600', music: 'Lofi Beats', audio: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', ambience: 'Beauty spray sounds' },
    { id: 1, name: 'First Floor', category: 'Fashion', icon: '👗', color: 'from-rose-600 to-orange-500', music: 'Classical Veena', audio: 'https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3', ambience: 'Silk rustle' },
    { id: 2, name: 'Second Floor', category: 'Jewelry', icon: '💎', color: 'from-amber-500 to-yellow-600', music: 'Temple Chimes', audio: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3', ambience: 'Bangle jingles' },
    { id: 3, name: 'Third Floor', category: 'Accessories', icon: '⌚', color: 'from-slate-700 to-blue-900', music: 'Cyber Jazz', audio: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3', ambience: 'Ambient tech' }
  ],
  localVendors: [
    { id: 'V1', name: "Kanchipuram Emporium", distance_km: 1.2, trust_score: 4.8, verified_tag: true, votes: 1240, logo: '🏛️' },
    { id: 'V2', name: "Glow & Glam", distance_km: 0.8, trust_score: 4.9, verified_tag: true, votes: 980, logo: '✨' },
    { id: 'V3', name: "Karamadai Gold Hub", distance_km: 2.4, trust_score: 4.7, verified_tag: true, votes: 1560, logo: '👑' }
  ],
  products: [
    { id: 1, name: 'Kanchipuram Silk Saree', price: 8500, category: 'Fashion', gender: 'female', floor: 1, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400', haptic: [100, 100], bundleWith: [2, 4], trending: true, emoji: '🎀', rating: 4.9, seller: 'Royal Weaves', shopLogo: '🏛️', ar: true, liveViewers: 24, stock: 3, material: 'silk' },
    { id: 2, name: 'Ruby Matte Lipstick', price: 950, category: 'Makeup', gender: 'female', floor: 0, image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&w=400', haptic: [30, 10, 30], emoji: '💄', rating: 4.8, seller: 'GlowCo', shopLogo: '✨', ar: true, trending: true, liveViewers: 18, stock: 12 },
    { id: 3, name: 'Metallic Eyeshadow', price: 1499, category: 'Makeup', gender: 'female', floor: 0, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400', haptic: [20, 20], emoji: '🎨', rating: 4.7, seller: 'Urban Glow', shopLogo: '✨', ar: true, liveViewers: 9, stock: 8 },
    { id: 4, name: 'Golden Choker', price: 2499, category: 'Jewelry', gender: 'female', floor: 2, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400', haptic: [50, 20, 50], emoji: '👑', rating: 4.9, trending: true, seller: 'Royal Jewels', shopLogo: '👑', liveViewers: 31, stock: 2, material: 'metal' },
    { id: 5, name: 'Linen Kurta Pajama', price: 2999, category: 'Fashion', gender: 'male', floor: 1, image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=400', haptic: [80, 50, 80], emoji: '👔', rating: 4.6, shopLogo: '🏛️', liveViewers: 5, stock: 15, material: 'cotton' },
    { id: 6, name: 'Luxury Chrono Watch', price: 5500, category: 'Accessories', gender: 'male', floor: 3, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400', haptic: [50, 20, 50], emoji: '⌚', rating: 4.8, trending: true, shopLogo: '⌚', liveViewers: 12, stock: 6, material: 'metal' }
  ],
  creators: [
    { id: 1, name: 'Alex Johnson', username: '@alexj_glow', avatar: 'https://i.pravatar.cc/150?u=1', verified: true, followers: '4.5K', badge: 'Diamond' },
    { id: 2, name: 'Priya Guru', username: '@priyabeauty', avatar: 'https://i.pravatar.cc/150?u=2', verified: true, followers: '3.2K', badge: 'Gold' }
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

export function ShopScreen({ onNavigateBack, onNavigateToSellerDashboard }: ShopScreenProps) {
  const [gender, setGender] = useState<string | null>(null);
  const [page, setPage] = useState('mall');
  const [activeTab, setActiveTab] = useState('products');
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
  const [wishlist, setWishlist] = useState(new Set<number>());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showStoreFront, setShowStoreFront] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [lightingMode, setLightingMode] = useState<'day' | 'night' | 'party'>('day');
  const [showMallMap, setShowMallMap] = useState(false);
  const [arCapturedImage, setArCapturedImage] = useState<string | null>(null);
  const [liveActivityIndex, setLiveActivityIndex] = useState(0);
  const [elevatorDirection, setElevatorDirection] = useState<'up' | 'down'>('up');
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<any>(null);
  
  // Real-time data from Supabase
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [realTimeViewers, setRealTimeViewers] = useState<Record<string, number>>({});
  
  // NEW KILLER FEATURES STATE
  // 1. Neural Size-Sync Scanner
  const [showBodyScanner, setShowBodyScanner] = useState(false);
  const [bodyScanProgress, setBodyScanProgress] = useState(0);
  const [userBodyMesh, setUserBodyMesh] = useState<any>(null);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [sizeFitScore, setSizeFitScore] = useState(0);
  
  // 2. Multi-User Mall Hangout
  const [showShoppingRoom, setShowShoppingRoom] = useState(false);
  const [shoppingRoomId, setShoppingRoomId] = useState<string | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<any[]>([]);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  
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
  
  // User Profile Menu
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
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
          
          // Fetch user's glow points
          const { data: profile } = await supabase
            .from('profiles')
            .select('glow_points')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setGlowPoints(profile.glow_points || 2500);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    initUser();
  }, []);

  // --- FETCH PRODUCTS FROM SUPABASE ---
  useEffect(() => {
    const fetchProducts = async () => {
      if (!isSupabaseReady) {
        setProducts(FALLBACK_DATA.products);
        setVendors(FALLBACK_DATA.localVendors);
        setIsLoading(false);
        // Show demo tip only once
        if (!hasShownDemoTip) {
          setTimeout(() => {
            toast.info('💡 Demo Mode: All features work with sample data', { duration: 3000 });
            setHasShownDemoTip(true);
          }, 1000);
        }
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch products with seller info
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            seller:seller_id (
              business_name,
              verified
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        // Transform to match our interface
        const transformedProducts = (productsData || []).map((p: any, idx: number) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          gender: p.gender,
          floor: getCategoryFloor(p.category),
          image: p.images?.[0] || `https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400`,
          haptic: getHapticForMaterial(p.material || 'silk'),
          bundleWith: [],
          trending: p.trending || false,
          emoji: getCategoryEmoji(p.category),
          rating: p.rating || 4.5,
          seller: p.seller?.business_name || 'MITHAS',
          shopLogo: getCategoryEmoji(p.category),
          ar: p.has_ar_model || false,
          liveViewers: Math.floor(Math.random() * 30) + 5,
          stock: p.stock_quantity || 10,
          material: p.material || 'silk'
        }));

        setProducts(transformedProducts);

        // Fetch vendors (sellers)
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('sellers')
          .select('*')
          .eq('verified', true)
          .limit(10);

        if (vendorsError) throw vendorsError;

        const transformedVendors = (vendorsData || []).map((v: any) => ({
          id: v.id,
          name: v.business_name,
          distance_km: Math.random() * 5,
          trust_score: v.rating || 4.5,
          verified_tag: v.verified,
          votes: Math.floor(Math.random() * 2000) + 500,
          logo: getCategoryEmoji(v.business_name)
        }));

        setVendors(transformedVendors);
        setIsLoading(false);
        
        // Show success message only once
        if (!hasShownDemoTip) {
          toast.success('✅ Connected to MITHAS Neural Network');
          setHasShownDemoTip(true);
        }

      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load products');
        // Fallback to mock data
        setProducts(FALLBACK_DATA.products);
        setVendors(FALLBACK_DATA.localVendors);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isSupabaseReady]);


    // --- STEP 1: INDHA FUNCTION AH PASTE PANNUNGA ---
  const renderContent = () => {
  // 1. Switch start panrom
  switch (page) {
    case 'mall':
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Neural Index..." 
              className="w-full bg-white/5 border border-white/10 rounded-[25px] py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-pink-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* NEW KILLER FEATURES */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setShowStyleGPT(true)} className="p-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[35px] relative overflow-hidden group shadow-lg">
              <MessageCircle size={32} className="mb-3" />
              <h3 className="text-sm font-black uppercase">Style-GPT</h3>
              <p className="text-[8px] opacity-80 mt-1">AI Fashion Assistant</p>
            </button>
            <button onClick={createShoppingRoom} className="p-5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-[35px] relative overflow-hidden group shadow-lg">
              <UserPlus size={32} className="mb-3" />
              <h3 className="text-sm font-black uppercase">Mall Hangout</h3>
              <p className="text-[8px] opacity-80 mt-1">Shop with Friends</p>
            </button>
          </div>

          {/* Monthly Shop Challenge */}
          <div className="p-6 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/20 rounded-[40px]">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Monthly Shop Challenge</span>
            </div>
            <div className="space-y-3">
              {vendors.sort((a, b) => b.votes - a.votes).slice(0, 3).map((shop, idx) => (
                <div key={shop.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                  <div className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                  <div className="flex-grow">
                    <p className="text-xs font-black">{shop.name}</p>
                    <p className="text-[9px] opacity-60">{shop.votes} votes</p>
                  </div>
                  <button onClick={() => voteForShop(shop.id)} className="px-3 py-1 bg-yellow-500/20 rounded-full text-[9px] font-black uppercase hover:bg-yellow-500 transition-colors">Vote</button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Banner */}
          <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[40px] relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={80} /></div>
            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200">Weekly Top Nodes</span>
              <h3 className="text-2xl font-black mt-1 italic uppercase">Glow Trending</h3>
            </div>
          </div>

          {/* Floor Switcher & Map */}
          <button onClick={() => setShowMallMap(!showMallMap)} className="w-full p-4 bg-white/5 border border-white/10 rounded-[30px] flex items-center justify-between hover:border-pink-500/30 transition-all">
            <div className="flex items-center gap-3"><Layers size={20} className="text-pink-500" /><span className="text-sm font-black uppercase">Interactive Mall Map</span></div>
            <ChevronRight size={20} />
          </button>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {floors.map(f => (
              <button key={f.id} onClick={() => handleFloorChange(f.id)} className={`min-w-[120px] p-5 rounded-[35px] border transition-all flex flex-col items-center gap-2 relative overflow-hidden ${activeFloor === f.id ? 'border-pink-500 bg-pink-500/10' : 'border-white/5 bg-white/5 opacity-50'}`}>
                <span className="text-3xl group-hover:scale-110 transition-transform">{f.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-widest">{f.category}</span>
              </button>
            ))}
          </div>

          {/* Neural Boutique Logic */}
          <div className="relative min-h-[600px] py-10 overflow-hidden">
             {!isWardrobeOpen && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[50px] mx-4 animate-in fade-in zoom-in duration-700">
                  <div className="text-6xl mb-6 animate-bounce">{floors[activeFloor].icon}</div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{floors[activeFloor].category} Node</h3>
                  <button onClick={() => { setIsWardrobeOpen(true); toast.success(`${floors[activeFloor].category} Unlocked`); }} className="mt-10 px-12 py-5 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_10px_40px_rgba(236,72,153,0.4)]">Neural Handshake to Open</button>
                </div>
             )}
             
             <div className={`transition-all duration-1000 ${isWardrobeOpen ? 'opacity-100 scale-100' : 'opacity-20 scale-90 blur-lg pointer-events-none'}`}>
               <div className="flex gap-14 overflow-x-auto no-scrollbar px-24 py-16 perspective-[2500px]">
                 {products
                   .filter(p => p.floor === activeFloor && (p.gender === gender || !p.gender))
                   .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                   .map((p, idx) => (
                     <div key={p.id} onClick={() => handleProductTap(p)} className="min-w-[240px] h-[380px] relative transition-all duration-500 cursor-pointer hover:scale-105" style={{ transform: `rotateY(-30deg) translateZ(${100 + idx * 20}px)`, transformStyle: 'preserve-3d' }}>
                       <div className="w-full h-full bg-slate-800/40 border border-white/10 rounded-[45px] overflow-hidden backdrop-blur-2xl group hover:border-pink-500 shadow-2xl">
                         <img src={p.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700" />
                         <div className="absolute bottom-8 left-8 right-8">
                            <h4 className="text-lg font-black italic uppercase leading-none mb-1">{p.name}</h4>
                            <p className="text-indigo-400 font-bold text-sm">₹{p.price}</p>
                         </div>
                       </div>
                     </div>
                   ))}
               </div>
             </div>
          </div>
        </div>
      );

    case 'product':
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
          <div className="flex gap-2 justify-center">
            {['day', 'night', 'party'].map(m => (
              <button key={m} onClick={() => setLightingMode(m as any)} className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-[9px] font-black uppercase ${lightingMode === m ? 'bg-pink-500/20 border border-pink-500/40' : 'bg-white/5 border border-white/10'}`}>
                {m}
              </button>
            ))}
          </div>

          {selectedProduct && (
            <div className="space-y-6 px-4">
              <div className="relative h-[450px] rounded-[55px] overflow-hidden border border-white/10 transition-all">
                <img src={selectedProduct.image} className="w-full h-full object-cover" />
                <button onClick={() => setPage('mall')} className="absolute top-6 left-6 p-4 bg-black/50 backdrop-blur-xl rounded-full border border-white/10"><X size={20} /></button>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                   <h2 className="text-3xl font-black italic uppercase">{selectedProduct.name}</h2>
                   <div className="text-3xl font-black italic text-pink-500">₹{selectedProduct.price}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={openAR} className="flex items-center justify-center gap-2 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-[25px] font-black text-[9px] uppercase"><ScanFace size={18} /> Neural Try-On</button>
                <button onClick={startBodyScan} className="flex items-center justify-center gap-2 py-4 bg-green-500/10 border border-green-500/20 rounded-[25px] font-black text-[9px] uppercase"><Ruler size={18} /> Size Scan</button>
              </div>

              <button onClick={() => { dispatch({ type: 'ADD_TO_CART', payload: selectedProduct }); setPage('cart'); toast.success("Added to cart! 🛒"); }} className="w-full py-6 bg-white text-black rounded-[35px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl">Inject to Bag</button>
            </div>
          )}
        </div>
      );

    case 'cart':
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Secure Bag</h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 opacity-20"><ShoppingBag size={80} className="mx-auto mb-6" /><p className="text-sm font-black uppercase">Bag is Empty</p></div>
          ) : (
            <div className="space-y-4">
              {cart.map((item: any) => (
                <div key={item.id} className="p-5 bg-white/5 border border-white/5 rounded-[35px] flex items-center gap-5 group">
                  <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" />
                  <div className="flex-grow">
                    <h4 className="text-[10px] font-black uppercase">{item.name}</h4>
                    <p className="text-pink-500 font-black italic">₹{item.price}</p>
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', id: item.id })} className="p-3 text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
              <div className="mt-12 p-8 bg-white/5 rounded-[45px] border border-white/10">
                <div className="flex justify-between items-end mb-4"><span className="text-[10px] font-black uppercase opacity-40">Total Credits</span><span className="text-3xl font-black italic">₹{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span></div>
                <button onClick={handleCheckout} className="w-full py-6 bg-pink-500 rounded-[30px] font-black uppercase tracking-[0.2em]">Authorize Payment</button>
              </div>
            </div>
          )}
        </div>
      );

    case 'style-gpt':
      return (
        <div className="animate-in fade-in h-full flex flex-col p-6">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10"><h2 className="text-xl font-black uppercase">Style-GPT AI</h2><button onClick={() => setPage('mall')} className="p-2 bg-white/10 rounded-full"><X size={20} /></button></div>
          <div className="flex-grow bg-white/5 rounded-[30px] flex items-center justify-center mb-4"><p className="opacity-50">AI Neural Link Active...</p></div>
          <input type="text" placeholder="Ask AI..." className="w-full p-4 bg-white/10 rounded-[20px] outline-none border border-white/5" />
        </div>
      );

    case 'profile':
      return (
        <div className="animate-in fade-in space-y-8">
          <button onClick={() => setPage('mall')} className="flex items-center gap-2 opacity-60"><ArrowLeft /> Back</button>
          <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-[40px] text-center">
            <div className="w-24 h-24 bg-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">😎</div>
            <h3 className="text-xl font-black">User Node</h3>
            <p className="text-pink-400 font-bold mt-2">{glowPoints} GP Earned</p>
          </div>
        </div>
      );

    default:
      return null;
  }
};



  // --- REAL-TIME PRODUCT VIEWS ---
  useEffect(() => {
    if (!isSupabaseReady) return;

    const channel = supabase
      .channel('product-views')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_views'
        },
        (payload) => {
          // Update live viewers count
          console.log('Product view update:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseReady]);

  // --- SAVE CART TO DATABASE ---
  const syncCartToDatabase = async () => {
    if (!isSupabaseReady || !currentUserId || cart.length === 0) return;

    try {
      // Clear existing cart items
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', currentUserId);

      // Insert new cart items
      const cartItems = cart.map((item: any) => ({
        user_id: currentUserId,
        product_id: item.id,
        quantity: item.quantity
      }));

      await supabase
        .from('cart_items')
        .insert(cartItems);

    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  };

  useEffect(() => {
    syncCartToDatabase();
  }, [cart]);

  // --- HELPER FUNCTIONS ---
  const getCategoryFloor = (category: string): number => {
    const map: Record<string, number> = {
      'Makeup': 0,
      'Skincare': 0,
      'Fashion': 1,
      'Jewelry': 2,
      'Accessories': 3
    };
    return map[category] || 0;
  };

  const getCategoryEmoji = (category: string): string => {
    const map: Record<string, string> = {
      'Makeup': '💄',
      'Skincare': '🧴',
      'Fashion': '👗',
      'Jewelry': '💎',
      'Accessories': '⌚'
    };
    return map[category] || '✨';
  };

  const getHapticForMaterial = (material: string): number[] => {
    const patterns: Record<string, number[]> = {
      silk: [100, 50, 100],
      cotton: [50, 30, 50, 30, 50],
      gold: [200, 100, 200],
      metal: [150, 80, 150],
      leather: [150, 80, 150],
      liquid: [60, 30, 60, 30, 60]
    };
    return patterns[material.toLowerCase()] || [100];
  };

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
    const floor = floors[activeFloor];
    audioRef.current.src = floor.audio;
    audioRef.current.loop = true;
    audioRef.current.volume = 0.15;
    audioRef.current.play().catch(() => console.log("Audio play blocked"));
    return () => audioRef.current.pause();
  }, [activeFloor, gender, isAudioEnabled]);

  // --- VOICE COMMANDS ---
  const startVoiceCommand = () => {
    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.info("🎤 Voice commands not available");
      setTimeout(() => setIsListening(false), 1500);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Voice recognition error:', err);
      toast.info("🎤 Voice already listening");
      setIsListening(false);
      return;
    }
    
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      if (command.includes('fashion')) handleFloorChange(1);
      else if (command.includes('makeup')) handleFloorChange(0);
      else if (command.includes('jewelry')) handleFloorChange(2);
      else if (command.includes('accessories')) handleFloorChange(3);
      else if (command.includes('stylist')) setPage('ai-stylist');
      toast.success(`Voice command: "${command}"`);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      console.log('Voice error:', event.error);
      if (event.error === 'not-allowed') {
        toast.info("🎤 Microphone access needed for voice commands");
      }
      setIsListening(false);
    };
  };

  const handleFloorChange = (floorId: number) => {
    if (floorId === activeFloor || isElevating) return;
    setTargetFloor(floorId);
    setElevatorDirection(floorId > activeFloor ? 'up' : 'down');
    setIsElevating(true);
    setIsWardrobeOpen(false);
    
    if (navigator.vibrate) navigator.vibrate([20]);
    
    setTimeout(() => {
      setActiveFloor(floorId);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      const ding = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      ding.volume = 0.3;
      ding.play().catch(() => {});
      setIsElevating(false);
      toast.success(`Arrived at ${floors[floorId].name}`);
    }, 2500);
  };

  const openAR = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      toast.success('📸 Camera activated!');
    } catch (err) { 
      console.error(err);
      setIsCameraOpen(false);
      toast.info("📱 Camera not available. Using AR simulation mode");
      // Show AR simulation instead
      setTimeout(() => {
        toast.success("✨ AR Try-On simulation active!");
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
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    
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
    }
    
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-white z-[500] animate-ping';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 200);
  };

  const shareArLook = () => {
    if (arCapturedImage) {
      toast.success("Shared to social! 📱");
      if (navigator.share) {
        navigator.share({
          title: 'My MITHAS Look',
          text: 'Check out my look from MITHAS GLOW!',
        }).catch(() => {});
      }
      setGlowPoints(prev => prev + 50);
    }
  };

  const handleCheckout = async () => {
    if (!isSupabaseReady || !currentUserId) {
      toast.error('Please login to checkout');
      return;
    }

    const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const isBundle = totalItems > 1;
    
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUserId,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      await supabase
        .from('order_items')
        .insert(orderItems);

      // Update glow points
      const bonusPoints = isBundle ? 100 : 50;
      await supabase
        .from('profiles')
        .update({ 
          glow_points: glowPoints + bonusPoints 
        })
        .eq('id', currentUserId);

      setGlowPoints(prev => prev + bonusPoints);
      
      if (isBundle) {
        toast.success(`Bundle bonus! +${bonusPoints} Glow Points 🎁`);
      }
      
      setIsDroneDelivering(true);
      toast.success("Order placed successfully! 🚁");
      
      setTimeout(() => {
        setIsDroneDelivering(false);
        dispatch({ type: 'CLEAR_CART' });
        setPage('mall');
        toast.success("Package delivered!");
      }, 5000);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed. Please try again.');
    }
  };

  const toggleWishlist = (id: number) => {
    const next = new Set(wishlist);
    if (next.has(id)) {
      next.delete(id);
      toast.info("Removed from wishlist");
    } else {
      next.add(id);
      toast.success("Added to wishlist ❤️");
    }
    setWishlist(next);
  };

  const handleBackToMain = () => {
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const handleProductTap = (product: any) => {
    const shop = vendors.find(v => v.name === product.seller);
    if (shop) {
      setSelectedShop(shop);
      setShowStoreFront(true);
      setTimeout(() => {
        setShowStoreFront(false);
        setSelectedProduct(product);
        setPage('product');
      }, 1500);
    } else {
      setSelectedProduct(product);
      setPage('product');
    }
  };

  const handleProductLongPress = (product: any) => {
    if (navigator.vibrate && product.haptic) {
      navigator.vibrate(product.haptic);
      const materialName = product.material === 'silk' ? 'Silk (smooth)' : 
                          product.material === 'cotton' ? 'Cotton (soft)' : 
                          product.material === 'metal' ? 'Metal (sharp)' : 'Material';
      toast.info(`🤚 Feel: ${materialName}`);
    }
  };

  const voteForShop = async (shopId: string) => {
    const shop = vendors.find(v => v.id === shopId);
    if (shop) {
      shop.votes += 1;
      setGlowPoints(prev => prev + 10);
      toast.success(`Voted for ${shop.name}! +10 GP`);
      
      // Update in database if Supabase is ready
      if (isSupabaseReady && currentUserId) {
        await supabase
          .from('profiles')
          .update({ glow_points: glowPoints + 10 })
          .eq('id', currentUserId);
      }
    }
  };

  const getBundleProducts = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product && product.bundleWith) {
      return products.filter(p => product.bundleWith?.includes(p.id));
    }
    return [];
  };

  // ==================== NEW KILLER FEATURES ====================
  
  // 1. NEURAL SIZE-SYNC SCANNER
  const startBodyScan = async () => {
    setShowBodyScanner(true);
    setBodyScanProgress(0);
    
    toast.info('📐 Activating Neural Body Mesh Scanner...');
    
    // Simulate 2-second body scan
    const scanInterval = setInterval(() => {
      setBodyScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          
          // AI Analysis Result
          const mockBodyData = {
            height: 165 + Math.random() * 15, // 165-180 cm
            chest: 85 + Math.random() * 15,
            waist: 70 + Math.random() * 10,
            hips: 90 + Math.random() * 15
          };
          
          setUserBodyMesh(mockBodyData);
          
          // Determine size
          const avgMeasurement = (mockBodyData.chest + mockBodyData.waist + mockBodyData.hips) / 3;
          let size = 'M';
          let fitScore = 95 + Math.random() * 5;
          
          if (avgMeasurement < 80) {
            size = 'S';
            fitScore = 97;
          } else if (avgMeasurement > 95) {
            size = 'L';
            fitScore = 96;
          }
          
          setRecommendedSize(size);
          setSizeFitScore(Math.round(fitScore));
          
          if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 50]);
          toast.success(`✨ Size ${size} fits ${Math.round(fitScore)}% of your body mesh!`);
          
          // Save to database
          if (isSupabaseReady && currentUserId) {
            supabase
              .from('profiles')
              .update({ 
                body_measurements: mockBodyData,
                recommended_size: size
              })
              .eq('id', currentUserId)
              .then(() => console.log('Body mesh saved'));
          }
          
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  };

  // 2. MULTI-USER MALL HANGOUT
  const createShoppingRoom = async () => {
    if (!isSupabaseReady || !currentUserId) {
      toast.error('Login required for Social Shopping');
      return;
    }
    
    const roomId = `room_${Date.now()}`;
    setShoppingRoomId(roomId);
    setShowShoppingRoom(true);
    
    toast.success('🎉 Shopping Room Created! Share the link with friends');
    
    // Create room in database
    await supabase
      .from('shopping_rooms')
      .insert({
        id: roomId,
        host_id: currentUserId,
        active: true
      });
    
    // Subscribe to room updates
    const channel = realtime.subscribe(
      `shopping_rooms:id=eq.${roomId}`,
      (payload) => {
        console.log('Room update:', payload);
        // Update participants in real-time
      }
    );
    
    setGlowPoints(prev => prev + 25);
  };

  const joinShoppingRoom = (friendRoomId: string) => {
    setShoppingRoomId(friendRoomId);
    setShowShoppingRoom(true);
    toast.success('🤝 Joined friend\'s shopping session!');
  };

  const toggleVoiceChat = () => {
    setIsVoiceChatActive(!isVoiceChatActive);
    if (!isVoiceChatActive) {
      toast.info('🎤 Voice chat activated');
    } else {
      toast.info('🔇 Voice chat muted');
    }
  };

  // 3. STYLE-GPT AI ASSISTANT
  const sendMessageToStyleGPT = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: userInput,
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAITyping(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      let aiResponse = '';
      const input = userInput.toLowerCase();
      
      // Smart AI recommendations
      if (input.includes('wedding') || input.includes('function')) {
        aiResponse = '✨ For traditional functions, I recommend:\n\n1. Kanchipuram Silk Saree (Floor 1)\n2. Temple Jewelry Set (Floor 2)\n3. Ruby Matte Lipstick (Floor 0)\n\n💡 This complete look will cost ₹13,150. Shall I create a bundle for you?';
        
        // Auto-navigate to relevant products
        setTimeout(() => {
          toast.success('🎯 AI curated 3 products for you!');
        }, 1000);
        
      } else if (input.includes('office') || input.includes('formal')) {
        aiResponse = '👔 For office/formal look:\n\n1. Linen Kurta (Floor 1)\n2. Leather Watch (Floor 3)\n\nTotal: ₹6,499\n\nShall I add these to your bag?';
        
      } else if (input.includes('party')) {
        aiResponse = '🎉 Party-ready recommendations:\n\n1. Metallic Eyeshadow (Floor 0)\n2. Golden Choker (Floor 2)\n\nTry Party Lighting Mode for perfect preview!';
        
      } else {
        aiResponse = `I understand you're looking for "${userInput}". Let me search our Neural Index...\n\n🔍 Found ${Math.floor(Math.random() * 5) + 3} matching items. Would you like me to filter by price or style?`;
      }
      
      const aiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAITyping(false);
      
      if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    }, 1500);
  };

  // 4. GLOW BID - LIVE BARGAINING
  const submitOffer = async () => {
    if (!userOffer || !selectedProduct) return;
    
    const offerPrice = parseInt(userOffer);
    const originalPrice = selectedProduct.price;
    const discountPercent = Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
    
    if (offerPrice >= originalPrice) {
      toast.error('Offer must be lower than original price!');
      return;
    }
    
    if (discountPercent > 30) {
      toast.error('❌ Offer too low. Max 30% discount allowed');
      return;
    }
    
    toast.info('📤 Sending offer to vendor...');
    
    setBidHistory(prev => [...prev, {
      type: 'offer',
      amount: offerPrice,
      timestamp: Date.now()
    }]);
    
    // Simulate vendor response
    setTimeout(() => {
      const vendorAccepts = Math.random() > 0.4; // 60% acceptance rate
      
      if (vendorAccepts) {
        const finalPrice = offerPrice + Math.floor(Math.random() * 200);
        setVendorCounterOffer(finalPrice);
        
        setBidHistory(prev => [...prev, {
          type: 'counter',
          amount: finalPrice,
          timestamp: Date.now()
        }]);
        
        toast.success(`✅ Counter Offer: ₹${finalPrice} (Save ₹${originalPrice - finalPrice})`);
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        // Update glow points
        setGlowPoints(prev => prev + 15);
        
      } else {
        toast.error('❌ Vendor declined. Original price stands.');
        setBidHistory(prev => [...prev, {
          type: 'decline',
          timestamp: Date.now()
        }]);
      }
    }, 2000);
  };

  const acceptCounterOffer = () => {
    if (vendorCounterOffer && selectedProduct) {
      const updatedProduct = { ...selectedProduct, price: vendorCounterOffer };
      dispatch({ type: 'ADD_TO_CART', payload: updatedProduct });
      toast.success('🎉 Deal accepted! Added to cart at bargained price');
      setShowBidModal(false);
      setPage('cart');
      
      // Save bid to database
      if (isSupabaseReady && currentUserId) {
        supabase
          .from('product_bids')
          .insert({
            user_id: currentUserId,
            product_id: selectedProduct.id,
            original_price: selectedProduct.price,
            final_price: vendorCounterOffer,
            status: 'accepted'
          });
      }
    }
  };

  // 5. XR TRY-BEFORE-BUY (HOME PLACEMENT)
  const startHomeARPlacement = async () => {
    setShowHomeAR(true);
    toast.info('🏠 Activating Home AR Preview...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Rear camera for home scanning
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      toast.success('📱 Point camera at your wardrobe/wall');
    } catch (err) {
      console.error(err);
      // Don't close, show simulation mode
      toast.info("📱 Using AR simulation mode");
      setTimeout(() => {
        toast.success('✨ Position your product virtually!');
      }, 500);
    }
  };

  const placeInHome = () => {
    toast.success(`✨ ${selectedProduct?.name} placed in ${arPlacementMode}!`);
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    
    // Save AR placement preference
    if (isSupabaseReady && currentUserId && selectedProduct) {
      supabase
        .from('ar_try_sessions')
        .insert({
          user_id: currentUserId,
          product_id: selectedProduct.id,
          placement_type: arPlacementMode,
          saved: true
        });
    }
  };

  if (!gender) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-24 h-24 bg-pink-500 rounded-[35px] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(236,72,153,0.4)] animate-pulse">
          <Cpu size={48} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-2 italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">MITHAS 2076</h1>
        <p className="text-slate-500 mb-12 text-center italic text-[10px] uppercase tracking-[0.5em]">Neural Link Protocol Active</p>
        
        {!isSupabaseReady && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3 max-w-sm">
            <AlertCircle size={20} className="text-yellow-500" />
            <p className="text-xs text-yellow-200">Running in offline mode</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
          <button onClick={() => setGender('female')} className="aspect-square rounded-[45px] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 hover:border-pink-500 transition-all group hover:bg-pink-500/5">
            <span className="text-6xl group-hover:scale-110 transition-transform">👩</span>
            <span className="font-black text-[10px] uppercase tracking-widest text-pink-500">FemNode</span>
          </button>
          <button onClick={() => setGender('male')} className="aspect-square rounded-[45px] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-all group hover:bg-blue-500/5">
            <span className="text-6xl group-hover:scale-110 transition-transform">👨</span>
            <span className="font-black text-[10px] uppercase tracking-widest text-blue-500">MaleNode</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-sm font-bold uppercase tracking-widest">Loading Neural Mall...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-pink-500/30">
      <div className="max-w-md mx-auto relative min-h-screen shadow-2xl bg-slate-950 border-x border-white/5">
        
        {/* Universal Header */}
        <header className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-slate-950/80 backdrop-blur-3xl p-6 flex items-center justify-between z-50 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={handleBackToMain} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ArrowLeft size={18} className="text-pink-500" />
            </button>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase italic text-pink-500">MITHAS 2076</h1>
              <div className="flex items-center gap-1 text-[8px] uppercase tracking-widest opacity-40">
                <MapPin size={8} /> Karamadai Node {!isSupabaseReady && <span className="ml-1 text-yellow-400">• Demo</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsAudioEnabled(!isAudioEnabled)}
               className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
             >
               {isAudioEnabled ? <Volume2 size={14} className="text-indigo-400" /> : <VolumeX size={14} className="text-slate-500" />}
             </button>
             <div className="bg-pink-500/10 px-3 py-1.5 rounded-2xl border border-pink-500/20 flex items-center gap-2">
                <Award size={12} className="text-pink-500" />
                <span className="text-[10px] font-black">{glowPoints} GP</span>
             </div>
             <button onClick={() => setPage('cart')} className="relative">
                <ShoppingCart size={20} className="text-slate-400" />
                {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-pink-500 text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{cart.length}</span>}
             </button>
          </div>
        </header>

        {/* Live Activity Banner */}
        <div className="fixed top-20 left-0 right-0 max-w-md mx-auto z-40 px-6">
          <div className="bg-indigo-500/10 backdrop-blur-xl border border-indigo-500/20 rounded-2xl px-4 py-2 flex items-center gap-2 animate-in slide-in-from-top-2">
            <Ghost size={12} className="text-indigo-400 animate-pulse" />
            <p className="text-[9px] font-bold uppercase tracking-wide flex-grow">{FALLBACK_DATA.liveActivity[liveActivityIndex]}</p>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <main className="pt-32 px-6 pb-36">
            {renderContent()}
        </main>

        {/* --- OVERLAYS --- */}

        {/* Store Front Transition */}
        {showStoreFront && selectedShop && (
          <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center animate-in zoom-in duration-500">
            <div className="text-8xl mb-6 animate-bounce">{selectedShop.logo}</div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{selectedShop.name}</h2>
            <p className="text-sm opacity-60 uppercase tracking-widest">Entering Store...</p>
            <div className="mt-8 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full animate-loading-bar" />
            </div>
          </div>
        )}

        {/* Mall Map View */}
        {showMallMap && (
          <div className="fixed inset-0 z-[250] bg-slate-950/95 backdrop-blur-2xl p-6 overflow-y-auto">
            <button onClick={() => setShowMallMap(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full"><X size={20} /></button>
            <h2 className="text-3xl font-black italic uppercase mb-8 text-center">Interactive Mall Directory</h2>
            
            <div className="space-y-6 max-w-md mx-auto">
              {floors.map((floor, idx) => (
                <button
                  key={floor.id}
                  onClick={() => { handleFloorChange(floor.id); setShowMallMap(false); }}
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-[40px] hover:border-pink-500/30 transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${floor.color} flex items-center justify-center text-3xl`}>
                      {floor.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-black italic uppercase">{floor.name}</h3>
                      <p className="text-sm opacity-60">{floor.category}</p>
                    </div>
                    <ChevronRight size={24} className="text-pink-500" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {products.filter(p => p.floor === floor.id).slice(0, 3).map(p => (
                      <span key={p.id} className="text-xs bg-white/5 px-2 py-1 rounded-full">{p.emoji}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AR UI */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-[150] bg-black">
            {videoRef.current?.srcObject ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-70" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                  <ScanFace size={80} className="mx-auto mb-6 text-pink-500 animate-pulse" />
                  <p className="text-xl font-black uppercase mb-2">AR Simulation Mode</p>
                  <p className="text-sm opacity-60">Preview how products look on you</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* AR Overlays */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {selectedProduct?.category === 'Makeup' && (
                <div className="w-72 h-[50vh] border border-pink-500/30 rounded-[100px] relative">
                  <div className="absolute top-1/3 left-0 right-0 h-24 border border-pink-500/20" />
                  <p className="absolute bottom-10 left-0 right-0 text-center text-xs font-bold uppercase tracking-widest">Lipstick AR Mode</p>
                </div>
              )}
              {selectedProduct?.category === 'Fashion' && (
                <div className="w-80 h-[70vh] border border-rose-500/30 rounded-[100px] relative">
                  <p className="absolute bottom-10 left-0 right-0 text-center text-xs font-bold uppercase tracking-widest">Full Body Frame</p>
                </div>
              )}
              {selectedProduct?.category === 'Jewelry' && (
                <div className="w-72 h-40 border border-yellow-500/30 rounded-[60px] absolute top-1/4">
                  <p className="absolute -bottom-8 left-0 right-0 text-center text-xs font-bold uppercase tracking-widest">Neck Alignment</p>
                </div>
              )}
              <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-pink-500/30 animate-scan-line" />
            </div>
            
            <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-10 z-[160]">
               <button onClick={closeAR} className="p-5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10"><X size={24} /></button>
               <button onClick={captureLook} className="w-24 h-24 bg-white rounded-full border-[8px] border-pink-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-90 transition-transform">
                  <Camera size={36} className="text-black" />
               </button>
               <button onClick={shareArLook} className="p-5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10"><Share2 size={24} /></button>
            </div>
            
            {arCapturedImage && (
              <div className="absolute top-6 right-6 w-24 h-32 rounded-2xl overflow-hidden border-2 border-pink-500 shadow-2xl">
                <img src={arCapturedImage} alt="Captured" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Voice UI */}
        {isListening && (
          <div className="fixed inset-0 z-[400] bg-indigo-600/20 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
             <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(99,102,241,0.6)]">
                <Mic size={50} />
             </div>
             <p className="mt-10 font-black uppercase tracking-[0.4em] text-xs italic">Awaiting Voice Input...</p>
             <p className="text-[9px] mt-4 opacity-40 uppercase tracking-widest text-center">"Fashion Floor" • "Jewelry Floor" • "Makeup" • "AI Stylist"</p>
          </div>
        )}

        {/* Lift Animation */}
        {isElevating && (
          <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-56 h-96 border-4 border-white/5 rounded-[60px] flex flex-col items-center justify-center gap-10 relative bg-white/5 backdrop-blur-3xl shadow-2xl">
              {elevatorDirection === 'up' ? (
                <ChevronUp size={50} className="animate-bounce text-pink-500" />
              ) : (
                <ChevronDown size={50} className="animate-bounce text-pink-500" />
              )}
              <div className="text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                {targetFloor === 0 ? 'G' : targetFloor}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
                {elevatorDirection === 'up' ? 'Ascending' : 'Descending'}
              </p>
            </div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
               {[...Array(30)].map((_,i) => <div key={i} className="h-0.5 bg-white mb-6 animate-pulse" style={{ animationDelay: `${i*100}ms` }} />)}
            </div>
          </div>
        )}

        {/* ========== NEW KILLER FEATURES MODALS ========== */}
        
        {/* 1. NEURAL SIZE-SYNC SCANNER */}
        {showBodyScanner && (
          <div className="fixed inset-0 z-[700] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
            <button onClick={() => setShowBodyScanner(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full"><X size={20} /></button>
            
            <div className="text-center mb-8">
              <Ruler size={64} className="mx-auto text-green-400 mb-4 animate-pulse" />
              <h2 className="text-3xl font-black uppercase mb-2">Neural Size-Sync</h2>
              <p className="text-sm opacity-60">Scanning body mesh...</p>
            </div>
            
            {/* 3D Body Wireframe */}
            <div className="w-64 h-96 border-2 border-green-500/30 rounded-[50px] relative mb-6 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-8 gap-px">
                {[...Array(64)].map((_, i) => (
                  <div key={i} className="bg-green-500/10 animate-pulse" style={{ animationDelay: `${i * 20}ms` }} />
                ))}
              </div>
              
              {/* Scanning Line */}
              <div className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_20px_#22c55e]" style={{ top: `${bodyScanProgress}%` }} />
            </div>
            
            {/* Progress */}
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs mb-2">
                <span>Analyzing...</span>
                <span className="font-black">{bodyScanProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${bodyScanProgress}%` }} />
              </div>
            </div>
            
            {userBodyMesh && (
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-[30px] w-full max-w-sm">
                <h3 className="text-sm font-black uppercase mb-4 text-center">Body Mesh Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-black">{Math.round(userBodyMesh.height)} cm</p>
                    <p className="text-xs opacity-60">Height</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-green-400">{recommendedSize}</p>
                    <p className="text-xs opacity-60">Perfect Size</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. MULTI-USER MALL HANGOUT */}
        {showShoppingRoom && (
          <div className="fixed inset-0 z-[700] bg-slate-950/95 backdrop-blur-2xl p-6">
            <button onClick={() => setShowShoppingRoom(false)} className="absolute top-6 right-6 p-3 bg-white/5 rounded-full"><X size={20} /></button>
            
            <div className="max-w-md mx-auto pt-20">
              <div className="text-center mb-8">
                <Users size={64} className="mx-auto text-blue-400 mb-4" />
                <h2 className="text-3xl font-black uppercase mb-2">Mall Hangout</h2>
                <p className="text-sm opacity-60">Room ID: {shoppingRoomId}</p>
              </div>
              
              {/* Room Participants */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 mb-6">
                <h3 className="text-sm font-black uppercase mb-4">Active Shoppers ({roomParticipants.length + 1})</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-black">You (Host)</p>
                      <p className="text-[8px] opacity-40">Currently browsing {FALLBACK_DATA.floors[activeFloor].category}</p>
                    </div>
                    <Crown size={16} className="text-yellow-500" />
                  </div>
                  
                  {roomParticipants.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                      <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs font-black">{p.name}</p>
                        <p className="text-[8px] opacity-40">Viewing products...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Voice Chat */}
              <div className="flex gap-4">
                <button 
                  onClick={toggleVoiceChat}
                  className={`flex-1 py-4 rounded-[25px] flex items-center justify-center gap-2 font-black uppercase text-xs ${isVoiceChatActive ? 'bg-green-500' : 'bg-white/5 border border-white/10'}`}
                >
                  {isVoiceChatActive ? <PhoneCall size={18} /> : <Mic size={18} />}
                  {isVoiceChatActive ? 'Voice Active' : 'Start Voice'}
                </button>
                <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-[25px] flex items-center justify-center gap-2 font-black uppercase text-xs">
                  <Share2 size={18} />
                  Invite
                </button>
              </div>
              
              {/* Shared Cart Preview */}
              <div className="mt-6 p-4 bg-pink-500/10 border border-pink-500/20 rounded-[30px]">
                <p className="text-xs font-black uppercase mb-2">💡 Friend trying this Saree now!</p>
                <p className="text-[9px] opacity-60">Real-time sync active. Their screen mirrors yours.</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. STYLE-GPT AI CHATBOT */}
        {showStyleGPT && (
          <div className="fixed inset-0 z-[700] bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black">Style-GPT</h2>
                  <p className="text-[9px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    AI Online
                  </p>
                </div>
              </div>
              <button onClick={() => setShowStyleGPT(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-20 opacity-40">
                  <Sparkles size={48} className="mx-auto mb-4" />
                  <p className="text-sm font-black uppercase">Ask me anything!</p>
                  <p className="text-xs mt-2">"Next week enga veettu function, suggest something traditional"</p>
                </div>
              )}
              
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-[25px] ${msg.role === 'user' ? 'bg-pink-500' : 'bg-white/5 border border-white/10'}`}>
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
                  className="flex-1 bg-white/5 border border-white/10 rounded-[25px] px-6 py-4 focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={sendMessageToStyleGPT}
                  className="px-6 py-4 bg-purple-500 rounded-[25px] flex items-center justify-center"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. GLOW BID - LIVE BARGAINING */}
        {showBidModal && selectedProduct && (
          <div className="fixed inset-0 z-[700] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 rounded-[40px] border border-white/10 p-8">
              <button onClick={() => setShowBidModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full"><X size={20} /></button>
              
              <div className="text-center mb-6">
                <DollarSign size={48} className="mx-auto text-yellow-400 mb-3" />
                <h2 className="text-2xl font-black uppercase">Glow Bid</h2>
                <p className="text-sm opacity-60 mt-2">{selectedProduct.name}</p>
              </div>
              
              {/* Original Price */}
              <div className="bg-white/5 p-4 rounded-2xl mb-6 text-center">
                <p className="text-xs opacity-60 mb-1">Original Price</p>
                <p className="text-3xl font-black text-red-400 line-through">₹{selectedProduct.price}</p>
              </div>
              
              {/* Your Offer */}
              <div className="mb-6">
                <label className="text-xs font-black uppercase mb-2 block">Your Offer (Max 30% off)</label>
                <input 
                  type="number"
                  value={userOffer}
                  onChange={(e) => setUserOffer(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black text-center focus:outline-none focus:border-yellow-500"
                />
              </div>
              
              {/* Counter Offer */}
              {vendorCounterOffer && (
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[30px] mb-6 animate-in zoom-in">
                  <p className="text-xs font-black uppercase text-green-400 mb-2">✅ Vendor Counter Offer</p>
                  <p className="text-4xl font-black text-green-400">₹{vendorCounterOffer}</p>
                  <p className="text-xs opacity-60 mt-2">Save ₹{selectedProduct.price - vendorCounterOffer}</p>
                  <button 
                    onClick={acceptCounterOffer}
                    className="w-full mt-4 py-3 bg-green-500 rounded-2xl font-black uppercase text-sm"
                  >
                    Accept & Add to Cart
                  </button>
                </div>
              )}
              
              {/* Bid History */}
              {bidHistory.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-black uppercase mb-3 opacity-40">Negotiation Timeline</p>
                  <div className="space-y-2">
                    {bidHistory.map((bid, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        {bid.type === 'offer' && <TrendingDown size={14} className="text-yellow-400" />}
                        {bid.type === 'counter' && <TrendingUp size={14} className="text-green-400" />}
                        {bid.type === 'decline' && <X size={14} className="text-red-400" />}
                        <span className="opacity-60">
                          {bid.type === 'offer' && `Your offer: ₹${bid.amount}`}
                          {bid.type === 'counter' && `Vendor counter: ₹${bid.amount}`}
                          {bid.type === 'decline' && 'Offer declined'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Submit */}
              {!vendorCounterOffer && (
                <button 
                  onClick={submitOffer}
                  disabled={!userOffer}
                  className="w-full py-4 bg-yellow-500 rounded-[25px] font-black uppercase disabled:opacity-30"
                >
                  Submit Offer
                </button>
              )}
            </div>
          </div>
        )}

        {/* 5. XR HOME PLACEMENT */}
        {showHomeAR && (
          <div className="fixed inset-0 z-[700] bg-black">
            {videoRef.current?.srcObject ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                  <Home size={80} className="mx-auto mb-6 text-purple-400 animate-pulse" />
                  <p className="text-xl font-black uppercase mb-2">Home AR Simulation</p>
                  <p className="text-sm opacity-60">Visualize products in your space</p>
                </div>
              </div>
            )}
            
            {/* AR Placement UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Placement Frame */}
              <div className="w-80 h-96 border-2 border-purple-500/50 rounded-[40px] relative">
                <div className="absolute top-4 left-4 right-4 bg-purple-500/20 backdrop-blur-md p-3 rounded-2xl text-center">
                  <p className="text-xs font-black uppercase">Point at {arPlacementMode}</p>
                </div>
                
                {/* Product Preview */}
                {selectedProduct && (
                  <img 
                    src={selectedProduct.image} 
                    className="absolute inset-10 w-auto h-auto object-contain opacity-80"
                  />
                )}
                
                {/* Measurement Grid */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-px bg-cyan-400" style={{ top: `${i * 10}%` }} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-6 z-10">
              <button 
                onClick={() => setShowHomeAR(false)} 
                className="p-5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10"
              >
                <X size={24} />
              </button>
              
              {/* Placement Mode Switcher */}
              <div className="flex gap-2 bg-white/10 backdrop-blur-xl rounded-full p-2 border border-white/10">
                <button 
                  onClick={() => setArPlacementMode('wardrobe')}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase ${arPlacementMode === 'wardrobe' ? 'bg-purple-500' : 'bg-transparent'}`}
                >
                  Wardrobe
                </button>
                <button 
                  onClick={() => setArPlacementMode('wall')}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase ${arPlacementMode === 'wall' ? 'bg-purple-500' : 'bg-transparent'}`}
                >
                  Wall
                </button>
                <button 
                  onClick={() => setArPlacementMode('table')}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase ${arPlacementMode === 'table' ? 'bg-purple-500' : 'bg-transparent'}`}
                >
                  Table
                </button>
              </div>
              
              <button 
                onClick={placeInHome}
                className="px-8 py-4 bg-purple-500 rounded-full font-black uppercase text-sm flex items-center gap-2"
              >
                <Maximize size={20} />
                Place Here
              </button>
            </div>
          </div>
        )}

        {/* Drone Delivery with Map */}
        {isDroneDelivering && (
          <div className="fixed inset-0 z-[600] bg-slate-950 flex flex-col items-center justify-center p-10 text-center animate-in zoom-in duration-500">
            <div className="w-full max-w-xs h-80 bg-white/5 rounded-[60px] border border-white/10 relative overflow-hidden mb-10 shadow-2xl">
              <div className="absolute top-10 left-10 opacity-20"><Building2 size={32} /></div>
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
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Drone Dispatched</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mt-3 animate-pulse">Neural Path Locked: Karamadai → Hub</p>
            <p className="text-[9px] opacity-40 mt-2">ETA: 15 minutes</p>
          </div>
        )}

        {/* Global Nav */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/90 backdrop-blur-3xl p-8 flex justify-around items-center z-40 border-t border-white/5 rounded-t-[60px]">
          <button onClick={() => setPage('mall')} className={page === 'mall' ? 'text-pink-500' : 'text-slate-500 hover:text-white transition-colors'}><Zap size={26} /></button>
          <button onClick={() => setPage('creators')} className={page === 'creators' ? 'text-pink-500' : 'text-slate-500 hover:text-white transition-colors'}><Users size={26} /></button>
          <div className="relative -mt-16">
             <button 
              onClick={startVoiceCommand}
              className={`w-18 h-18 rounded-[25px] flex items-center justify-center shadow-2xl border-[6px] border-slate-950 transition-all ${isListening ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-black'}`}
             >
               <Mic size={28} />
             </button>
          </div>
          <button onClick={() => setPage('cart')} className={page === 'cart' ? 'text-pink-500' : 'text-slate-500 hover:text-white transition-colors'}><ShoppingBag size={26} /></button>
          <button onClick={() => setShowProfileMenu(true)} className="text-slate-500 hover:text-white transition-colors relative">
            <User size={26} />
            {currentUserId && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950" />
            )}
          </button>
        </nav>

        {/* USER PROFILE MENU */}
        <UserProfileMenu 
          isOpen={showProfileMenu}
          onClose={() => setShowProfileMenu(false)}
          userId={currentUserId}
          glowPoints={glowPoints}
          onNavigateToOrders={() => {
            setShowProfileMenu(false);
            setPage('orders');
          }}
          onNavigateToCart={() => {
            setShowProfileMenu(false);
            setPage('cart');
          }}
          onNavigateToWishlist={() => {
            setShowProfileMenu(false);
            setPage('wishlist');
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
        @keyframes portal-glow { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.3; } }
        .portal-glow { animation: portal-glow 2s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default ShopScreen;


