import { useState, useEffect, useMemo, useReducer, useCallback } from 'react';
import { 
  Search, ShoppingCart, Camera, User, ArrowLeft, X, Star, MapPin, 
  Zap, Award, Sparkles, Filter, ShieldCheck, Mic, Share2, Sun, Moon, 
  Briefcase, HelpCircle, Edit3, Bell, ChevronRight, Clock, 
  BadgeIndianRupee, Package, PlusCircle, Trash2, Edit, MinusCircle,
  FileText, TrendingUp, Heart, Home, Film, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  gender: 'female' | 'male';
  image: string;
  has_ar_model: boolean;
  bundle_tags?: string[];
  recommendations?: string[];
  rating: number;
  asSeenInReels?: boolean;
  stock: number;
  seller?: string;
  sales?: number;
  views?: number;
  vendorOffers?: VendorOffer[];
}

interface VendorOffer {
  vendorId: string;
  price: number;
  delivery_eta: string;
}

interface LocalVendor {
  id: string;
  name: string;
  distance_km: number;
  trust_score: number;
  verified_tag: boolean;
}

interface CartItem extends Product {
  quantity: number;
  vendor?: string;
}

interface MithasShopAppProps {
  onNavigateBack?: () => void;
  onNavigateToSellerDashboard?: () => void;
}

type Page = 'landing' | 'category' | 'product' | 'cart' | 'profile' | 'shop';

// --- MOCK DATA ---
const getMockData = () => {
  const products: Product[] = [
    {
      id: 'SAR123',
      name: 'Banarasi Silk Saree',
      price: 4999,
      category: 'Fashion',
      gender: 'female',
      image: 'https://placehold.co/400x600/f87171/ffffff?text=Saree',
      has_ar_model: true,
      bundle_tags: ['bridal', 'ethnic'],
      recommendations: ['JEW456', 'LIP101'],
      rating: 4.8,
      asSeenInReels: true,
      stock: 45,
      vendorOffers: [
        { vendorId: 'V1', price: 4799, delivery_eta: '15 min' },
        { vendorId: 'V2', price: 4999, delivery_eta: '30 min' },
        { vendorId: 'V3', price: 4899, delivery_eta: '45 min' },
      ],
    },
    {
      id: 'LEH456',
      name: 'Embroidered Lehenga',
      price: 8999,
      category: 'Fashion',
      gender: 'female',
      image: 'https://placehold.co/400x600/fb923c/ffffff?text=Lehenga',
      has_ar_model: true,
      bundle_tags: ['wedding', 'party'],
      recommendations: ['JEW123'],
      rating: 4.9,
      stock: 20,
      vendorOffers: [{ vendorId: 'V2', price: 8999, delivery_eta: '30 min' }],
    },
    {
      id: 'LIP101',
      name: 'Velvet Matte Lipstick',
      price: 899,
      category: 'Makeup',
      gender: 'female',
      image: 'https://placehold.co/400x400/ef4444/ffffff?text=Lipstick',
      has_ar_model: true,
      bundle_tags: ['glam', 'party'],
      recommendations: ['FOU102', 'KAJ103'],
      rating: 4.7,
      asSeenInReels: true,
      stock: 150,
      vendorOffers: [{ vendorId: 'V4', price: 849, delivery_eta: '10 min' }],
    },
    {
      id: 'MKU301',
      name: 'Linen Kurta Pajama',
      price: 2999,
      category: 'Fashion',
      gender: 'male',
      image: 'https://placehold.co/400x600/60a5fa/ffffff?text=Kurta',
      has_ar_model: true,
      bundle_tags: ['ethnic', 'wedding'],
      recommendations: ['WAT303'],
      rating: 4.7,
      asSeenInReels: true,
      stock: 75,
      vendorOffers: [{ vendorId: 'V5', price: 2999, delivery_eta: '1 hr' }],
    },
    {
      id: 'FOU102',
      name: '24H Coverage Foundation',
      price: 1499,
      category: 'Makeup',
      gender: 'female',
      image: 'https://placehold.co/400x400/fca5a5/ffffff?text=Foundation',
      has_ar_model: true,
      bundle_tags: ['bridal', 'daily'],
      recommendations: ['LIP101'],
      rating: 4.6,
      stock: 60,
      vendorOffers: [],
    },
    {
      id: 'SUI302',
      name: 'Classic Tuxedo Suit',
      price: 9999,
      category: 'Fashion',
      gender: 'male',
      image: 'https://placehold.co/400x600/3b82f6/ffffff?text=Suit',
      has_ar_model: true,
      bundle_tags: ['party', 'formal'],
      recommendations: ['WAT303'],
      rating: 4.9,
      stock: 15,
      vendorOffers: [],
    },
    {
      id: 'JEW456',
      name: 'Golden Choker Set',
      price: 3499,
      category: 'Jewelry',
      gender: 'female',
      image: 'https://placehold.co/400x400/ffd700/ffffff?text=Choker',
      has_ar_model: false,
      rating: 4.8,
      stock: 30,
      vendorOffers: [{ vendorId: 'V1', price: 3299, delivery_eta: '20 min' }],
    },
    {
      id: 'WAT303',
      name: 'Premium Watch',
      price: 5999,
      category: 'Accessories',
      gender: 'male',
      image: 'https://placehold.co/400x400/2d3748/ffffff?text=Watch',
      has_ar_model: false,
      rating: 4.7,
      stock: 25,
      vendorOffers: [],
    },
  ];

  const localVendors: LocalVendor[] = [
    { id: 'V1', name: "Seema's Saree Emporium", distance_km: 1.2, trust_score: 4.8, verified_tag: true },
    { id: 'V2', name: "Kala Mandir", distance_km: 2.4, trust_score: 4.6, verified_tag: true },
    { id: 'V3', name: "Nandhini Trends", distance_km: 3.0, trust_score: 4.7, verified_tag: true },
    { id: 'V4', name: "The Lipstick Store", distance_km: 0.8, trust_score: 4.9, verified_tag: true },
    { id: 'V5', name: "Men's Attire Co.", distance_km: 4.1, trust_score: 4.5, verified_tag: true },
  ];

  return { products, localVendors };
};

