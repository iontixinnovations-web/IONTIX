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
  ArrowLeft, CheckSquare, ScanFace, Palette
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_DATA = {
  floors: [
    { id: 0, name: 'Ground Floor', category: 'Makeup', icon: '💄', color: 'from-pink-500 to-fuchsia-600', music: 'Lofi Beats', audio: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
    { id: 1, name: 'First Floor', category: 'Fashion', icon: '👗', color: 'from-rose-600 to-orange-500', music: 'Classical Veena', audio: 'https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3' },
    { id: 2, name: 'Second Floor', category: 'Jewelry', icon: '💎', color: 'from-amber-500 to-yellow-600', music: 'Temple Chimes', audio: 'https://assets.mixkit.co/active_storage/sfx/1113/1113-preview.mp3' },
    { id: 3, name: 'Third Floor', category: 'Accessories', icon: '⌚', color: 'from-slate-700 to-blue-900', music: 'Cyber Jazz', audio: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3' }
  ],
  localVendors: [
    { id: 'V1', name: "Kanchipuram Emporium", distance_km: 1.2, trust_score: 4.8, verified_tag: true, votes: 1240 },
    { id: 'V2', name: "Glow & Glam", distance_km: 0.8, trust_score: 4.9, verified_tag: true, votes: 980 },
    { id: 'V3', name: "Karamadai Gold Hub", distance_km: 2.4, trust_score: 4.7, verified_tag: true, votes: 1560 }
  ],
  products: [
    { id: 1, name: 'Kanchipuram Silk Saree', price: 8500, category: 'Fashion', gender: 'female', floor: 1, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400', haptic: [100, 100], bundleWith: 2, trending: true, emoji: '🎀', rating: 4.9, seller: 'Royal Weaves', ar: true },
    { id: 2, name: 'Ruby Matte Lipstick', price: 950, category: 'Makeup', gender: 'female', floor: 0, image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&w=400', haptic: [30, 10, 30], emoji: '💄', rating: 4.8, seller: 'GlowCo', ar: true, trending: true },
    { id: 3, name: 'Metallic Eyeshadow', price: 1499, category: 'Makeup', gender: 'female', floor: 0, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400', haptic: [20, 20], emoji: '🎨', rating: 4.7, seller: 'Urban Glow', ar: true },
    { id: 4, name: 'Golden Choker', price: 2499, category: 'Jewelry', gender: 'female', floor: 2, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400', emoji: '👑', rating: 4.9, trending: true, seller: 'Royal Jewels' },
    { id: 5, name: 'Linen Kurta Pajama', price: 2999, category: 'Fashion', gender: 'male', floor: 1, image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=400', haptic: [80, 50, 80], emoji: '👔', rating: 4.6 },
    { id: 6, name: 'Luxury Chrono Watch', price: 5500, category: 'Accessories', gender: 'male', floor: 3, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400', emoji: '⌚', rating: 4.8, trending: true }
  ],
  creators: [
    { id: 1, name: 'Alex Johnson', username: '@alexj_glow', avatar: 'https://i.pravatar.cc/150?u=1', verified: true, followers: '4.5K', badge: 'Diamond' },
    { id: 2, name: 'Priya Guru', username: '@priyabeauty', avatar: 'https://i.pravatar.cc/150?u=2', verified: true, followers: '3.2K', badge: 'Gold' }
  ]
};

const cartReducer = (state, action) => {
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

export default function MithasShopApp() {
  const [gender, setGender] = useState(null);
  const [page, setPage] = useState('mall'); // mall, product, cart, orders, creators
  const [activeTab, setActiveTab] = useState('products');
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [glowPoints, setGlowPoints] = useState(2500);
  const [activeFloor, setActiveFloor] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isElevating, setIsElevating] = useState(false);
  const [targetFloor, setTargetFloor] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDroneDelivering, setIsDroneDelivering] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState(new Set());
  
  const videoRef = useRef(null);
  const audioRef = useRef(new Audio());

  // --- AUDIO AMBIENCE ---
  useEffect(() => {
    if (!gender) return;
    const floor = MOCK_DATA.floors[activeFloor];
    audioRef.current.src = floor.audio;
    audioRef.current.loop = true;
    audioRef.current.volume = 0.15;
    audioRef.current.play().catch(() => console.log("Audio play blocked"));
    return () => audioRef.current.pause();
  }, [activeFloor, gender]);

  // --- VOICE COMMANDS ---
  const startVoiceCommand = () => {
    setIsListening(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTimeout(() => setIsListening(false), 2000);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      if (command.includes('fashion')) handleFloorChange(1);
      else if (command.includes('makeup')) handleFloorChange(0);
      else if (command.includes('jewelry')) handleFloorChange(2);
      else if (command.includes('accessories')) handleFloorChange(3);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
  };

  const handleFloorChange = (floorId) => {
    if (floorId === activeFloor || isElevating) return;
    setTargetFloor(floorId);
    setIsElevating(true);
    setTimeout(() => {
      setActiveFloor(floorId);
      setIsElevating(false);
    }, 2500);
  };

  const openAR = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { console.error(err); }
  };

  const closeAR = () => {
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setIsCameraOpen(false);
  };

  const captureLook = () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-white z-[500] animate-ping';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 200);
  };

  const handleCheckout = () => {
    setIsDroneDelivering(true);
    setTimeout(() => {
      setIsDroneDelivering(false);
      dispatch({ type: 'CLEAR_CART' });
      setPage('mall');
    }, 5000);
  };

  const toggleWishlist = (id) => {
    const next = new Set(wishlist);
    if (next.has(id)) next.delete(id); else next.add(id);
    setWishlist(next);
  };

  if (!gender) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-24 h-24 bg-pink-500 rounded-[35px] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(236,72,153,0.4)] animate-pulse">
          <Cpu size={48} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-2 italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">MITHAS 2076</h1>
        <p className="text-slate-500 mb-12 text-center italic text-[10px] uppercase tracking-[0.5em]">Neural Link Protocol Active</p>
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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-pink-500/30">
      <div className="max-w-md mx-auto relative min-h-screen shadow-2xl bg-slate-950 border-x border-white/5">
        
        {/* Universal Header */}
        <header className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-slate-950/80 backdrop-blur-3xl p-6 flex items-center justify-between z-50 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setGender(null)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ArrowLeft size={18} className="text-pink-500" />
            </button>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase italic text-pink-500">MITHAS 2076</h1>
              <div className="flex items-center gap-1 text-[8px] uppercase tracking-widest opacity-40">
                <MapPin size={8} /> Karamadai Node
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
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

        {/* --- MAIN CONTENT --- */}
        pt-24 px-6 pb-36">
          {page === 'mall' && (
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

              {/* Trending Banner */}
              <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[40px] relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={80} /></div>
                <div className="relative z-10">
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200">Weekly Top Nodes</span>
                   <h3 className="text-2xl font-black mt-1 italic uppercase">Glow Trending</h3>
                   <div className="flex gap-2 mt-4">
                     <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold">#SilkSarees</span>
                     <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold">#MetallicGlow</span>
                   </div>
                </div>
              </div>

              {/* Floor Switcher */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {MOCK_DATA.floors.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => handleFloorChange(f.id)}
                    className={`min-w-[120px] p-5 rounded-[35px] border transition-all flex flex-col items-center gap-2 ${activeFloor === f.id ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.1)]' : 'border-white/5 bg-white/5 opacity-50'}`}
                  >
                    <span className="text-3xl">{f.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">{f.category}</span>
                  </button>
                ))}
              </div>

              {/* Products Feed */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Current Level: {MOCK_DATA.floors[activeFloor].name}</h2>
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Music size={12} className="animate-pulse" />
                      <span className="text-[8px] font-bold uppercase">{MOCK_DATA.floors[activeFloor].music}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   {MOCK_DATA.products
                    .filter(p => (p.gender === gender || !p.gender) && p.floor === activeFloor)
                    .map(p => (
                      <div key={p.id} className="bg-white/5 border border-white/5 rounded-[35px] overflow-hidden group hover:border-pink-500/30 transition-all p-3">
                        <div className="relative aspect-[4/5] rounded-[25px] overflow-hidden mb-3">
                          <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <button 
                            onClick={() => toggleWishlist(p.id)}
                            className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
                          >
                            <Heart size={14} className={wishlist.has(p.id) ? 'fill-pink-500 text-pink-500' : 'text-white'} />
                          </button>
                          {p.trending && <div className="absolute top-3 left-3 bg-red-500 text-[8px] font-black px-2 py-1 rounded-full uppercase italic">Trending</div>}
                        </div>
                        <h4 className="text-[10px] font-black uppercase truncate px-1">{p.name}</h4>
                        <div className="flex justify-between items-center mt-2 px-1">
                          <span className="text-pink-500 font-black text-sm italic">₹{p.price}</span>
                          <button onClick={() => { setSelectedProduct(p); setPage('product'); }} className="p-2 bg-white/5 rounded-xl hover:bg-pink-500 transition-colors"><ChevronRight size={14} /></button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {page === 'product' && selectedProduct && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
              <div className="relative h-[450px] rounded-[55px] overflow-hidden border border-white/10">
                <img src={selectedProduct.image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <button onClick={() => setPage('mall')} className="absolute top-6 left-6 p-4 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl"><X size={20} /></button>
                
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">{selectedProduct.category}</span>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                       <Star size={12} className="text-yellow-500 fill-yellow-500" />
                       <span className="text-xs font-bold">{selectedProduct.rating}</span>
                       <span className="text-[10px] opacity-40 uppercase ml-2">Verified Seller: {selectedProduct.seller || 'MITHAS'}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-black italic text-pink-500">₹{selectedProduct.price}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                   onClick={openAR}
                   className="flex items-center justify-center gap-3 py-5 bg-indigo-500/10 border border-indigo-500/20 rounded-[30px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all"
                >
                  <ScanFace size={20} /> Neural Try-On
                </button>
                <button 
                   className="flex items-center justify-center gap-3 py-5 bg-white/5 border border-white/10 rounded-[30px] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <Share2 size={18} /> Social Uplink
                </button>
              </div>

              {selectedProduct.bundleWith && (
                <div className="p-6 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-white/10 rounded-[40px] relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-pink-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Synergy Bundle Available</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">🎁</div>
                     <div className="flex-grow">
                        <p className="text-[10px] font-black uppercase opacity-60">Unlock Exclusive Pack</p>
                        <p className="text-xs font-black italic">Save 20% on Neural Set</p>
                     </div>
                     <button className="px-6 py-2 bg-pink-500 rounded-xl text-[10px] font-black uppercase">View</button>
                  </div>
                </div>
              )}

              <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-slate-950/90 backdrop-blur-3xl border-t border-white/5 z-50">
                 <button 
                  onClick={() => { dispatch({ type: 'ADD_TO_CART', payload: selectedProduct }); setPage('cart'); }}
                  className="w-full py-6 bg-white text-black rounded-[35px] font-black uppercase tracking-[0.3em] text-sm shadow-[0_10px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-transform"
                 >
                   Inject to Bag
                 </button>
              </div>
            </div>
          )}

          {page === 'cart' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Secure Bag</h2>
               {cart.length === 0 ? (
                 <div className="text-center py-20 opacity-20">
                    <ShoppingBag size={80} className="mx-auto mb-6" />
                    <p className="text-sm font-black uppercase tracking-widest">Bag is Empty</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="p-5 bg-white/5 border border-white/5 rounded-[35px] flex items-center gap-5 group">
                        <img src={item.image} className="w-20 h-20 rounded-2xl object-cover" />
                        <div className="flex-grow">
                          <h4 className="text-[10px] font-black uppercase">{item.name}</h4>
                          <p className="text-pink-500 font-black italic">₹{item.price}</p>
                          <div className="flex items-center gap-4 mt-2">
                             <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, delta: -1 })} className="p-1 hover:text-pink-500"><ChevronDown size={14}/></button>
                             <span className="text-xs font-black font-mono">{item.quantity}</span>
                             <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, delta: 1 })} className="p-1 hover:text-pink-500"><ChevronUp size={14}/></button>
                          </div>
                        </div>
                        <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', id: item.id })} className="p-3 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    
                    <div className="mt-12 p-8 bg-white/5 rounded-[45px] border border-white/10 space-y-6">
                       <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black uppercase opacity-40">Credits Required</span>
                         <span className="text-3xl font-black italic">₹{cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span>
                       </div>
                       <button 
                        onClick={handleCheckout}
                        className="w-full py-6 bg-pink-500 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(236,72,153,0.3)] active:scale-95 transition-all"
                       >
                         Authorize Payment
                       </button>
                    </div>
                 </div>
               )}
            </div>
          )}

          {page === 'creators' && (
            <div className="animate-in fade-in duration-500 space-y-8">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter">Creator Nodes</h2>
               <div className="space-y-4">
                 {MOCK_DATA.creators.map(c => (
                   <div key={c.id} className="p-6 bg-white/5 border border-white/5 rounded-[40px] flex items-center gap-5">
                      <div className="relative">
                        <img src={c.avatar} className="w-16 h-16 rounded-full border-2 border-indigo-500 p-1" />
                        {c.badge === 'Diamond' && <Crown size={14} className="absolute -bottom-1 -right-1 text-cyan-400" />}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-black italic">{c.name}</h4>
                        <p className="text-[10px] text-pink-500 font-bold">{c.username}</p>
                        <p className="text-[8px] uppercase tracking-widest opacity-40 mt-1">{c.followers} Neural Followers</p>
                      </div>
                      <button className="px-5 py-2 bg-indigo-500 rounded-full text-[9px] font-black uppercase">Sync</button>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </main>

        {/* --- OVERLAYS --- */}

        {/* AR UI */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-[150] bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-72 h-[70vh] border border-white/10 rounded-[100px] relative">
                 <div className="absolute inset-0 border-[20px] border-black/20 rounded-[100px]" />
                 <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-pink-500/30 animate-scan-line" />
              </div>
            </div>
            <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-10 z-[160]">
               <button onClick={closeAR} className="p-5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10"><X size={24} /></button>
               <button onClick={captureLook} className="w-24 h-24 bg-white rounded-full border-[8px] border-pink-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-90 transition-transform">
                  <Camera size={36} className="text-black" />
               </button>
               <button className="p-5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10"><Share2 size={24} /></button>
            </div>
          </div>
        )}

        {/* Voice UI */}
        {isListening && (
          <div className="fixed inset-0 z-[400] bg-indigo-600/20 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
             <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(99,102,241,0.6)]">
                <Mic size={50} />
             </div>
             <p className="mt-10 font-black uppercase tracking-[0.4em] text-xs italic">Awaiting Voice Input...</p>
             <p className="text-[9px] mt-4 opacity-40 uppercase tracking-widest text-center">"Fashion Floor" • "Jewelry Floor" • "Makeup"</p>
          </div>
        )}

        {/* Lift Animation */}
        {isElevating && (
          <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="w-56 h-96 border-4 border-white/5 rounded-[60px] flex flex-col items-center justify-center gap-10 relative bg-white/5 backdrop-blur-3xl shadow-2xl">
              <ChevronUp size={50} className="animate-bounce text-pink-500" />
              <div className="text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                {targetFloor === 0 ? 'G' : targetFloor}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Elevating Node</p>
            </div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
               {[...Array(30)].map((_,i) => <div key={i} className="h-0.5 bg-white mb-6 animate-pulse" style={{ animationDelay: `${i*100}ms` }} />)}
            </div>
          </div>
        )}

        {/* Drone Delivery */}
        {isDroneDelivering && (
          <div className="fixed inset-0 z-[600] bg-slate-950 flex flex-col items-center justify-center p-10 text-center animate-in zoom-in duration-500">
            <div className="w-full max-w-xs h-80 bg-white/5 rounded-[60px] border border-white/10 relative overflow-hidden mb-10 shadow-2xl">
              <div className="absolute top-10 left-10 opacity-20"><Building2 size={32} /></div>
              <div className="absolute bottom-10 right-10 text-pink-500"><Navigation2 size={32} /></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-drone-path">
                 <div className="relative">
                    <Cpu size={48} className="text-white animate-spin-slow" />
                    <div className="absolute inset-0 bg-pink-500/20 blur-xl animate-pulse" />
                 </div>
              </div>
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Drone Dispatched</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mt-3 animate-pulse">Neural Path Locked: Karamadai → Hub</p>
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
          <button className="text-slate-500 hover:text-white transition-colors"><User size={26} /></button>
        </nav>

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
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}








