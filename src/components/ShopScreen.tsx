import { useState } from 'react';
import { 
  ArrowLeft, ShoppingCart, Search, Star, Heart, Filter, TrendingUp, 
  Package, ScanFace, Palette, CheckSquare, MapPin, Truck, DollarSign,
  Zap, Gift, Crown, CreditCard, Tag, ShoppingBag, Sparkles, Store,
  User, MessageCircle, Briefcase
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ShopScreenProps {
  onNavigateBack?: () => void;
  onNavigateToSellerDashboard?: () => void;
}

type ShopCategory = 'All' | 'Makeup' | 'Jewelry' | 'Fashion' | 'Footwear' | 'Skincare' | 'Bundles';
type ShopTab = 'products' | 'cart' | 'orders' | 'creators';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: ShopCategory;
  seller?: string;
  delivery?: string;
  ar?: boolean;
  bundle?: boolean;
  trending?: boolean;
  discount?: number;
  emoji?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CreatorProfile {
  id: number;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  shopItems: number;
  followers: string;
  badge: 'Diamond' | 'Gold' | 'Silver';
}

const PRODUCTS: Product[] = [
  // Makeup
  {
    id: 1,
    name: 'Red Velvet Lipstick',
    price: 899,
    image: 'https://placehold.co/300x300/ff4081/ffffff?text=Lipstick',
    rating: 4.8,
    category: 'Makeup',
    seller: 'GlowCo Beauty',
    delivery: 'Same Day',
    ar: true,
    trending: true,
    emoji: '💄'
  },
  {
    id: 2,
    name: 'Nude Lip Gloss',
    price: 699,
    image: 'https://placehold.co/300x300/d4a574/ffffff?text=Gloss',
    rating: 4.5,
    category: 'Makeup',
    seller: 'Aura Beauty',
    delivery: 'Express',
    ar: true,
    emoji: '✨'
  },
  {
    id: 3,
    name: 'Metallic Eyeshadow Palette',
    price: 1499,
    image: 'https://placehold.co/300x300/c0c0c0/ffffff?text=Palette',
    rating: 4.9,
    category: 'Makeup',
    seller: 'Urban Glow',
    delivery: '2 Days',
    ar: true,
    discount: 20,
    emoji: '🎨'
  },
  // Jewelry
  {
    id: 4,
    name: 'Golden Choker',
    price: 2499,
    image: 'https://placehold.co/300x300/ffd700/ffffff?text=Choker',
    rating: 4.9,
    category: 'Jewelry',
    seller: 'Royal Jewels',
    delivery: '3 Days',
    trending: true,
    emoji: '👑'
  },
  {
    id: 5,
    name: 'Diamond Choker',
    price: 15999,
    image: 'https://placehold.co/300x300/b9f2ff/ffffff?text=Diamond',
    rating: 5.0,
    category: 'Jewelry',
    seller: 'Luxury Gems',
    delivery: 'Express',
    emoji: '💎'
  },
  {
    id: 6,
    name: 'Pearl Earrings Set',
    price: 3499,
    image: 'https://placehold.co/300x300/ffffff/000000?text=Pearls',
    rating: 4.7,
    category: 'Jewelry',
    seller: 'Elegance Store',
    delivery: 'Same Day',
    emoji: '🌟'
  },
  // Fashion
  {
    id: 7,
    name: 'Emerald Dress',
    price: 4999,
    image: 'https://placehold.co/300x300/50c878/ffffff?text=Dress',
    rating: 4.7,
    category: 'Fashion',
    seller: 'StyleHub',
    delivery: '2 Days',
    ar: true,
    emoji: '👗'
  },
  {
    id: 8,
    name: 'Silk Saree Collection',
    price: 8999,
    image: 'https://placehold.co/300x300/ff6b9d/ffffff?text=Saree',
    rating: 4.8,
    category: 'Fashion',
    seller: 'Traditional Threads',
    delivery: 'Express',
    trending: true,
    emoji: '🎀'
  },
  // Footwear
  {
    id: 9,
    name: 'Crystal Heels',
    price: 3499,
    image: 'https://placehold.co/300x300/c0c0c0/ffffff?text=Heels',
    rating: 4.6,
    category: 'Footwear',
    seller: 'Shoe Palace',
    delivery: 'Same Day',
    emoji: '👠'
  },
  {
    id: 10,
    name: 'Designer Wedges',
    price: 2799,
    image: 'https://placehold.co/300x300/8b4513/ffffff?text=Wedges',
    rating: 4.5,
    category: 'Footwear',
    seller: 'Footwear Boutique',
    delivery: '2 Days',
    emoji: '👡'
  },
  // Skincare
  {
    id: 11,
    name: 'Vitamin C Serum',
    price: 1299,
    image: 'https://placehold.co/300x300/ffa500/ffffff?text=Serum',
    rating: 4.9,
    category: 'Skincare',
    seller: 'Derma Pure',
    delivery: 'Same Day',
    trending: true,
    emoji: '💧'
  },
  {
    id: 12,
    name: 'Hydrating Face Mask',
    price: 799,
    image: 'https://placehold.co/300x300/87ceeb/ffffff?text=Mask',
    rating: 4.6,
    category: 'Skincare',
    seller: 'SkinCare Pro',
    delivery: 'Express',
    emoji: '🌊'
  },
  {
    id: 13,
    name: 'SPF 50+ Sunscreen',
    price: 899,
    image: 'https://placehold.co/300x300/ffeb3b/ffffff?text=SPF',
    rating: 4.7,
    category: 'Skincare',
    seller: 'Sun Shield',
    delivery: 'Same Day',
    emoji: '☀️'
  },
  // Bundles
  {
    id: 14,
    name: 'Bridal Glow Bundle',
    price: 12999,
    image: 'https://placehold.co/300x300/ff1493/ffffff?text=Bundle',
    rating: 5.0,
    category: 'Bundles',
    seller: 'Mithas Glow',
    delivery: 'Express',
    bundle: true,
    discount: 30,
    emoji: '🎁'
  },
  {
    id: 15,
    name: 'Daily Glow Essentials',
    price: 3999,
    image: 'https://placehold.co/300x300/9370db/ffffff?text=Essentials',
    rating: 4.8,
    category: 'Bundles',
    seller: 'Mithas Glow',
    delivery: 'Same Day',
    bundle: true,
    discount: 25,
    emoji: '✨'
  },
];

const CREATOR_SHOPS: CreatorProfile[] = [
  {
    id: 1,
    name: 'Alex "The Glimmer" Johnson',
    username: '@alexj_glow',
    avatar: 'https://placehold.co/100x100/db2777/ffffff?text=A',
    verified: true,
    shopItems: 24,
    followers: '4.5K',
    badge: 'Diamond'
  },
  {
    id: 2,
    name: 'Priya Beauty Guru',
    username: '@priyabeauty',
    avatar: 'https://placehold.co/100x100/a855f7/ffffff?text=P',
    verified: true,
    shopItems: 18,
    followers: '3.2K',
    badge: 'Gold'
  },
  {
    id: 3,
    name: 'Seraphina Styles',
    username: '@seraphina_s',
    avatar: 'https://placehold.co/100x100/ec4899/ffffff?text=S',
    verified: true,
    shopItems: 32,
    followers: '5.8K',
    badge: 'Diamond'
  },
];

export function ShopScreen({ onNavigateBack, onNavigateToSellerDashboard }: ShopScreenProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('products');
  const [category, setCategory] = useState<ShopCategory>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success(`${product.name} quantity updated!`);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Item removed from cart');
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleToggleWishlist = (productId: number) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      toast.success('Removed from wishlist');
    } else {
      newWishlist.add(productId);
      toast.success('Added to wishlist!');
    }
    setWishlist(newWishlist);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    toast.success('🎉 Proceeding to GlowPay checkout!');
    // Here you would navigate to checkout
  };

  const handleARTrial = (product: Product) => {
    toast.success(`🎭 Opening AR Trial for ${product.name}`);
  };

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = category === 'All' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.seller?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProductCard = (product: Product) => (
    <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.trending && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> Trending
            </span>
          )}
          {product.discount && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {product.discount}% OFF
            </span>
          )}
          {product.ar && (
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <ScanFace className="w-3 h-3 mr-1" /> AR
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => handleToggleWishlist(product.id)}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition"
        >
          <Heart 
            className={`w-4 h-4 ${wishlist.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
          />
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">{product.category}</span>
          {product.emoji && <span className="text-xl">{product.emoji}</span>}
        </div>
        
        <h3 className="text-sm mt-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        
        {product.seller && (
          <p className="text-xs text-purple-600 mt-1 flex items-center">
            <Store className="w-3 h-3 mr-1" />
            {product.seller}
          </p>
        )}

        <div className="flex items-center mt-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
          {product.delivery && (
            <span className="text-xs text-green-600 ml-2 flex items-center">
              <Truck className="w-3 h-3 mr-1" />
              {product.delivery}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg text-gray-900">₹{product.price}</span>
            {product.discount && (
              <span className="text-xs text-gray-400 line-through ml-1">
                ₹{Math.round(product.price / (1 - product.discount / 100))}
              </span>
            )}
          </div>
          
          <div className="flex gap-1">
            {product.ar && (
              <button
                onClick={() => handleARTrial(product)}
                className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition"
                title="Try AR"
              >
                <ScanFace className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleAddToCart(product)}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm rounded-full hover:shadow-lg transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCartView = () => (
    <div className="p-4 pb-32">
      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-400 mb-4">Add some amazing products!</p>
          <button
            onClick={() => setActiveTab('products')}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xl mb-4">Shopping Cart ({cartCount} items)</h2>
          
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.category}</p>
                  <p className="text-lg text-gray-900 mt-1">₹{item.price}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        -
                      </button>
                      <span className="text-sm px-2">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="text-lg">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md shadow-2xl p-4 rounded-t-2xl">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-xl text-gray-900">₹{cartTotal}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center"
            >
              <CheckSquare className="w-5 h-5 mr-2" />
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderOrdersView = () => (
    <div className="p-4">
      <h2 className="text-xl mb-4">My Orders</h2>
      
      {/* Mock Orders */}
      <div className="space-y-3">
        {[
          { id: '#ORD-1234', status: 'Delivered', items: 2, total: 1598, date: 'Oct 10, 2025' },
          { id: '#ORD-1233', status: 'In Transit', items: 1, total: 899, date: 'Oct 15, 2025' },
          { id: '#ORD-1232', status: 'Processing', items: 3, total: 4299, date: 'Oct 17, 2025' },
        ].map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-gray-900">{order.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                order.status === 'In Transit' ? 'bg-blue-100 text-blue-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{order.items} items</span>
              <span className="text-gray-900">₹{order.total}</span>
            </div>
            
            <p className="text-xs text-gray-400 mt-2">{order.date}</p>
            
            <button className="mt-3 w-full py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreatorsView = () => (
    <div className="p-4">
      <h2 className="text-xl mb-2">Creator Shops</h2>
      <p className="text-sm text-gray-500 mb-4">Shop directly from your favorite Glow creators</p>
      
      <div className="space-y-3">
        {CREATOR_SHOPS.map(creator => (
          <div key={creator.id} className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={creator.avatar} 
                  alt={creator.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                />
                {creator.badge === 'Diamond' && (
                  <Crown className="w-4 h-4 text-cyan-400 absolute -bottom-1 -right-1 bg-white rounded-full" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm">{creator.name}</h3>
                  {creator.verified && (
                    <span className="text-purple-500">✓</span>
                  )}
                </div>
                <p className="text-xs text-purple-600">{creator.username}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{creator.shopItems} products</span>
                  <span className="text-xs text-gray-500">{creator.followers} followers</span>
                </div>
              </div>

              <button
                onClick={() => toast.success(`Opening ${creator.name}'s shop!`)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm hover:shadow-lg transition"
              >
                Visit Shop
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Become a Creator CTA */}
      <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center">
        <Sparkles className="w-8 h-8 mx-auto mb-2" />
        <h3 className="text-lg mb-1">Become a Creator</h3>
        <p className="text-sm mb-4 opacity-90">Start your own shop and monetize your content</p>
        <button className="px-6 py-2 bg-white text-purple-600 rounded-full hover:shadow-lg transition">
          Apply Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="shop-screen-container min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 max-w-lg mx-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onNavigateBack} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            Glow Shop
          </h1>
          <div className="flex items-center gap-2">
            {onNavigateToSellerDashboard && (
              <button
                onClick={onNavigateToSellerDashboard}
                className="p-2 hover:bg-purple-100 rounded-full transition"
                title="Seller Dashboard"
              >
                <Briefcase className="w-6 h-6 text-purple-600" />
              </button>
            )}
            <button 
              onClick={() => setActiveTab('cart')}
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {activeTab === 'products' && (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-[88px] z-30 bg-white shadow-sm p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 rounded-lg text-sm transition ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex-1 py-2 rounded-lg text-sm transition ${
            activeTab === 'cart'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Cart ({cartCount})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 rounded-lg text-sm transition ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('creators')}
          className={`flex-1 py-2 rounded-lg text-sm transition ${
            activeTab === 'creators'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Creators
        </button>
      </div>

      {/* Categories (only for products tab) */}
      {activeTab === 'products' && (
        <div className="p-4 flex space-x-3 overflow-x-auto hide-scrollbar">
          {(['All', 'Makeup', 'Jewelry', 'Fashion', 'Footwear', 'Skincare', 'Bundles'] as ShopCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full shadow-sm transition whitespace-nowrap text-sm ${
                category === cat
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                  : 'bg-white hover:shadow-md'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'products' && (
        <>
          {/* Trending Banner */}
          <div className="px-4 mb-4">
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5" />
                    Trending This Week
                  </h3>
                  <p className="text-sm opacity-90">Metallic Eyeshadows & Silk Sarees</p>
                </div>
                <Gift className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="p-4 grid grid-cols-2 gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(renderProductCard)
            ) : (
              <div className="col-span-2 text-center py-10">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'cart' && renderCartView()}
      {activeTab === 'orders' && renderOrdersView()}
      {activeTab === 'creators' && renderCreatorsView()}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