const MOCK_DATA = getMockData();

// --- THEMES ---
const getThemes = () => ({
  isNight: new Date().getHours() < 6 || new Date().getHours() >= 18,
  female: {
    day: {
      bg: 'bg-pink-50',
      text: 'text-gray-900',
      accent: 'bg-pink-300',
      accentText: 'text-pink-600',
      primary: 'bg-pink-500',
      secondary: 'bg-white',
      secondaryText: 'text-gray-800',
      cardBg: 'bg-pink-100',
    },
    night: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      accent: 'bg-pink-600',
      accentText: 'text-pink-400',
      primary: 'bg-pink-500',
      secondary: 'bg-gray-800',
      secondaryText: 'text-white',
      cardBg: 'bg-gray-700',
    },
  },
  male: {
    day: {
      bg: 'bg-blue-50',
      text: 'text-gray-900',
      accent: 'bg-blue-300',
      accentText: 'text-blue-600',
      primary: 'bg-blue-500',
      secondary: 'bg-white',
      secondaryText: 'text-gray-800',
      cardBg: 'bg-blue-100',
    },
    night: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      accent: 'bg-blue-600',
      accentText: 'text-blue-400',
      primary: 'bg-blue-500',
      secondary: 'bg-gray-800',
      secondaryText: 'text-white',
      cardBg: 'bg-gray-700',
    },
  },
});

// --- CART REDUCER ---
const cartReducer = (state: CartItem[], action: any): CartItem[] => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state.map(item =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...state, { ...action.payload, quantity: 1, vendor: action.vendor }];
    }
    case 'ADD_BUNDLE_TO_CART': {
      let newState = [...state];
      action.payload.forEach((bundleItem: Product) => {
        if (!newState.find(item => item.id === bundleItem.id)) {
          newState.push({ ...bundleItem, quantity: 1 });
        }
      });
      return newState;
    }
    case 'REMOVE_FROM_CART':
      return state.filter(item => item.id !== action.payload.id);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

// --- SMART VENDOR SORTING ---
const sortVendors = (vendorOffers: VendorOffer[] = []) => {
  if (!vendorOffers || vendorOffers.length === 0) return [];

  const populatedOffers = vendorOffers.map(offer => {
    const vendorDetails = MOCK_DATA.localVendors.find(v => v.id === offer.vendorId);
    return { ...offer, ...vendorDetails };
  });

  const minPrice = Math.min(...populatedOffers.map(v => v.price));

  const scoredVendors = populatedOffers.map(vendor => {
    const price_weight = 0.4;
    const distance_weight = 0.3;
    const trust_weight = 0.3;

    const priceScore = price_weight * (minPrice / vendor.price);
    const distanceScore = distance_weight * (1 / (vendor.distance_km || 1));
    const trustScore = trust_weight * ((vendor.trust_score || 0) / 5);

    const totalScore = priceScore + distanceScore + trustScore;
    return { ...vendor, score: totalScore };
  });

  return scoredVendors.sort((a, b) => (b.score || 0) - (a.score || 0));
};

// --- COMPONENTS ---
const GenderSelection = ({ onSelect }: { onSelect: (gender: 'female' | 'male') => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
    <h1 className="text-4xl mb-2">Welcome to MITHAS</h1>
    <p className="text-lg mb-12 text-gray-400">Select your preferred experience:</p>
    <div className="flex gap-6">
      <button
        onClick={() => onSelect('female')}
        className="flex flex-col items-center p-8 rounded-2xl bg-pink-500 hover:bg-pink-600 transition shadow-2xl w-40"
      >
        <div className="text-5xl mb-3">👩</div>
        <span className="text-lg">Women's</span>
      </button>
      <button
        onClick={() => onSelect('male')}
        className="flex flex-col items-center p-8 rounded-2xl bg-blue-500 hover:bg-blue-600 transition shadow-2xl w-40"
      >
        <div className="text-5xl mb-3">👨</div>
        <span className="text-lg">Men's</span>
      </button>
    </div>
  </div>
);

const Header = ({
  theme,
  goBack,
  cartCount,
  timeOfDay,
  onCartClick,
}: {
  theme: any;
  goBack: () => void;
  cartCount: number;
  timeOfDay: string;
  onCartClick: () => void;
}) => (
  <header className={`fixed top-0 left-0 right-0 max-w-md mx-auto ${theme.secondary} shadow-md p-4 flex items-center justify-between z-20`}>
    <button onClick={goBack} className={`p-2 rounded-full ${theme.cardBg} active:scale-95 transition-transform`}>
      <ArrowLeft size={24} />
    </button>
    <div className="flex items-center space-x-4">
      <div className={`text-sm p-2 rounded-full ${theme.cardBg} flex items-center gap-1`}>
        {timeOfDay === 'day' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-blue-400" />}
        {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
      </div>
      <button onClick={onCartClick} className={`relative p-2 rounded-full ${theme.cardBg} active:scale-95 transition-transform`}>
        <ShoppingCart size={24} />
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
        )}
      </button>
    </div>
  </header>
);

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <section className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-2xl">{title}</h2>
    </div>
    {children}
  </section>
);

const ProductCard = ({
  product,
  theme,
  onClick,
}: {
  product: Product;
  theme: any;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`p-3 rounded-xl shadow-md ${theme.secondary} cursor-pointer hover:shadow-lg transition-transform active:scale-[0.98]`}
  >
    <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg" />
    <h4 className="mt-2 text-sm truncate">{product.name}</h4>
    <p className={`text-lg ${theme.accentText}`}>₹{product.price.toLocaleString('en-IN')}</p>
    <div className="flex items-center text-xs opacity-70 mt-1">
      <Star size={12} className="text-yellow-400 fill-current mr-1" /> {product.rating}
    </div>
  </div>
);

const LandingPage = ({
  theme,
  viewCategory,
  viewProduct,
  inventory,
  gender,
  setShowKycModal,
}: any) => {
  const filteredCategories = [...new Set(MOCK_DATA.products.filter(p => p.gender === gender).map(p => p.category))];
  const recentReelsProducts = inventory.filter((p: Product) => p.gender === gender && p.asSeenInReels).slice(0, 4);
  const nearbyVendors = MOCK_DATA.localVendors.slice(0, 3);

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className={`p-4 rounded-xl shadow-lg ${theme.secondary}`}>
        <div className="relative">
          <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 opacity-70 ${theme.accentText}`} />
          <input
            type="text"
            placeholder="Search products, brands..."
            className={`w-full p-3 pl-10 rounded-full ${theme.cardBg} focus:outline-none`}
          />
        </div>
      </div>

      <Section title="Explore Categories" icon={<Filter size={20} className={theme.accentText} />}>
        <div className="flex overflow-x-auto space-x-3 pb-2 hide-scrollbar">
          {filteredCategories.map(category => (
            <button
              key={category}
              onClick={() => viewCategory(category)}
              className={`flex-shrink-0 w-24 h-24 p-3 rounded-xl shadow-md ${theme.accent} text-black flex flex-col items-center justify-center transition hover:scale-105`}
            >
              <Briefcase size={28} />
              <span className="text-sm mt-1">{category}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Nearby Vendors" icon={<MapPin size={20} className={theme.accentText} />}>
        <div className="space-y-3">
          {nearbyVendors.map(vendor => (
            <div key={vendor.id} className={`p-4 rounded-xl ${theme.secondary} flex items-center justify-between`}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{vendor.name}</h3>
                  {vendor.verified_tag && <ShieldCheck size={16} className="text-green-400" />}
                </div>
                <div className="flex items-center gap-3 text-xs opacity-70 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {vendor.distance_km} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-current text-yellow-400" /> {vendor.trust_score}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="opacity-50" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="As Seen In Reels" icon={<Mic size={20} className={theme.accentText} />}>
        <div className="grid grid-cols-2 gap-4">
          {recentReelsProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} theme={theme} onClick={() => viewProduct(product)} />
          ))}
        </div>
      </Section>

      <Section title="Become a MITHAS Seller" icon={<Share2 size={20} className={theme.accentText} />}>
        <button
          onClick={() => setShowKycModal(true)}
          className={`w-full ${theme.primary} text-white py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform`}
        >
          Start Listing Products <ChevronRight size={20} />
        </button>
      </Section>
    </div>
  );
};

const CategoryPage = ({ theme, category, viewProduct, inventory, gender }: any) => {
  const products = inventory.filter((p: Product) => p.category === category && p.gender === gender);
  
  return (
    <div className="p-4 animate-fade-in">
      <h2 className="text-3xl mb-6 flex items-center">
        <Filter size={24} className={theme.accentText} />
        <span className="ml-2">{category}</span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} theme={theme} onClick={() => viewProduct(product)} />
        ))}
      </div>
    </div>
  );
};

const ProductDetailPage = ({ theme, product, dispatch, setShowArModal, setShowBundleSheet, showToast, findProduct, viewProduct }: any) => {
  const recommended = (product.recommendations || []).map((id: string) => findProduct(id)).filter(Boolean);
  const sortedLocalVendors = useMemo(() => sortVendors(product.vendorOffers), [product.vendorOffers]);

  const handleAddToCart = (vendor: any = null) => {
    const vendorName = vendor ? vendor.name : 'MITHAS';
    dispatch({ type: 'ADD_TO_CART', payload: product, vendor: vendorName });
    showToast(`${product.name} added to cart!`, <ShoppingCart size={16} />);
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-auto object-cover" />
        {product.has_ar_model && (
          <button
            onClick={() => setShowArModal(true)}
            className="absolute top-4 left-4 flex items-center gap-2 bg-black bg-opacity-60 text-white py-1.5 px-3 rounded-full text-sm backdrop-blur-sm animate-pulse"
          >
            <Camera size={16} /> AR Try-On
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        <h1 className="text-3xl">{product.name}</h1>
        <div className="flex justify-between items-center">
          <p className={`text-2xl ${theme.accentText}`}>₹{product.price.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1">
            <Star size={20} className="fill-current text-yellow-400" /> <span>{product.rating}</span>
          </div>
        </div>

        {sortedLocalVendors.length > 0 && (
          <Section title="Available Nearby" icon={<MapPin className={theme.accentText} />}>
            <div className="space-y-3">
              {sortedLocalVendors.map((vendor: any) => (
                <div key={vendor.id} className={`p-3 rounded-lg ${theme.secondary} border border-white/10`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3>{vendor.name}</h3>
                        <ShieldCheck size={16} className="text-green-400" />
                      </div>
                      <div className="flex items-center gap-3 text-xs opacity-80 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {vendor.distance_km} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={12} /> {vendor.trust_score}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(vendor)}
                      className={`${theme.primary} text-white text-sm py-2 px-4 rounded-lg active:scale-95 transition-transform`}
                    >
                      Buy Now
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-sm">
                    <p className="text-lg">₹{vendor.price.toLocaleString('en-IN')}</p>
                    <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${theme.cardBg}`}>
                      <Zap size={12} className={theme.accentText} /> {vendor.delivery_eta} Delivery
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {recommended.length > 0 && (
          <Section title="Complete The Look" icon={<Zap className={theme.accentText} />}>
            <div className="flex overflow-x-auto space-x-4 pb-2 -mx-4 px-4 hide-scrollbar">
              {recommended.map((rec: Product) => (
                <div key={rec.id} className="w-36 flex-shrink-0">
                  <ProductCard product={rec} theme={theme} onClick={() => viewProduct(rec)} />
                </div>
              ))}
            </div>
          </Section>
        )}

        <div className="flex flex-col gap-2 pt-4">
          {product.bundle_tags && (
            <button
              onClick={() => setShowBundleSheet(true)}
              className={`${theme.accent} text-black py-3 px-4 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform`}
            >
              <Sparkles size={20} /> Buy Full Look
            </button>
          )}
          <button
            onClick={() => handleAddToCart()}
            className={`${theme.secondary} ${theme.secondaryText} py-3 px-4 rounded-lg active:scale-95 transition-transform`}
          >
            Add to Cart from MITHAS
          </button>
        </div>
      </div>
    </div>
  );
};

const CartPage = ({ theme, cart, dispatch, glowPoints, setGlowPoints, logTransaction, setPage, showToast, findProduct }: any) => {
  const isCartEmpty = cart.length === 0;
  const cartItems = cart
    .map((item: CartItem) => ({
      ...item,
      currentDetails: findProduct(item.id) || item,
    }))
    .filter((item: any) => item.currentDetails);

  const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.currentDetails.price * item.quantity, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (isCartEmpty) return;

    logTransaction({
      items: cartItems.map((i: any) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.currentDetails.price })),
      total: total,
    });

    dispatch({ type: 'CLEAR_CART' });
    setGlowPoints((prev: number) => prev + Math.floor(total / 100));
    showToast('Order Placed Successfully!', <Award size={16} />);
    setPage('profile');
  };

  return (
    <div className="p-4 animate-fade-in">
      <h2 className="text-3xl mb-6 flex items-center gap-2">
        <ShoppingCart size={28} className={theme.accentText} />
        Your Cart
      </h2>

      {isCartEmpty ? (
        <div className={`text-center p-12 rounded-xl ${theme.secondary}`}>
          <Package size={48} className={`mx-auto ${theme.accentText} opacity-70`} />
          <p className="mt-4 text-xl opacity-80">Your MITHAS bag is empty</p>
          <p className="text-sm opacity-60 mt-1">Add items to proceed to checkout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item: any) => (
            <div key={item.id} className={`flex ${theme.secondary} p-3 rounded-xl shadow-md items-center gap-3`}>
              <img src={item.currentDetails.image} alt={item.currentDetails.name} className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-grow">
                <h3 className="truncate">{item.currentDetails.name}</h3>
                <p className="text-sm opacity-80">Vendor: {item.vendor}</p>
                <p>₹{item.currentDetails.price.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm">Qty: {item.quantity}</span>
                <button onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: { id: item.id } })} className="text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <div className={`p-4 rounded-xl ${theme.secondary} shadow-md space-y-2`}>
            <h3 className="text-lg mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm opacity-80">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm opacity-80">
              <span>Shipping</span>
              <span>₹{shipping.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10 text-xl">
              <span>Total</span>
              <span className={theme.accentText}>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className={`w-full ${theme.primary} text-white py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform`}
          >
            Checkout Now (₹{total.toLocaleString('en-IN')})
          </button>
        </div>
      )}
    </div>
  );
};

const ProfilePage = ({ theme, glowPoints, transactions, gender }: any) => (
  <div className="p-4 animate-fade-in">
    <h2 className="text-3xl mb-6">My Profile</h2>
    <div className={`${theme.secondary} p-6 rounded-xl shadow-lg mb-6`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-2xl">
          {gender === 'female' ? '👩' : '👨'}
        </div>
        <div>
          <h3 className="text-xl">MITHAS User</h3>
          <p className="text-sm opacity-70">Premium Member</p>
        </div>
      </div>
      <div className={`${theme.cardBg} p-4 rounded-lg flex items-center justify-between`}>
        <div>
          <p className="text-sm opacity-70">Glow Points</p>
          <p className="text-2xl">{glowPoints.toLocaleString()}</p>
        </div>
        <Award size={32} className={theme.accentText} />
      </div>
    </div>

    <Section title="Order History" icon={<Clock size={20} className={theme.accentText} />}>
      {transactions.length === 0 ? (
        <p className="text-center opacity-70 py-8">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn: any, idx: number) => (
            <div key={idx} className={`${theme.secondary} p-4 rounded-xl`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-70">{new Date(txn.date).toLocaleDateString()}</p>
                  <p className="mt-1">{txn.items.length} items</p>
                </div>
                <p className="text-lg">₹{txn.total.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  </div>
);

const BottomNav = ({ theme, setPage, activePage, onSellerMode }: any) => {
  const NavButton = ({ target, Icon, label, onClick }: any) => (
    <button
      onClick={onClick || (() => setPage(target))}
      className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activePage === target ? theme.accentText : 'opacity-70'}`}
    >
      <Icon size={24} className={activePage === target ? 'fill-current' : ''} />
      <span className="text-xs mt-0.5">{label}</span>
    </button>
  );

  return (
    <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${theme.secondary} shadow-2xl rounded-t-3xl border-t border-white/10 p-2 flex justify-around z-20`}>
      <NavButton target="landing" Icon={Zap} label="Shop" />
      <NavButton target="cart" Icon={ShoppingCart} label="Cart" />
      <NavButton target="seller" Icon={Briefcase} label="Sell" onClick={onSellerMode} />
      <NavButton target="profile" Icon={User} label="Profile" />
    </nav>
  );
};

// Modals
const ARTryOnModal = ({ theme, product, onClose }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50 backdrop-blur-sm">
    <div className={`w-full h-3/4 ${theme.secondary} p-6 rounded-t-3xl shadow-2xl relative animate-slide-up ${theme.text}`}>
      <h3 className="text-2xl mb-4 flex items-center gap-2">
        <Camera size={24} className={theme.accentText} /> AR Try-On
      </h3>
      <div className="flex flex-col items-center justify-center h-4/5 border border-dashed rounded-xl opacity-70">
        <Camera size={48} />
        <p className="mt-2">Simulating AR view of {product.name}</p>
      </div>
      <button onClick={onClose} className={`w-full mt-3 ${theme.primary} text-white py-3 rounded-xl`}>
        Exit AR
      </button>
      <button onClick={onClose} className="absolute top-4 right-4">
        <X size={24} />
      </button>
    </div>
  </div>
);

const BundlePreviewSheet = ({ theme, product, dispatch, onClose, showToast, findProduct }: any) => {
  const bundleProducts = MOCK_DATA.products.filter(
    p => product.recommendations?.includes(p.id) || p.id === product.id
  );
  const totalBundlePrice = bundleProducts.reduce((acc, p) => acc + p.price, 0);

  const handleBuyBundle = () => {
    dispatch({ type: 'ADD_BUNDLE_TO_CART', payload: bundleProducts });
    showToast('Full Look Bundle added!', <Sparkles size={16} />);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50 backdrop-blur-sm">
      <div className={`w-full ${theme.secondary} p-6 rounded-t-3xl shadow-2xl relative animate-slide-up ${theme.text}`}>
        <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-full ${theme.cardBg}`}>
          <X size={24} />
        </button>
        <h3 className="text-2xl mb-4 flex items-center gap-2">
          <Sparkles size={24} className={theme.accentText} /> Complete Look Bundle
        </h3>
        <div className="flex overflow-x-auto space-x-4 pb-4 border-b border-white/10 hide-scrollbar">
          {bundleProducts.map(p => (
            <div key={p.id} className="w-32 flex-shrink-0 text-center">
              <img src={p.image} alt={p.name} className="w-full h-28 object-cover rounded-lg mb-1" />
              <p className="text-sm truncate">{p.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-lg opacity-80">Bundle Price:</p>
          <p className={`text-3xl ${theme.accentText}`}>₹{totalBundlePrice.toLocaleString('en-IN')}</p>
        </div>
        <button
          onClick={handleBuyBundle}
          className={`w-full mt-6 ${theme.primary} text-white py-3 rounded-xl active:scale-[0.98]`}
        >
          Add Bundle to Cart
        </button>
      </div>
    </div>
  );
};

const KYCModal = ({ theme, onClose, onStart }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50 backdrop-blur-sm">
    <div className={`w-full ${theme.secondary} p-6 rounded-t-3xl shadow-2xl relative animate-slide-up ${theme.text}`}>
      <h3 className="text-2xl mb-4 flex items-center gap-2">
        <ShieldCheck size={24} className={theme.accentText} /> Become a Verified Seller
      </h3>
      <p className="opacity-80 mb-6">Complete KYC verification to list products in your shop.</p>
      <button 
        onClick={() => {
          if (onStart) {
            onStart();
          }
          onClose();
        }} 
        className={`w-full ${theme.primary} text-white py-3 rounded-xl`}
      >
        Start KYC Now
      </button>
      <button onClick={onClose} className="absolute top-4 right-4">
        <X size={24} />
      </button>
    </div>
  </div>
);

const ToastNotification = ({ message, icon, theme }: any) => (
  <div
    className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 p-3 ${theme.secondary} rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-fade-in`}
  >
    {icon}
    <span className="text-sm">{message}</span>
  </div>
);

// --- MAIN APP ---
export function MithasShopApp({ onNavigateBack, onNavigateToSellerDashboard }: MithasShopAppProps) {
  const [gender, setGender] = useState<'female' | 'male' | null>(null);
  const [page, setPage] = useState<Page>('landing');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showArModal, setShowArModal] = useState(false);
  const [showBundleSheet, setShowBundleSheet] = useState(false);
  const [glowPoints, setGlowPoints] = useState(2500);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [toast, setToast] = useState({ show: false, message: '', icon: null as any });
  const [cart, dispatch] = useReducer(cartReducer, []);

  const THEMES = useMemo(() => getThemes(), []);
  const timeOfDay = THEMES.isNight ? 'night' : 'day';
  const theme = gender ? THEMES[gender][timeOfDay] : THEMES.female.night;

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, icon: React.ReactNode = <Bell size={16} />) =>
    setToast({ show: true, message, icon });

  const viewCategory = (c: string) => {
    setSelectedCategory(c);
    setPage('category');
  };

  const viewProduct = (p: Product) => {
    setSelectedProduct(p);
    setPage('product');
  };

  const logTransaction = (details: any) => setTransactions(prev => [{ ...details, date: new Date() }, ...prev]);

  const goBack = () => {
    if (page === 'product') {
      // Go back to category from product detail
      setPage('category');
    } else if (page === 'category') {
      // Go back to landing from category
      setPage('landing');
    } else if (['cart', 'profile'].includes(page)) {
      // Go back to landing from cart or profile
      setPage('landing');
    } else if (page === 'landing' && onNavigateBack) {
      // Go back to main app from landing
      onNavigateBack();
    } else {
      // Fallback: reset to gender selection
      setGender(null);
    }
  };

  const findProduct = useCallback((id: string) => MOCK_DATA.products.find(p => p.id === id), []);

  const renderPage = () => {
    const commonProps = { theme, gender, showToast, findProduct };

    switch (page) {
      case 'landing':
        return (
          <LandingPage
            {...commonProps}
            viewCategory={viewCategory}
            viewProduct={viewProduct}
            inventory={MOCK_DATA.products}
            setShowKycModal={setShowKycModal}
          />
        );
      case 'category':
        return (
          <CategoryPage {...commonProps} category={selectedCategory} viewProduct={viewProduct} inventory={MOCK_DATA.products} />
        );
      case 'product':
        return (
          <ProductDetailPage
            {...commonProps}
            product={selectedProduct}
            dispatch={dispatch}
            setShowArModal={setShowArModal}
            setShowBundleSheet={setShowBundleSheet}
            viewProduct={viewProduct}
          />
        );
      case 'cart':
        return (
          <CartPage
            {...commonProps}
            cart={cart}
            dispatch={dispatch}
            glowPoints={glowPoints}
            setGlowPoints={setGlowPoints}
            logTransaction={logTransaction}
            setPage={setPage}
          />
        );
      case 'profile':
        return <ProfilePage {...commonProps} glowPoints={glowPoints} transactions={transactions} />;
      default:
        return null;
    }
  };

  if (!gender) return <GenderSelection onSelect={setGender} />;

  return (
    <div className={`min-h-screen w-full ${theme.bg} ${theme.text} transition-colors duration-500`}>
      <div className="max-w-md mx-auto relative pb-20">
        <Header theme={theme} goBack={goBack} cartCount={cart.length} timeOfDay={timeOfDay} onCartClick={() => setPage('cart')} />
        <div className="pt-16">{renderPage()}</div>
        <BottomNav 
          theme={theme} 
          setPage={setPage} 
          activePage={page}
          onSellerMode={() => {
            if (onNavigateToSellerDashboard) {
              onNavigateToSellerDashboard();
            } else {
              setShowKycModal(true);
            }
          }}
        />

        {toast.show && <ToastNotification message={toast.message} icon={toast.icon} theme={theme} />}
        {showKycModal && <KYCModal 
          theme={theme} 
          onClose={() => setShowKycModal(false)} 
          onStart={() => {
            if (onNavigateToSellerDashboard) {
              onNavigateToSellerDashboard();
            }
          }} 
        />}
        {showArModal && selectedProduct && <ARTryOnModal theme={theme} product={selectedProduct} onClose={() => setShowArModal(false)} />}
        {showBundleSheet && selectedProduct && (
          <BundlePreviewSheet
            theme={theme}
            product={selectedProduct}
            dispatch={dispatch}
            onClose={() => setShowBundleSheet(false)}
            showToast={showToast}
            findProduct={findProduct}
          />
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes slide-up {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
