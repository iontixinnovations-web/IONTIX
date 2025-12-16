import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, Package, MapPin, User, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SearchResult {
  id: string;
  type: 'product' | 'vendor' | 'content' | 'category';
  title: string;
  subtitle?: string;
  image?: string;
  icon?: 'package' | 'mappin' | 'user' | 'sparkles';
  badge?: string;
  price?: number;
  distance?: number;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (result: SearchResult) => void;
}

const recentSearches = [
  'Banarasi Saree',
  'Local makeup artists',
  'Bridal packages',
  'Lipstick',
];

const trendingSearches = [
  { query: 'Bridal makeup', count: '2.3k searches' },
  { query: 'Silk sarees', count: '1.8k searches' },
  { query: 'Wedding lehenga', count: '1.5k searches' },
  { query: 'Hair salons near me', count: '1.2k searches' },
];

export function GlobalSearch({ isOpen, onClose, onResultClick }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearchesList, setRecentSearchesList] = useState<string[]>(recentSearches);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    const timer = setTimeout(() => {
      performSearch(query);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = (searchQuery: string) => {
    const mockResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Products
    if (lowerQuery.includes('saree') || lowerQuery.includes('silk')) {
      mockResults.push({
        id: 'p1',
        type: 'product',
        title: 'Banarasi Silk Saree',
        subtitle: 'Fashion',
        image: 'https://placehold.co/60x60/f87171/ffffff?text=S',
        icon: 'package',
        badge: 'AR Available',
        price: 4999
      });
    }

    if (lowerQuery.includes('lip') || lowerQuery.includes('makeup')) {
      mockResults.push({
        id: 'p2',
        type: 'product',
        title: 'Velvet Matte Lipstick',
        subtitle: 'Makeup',
        image: 'https://placehold.co/60x60/ef4444/ffffff?text=L',
        icon: 'package',
        price: 899
      });
    }

    if (lowerQuery.includes('lehenga') || lowerQuery.includes('wedding')) {
      mockResults.push({
        id: 'p3',
        type: 'product',
        title: 'Embroidered Lehenga',
        subtitle: 'Bridal Collection',
        image: 'https://placehold.co/60x60/fb923c/ffffff?text=L',
        icon: 'package',
        badge: 'Trending',
        price: 8999
      });
    }

    // Vendors
    if (lowerQuery.includes('vendor') || lowerQuery.includes('shop') || lowerQuery.includes('store') || lowerQuery.includes('saree')) {
      mockResults.push({
        id: 'v1',
        type: 'vendor',
        title: "Seema's Saree Emporium",
        subtitle: 'Verified Vendor',
        icon: 'mappin',
        badge: '✓ Verified',
        distance: 1.2
      });
    }

    if (lowerQuery.includes('makeup') || lowerQuery.includes('artist') || lowerQuery.includes('bridal')) {
      mockResults.push({
        id: 'v2',
        type: 'vendor',
        title: "Meera's Makeover Studio",
        subtitle: 'Makeup Artist',
        icon: 'user',
        badge: '4.9★',
        distance: 0.8
      });
    }

    if (lowerQuery.includes('salon') || lowerQuery.includes('hair')) {
      mockResults.push({
        id: 'v3',
        type: 'vendor',
        title: "Glamour Hair Salon",
        subtitle: 'Hair & Beauty',
        icon: 'sparkles',
        badge: '✓ Verified',
        distance: 2.1
      });
    }

    // Categories
    if (lowerQuery.includes('fashion') || lowerQuery.includes('cloth')) {
      mockResults.push({
        id: 'c1',
        type: 'category',
        title: 'Fashion Collection',
        subtitle: '245 items',
        icon: 'sparkles'
      });
    }

    if (lowerQuery.includes('jewelry') || lowerQuery.includes('jewel')) {
      mockResults.push({
        id: 'c2',
        type: 'category',
        title: 'Jewelry & Accessories',
        subtitle: '128 items',
        icon: 'sparkles'
      });
    }

    // Content
    if (lowerQuery.includes('guide') || lowerQuery.includes('tutorial')) {
      mockResults.push({
        id: 'co1',
        type: 'content',
        title: 'DIY Bridal Makeup Guide',
        subtitle: 'Beauty Tutorials',
        icon: 'sparkles'
      });
    }

    setResults(mockResults);
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim().length === 0) return;

    // Add to recent searches
    setRecentSearchesList(prev => {
      const newList = [searchQuery, ...prev.filter(s => s !== searchQuery)];
      return newList.slice(0, 5);
    });

    performSearch(searchQuery);
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      toast.success(`Opening ${result.title}...`);
    }
    onClose();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string, icon?: string) => {
    if (icon === 'package') return <Package className="w-5 h-5" />;
    if (icon === 'mappin') return <MapPin className="w-5 h-5" />;
    if (icon === 'user') return <User className="w-5 h-5" />;
    if (icon === 'sparkles') return <Sparkles className="w-5 h-5" />;
    
    switch (type) {
      case 'product':
        return <Package className="w-5 h-5" />;
      case 'vendor':
        return <MapPin className="w-5 h-5" />;
      case 'category':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-pink-100 text-pink-600';
      case 'vendor':
        return 'bg-purple-100 text-purple-600';
      case 'category':
        return 'bg-yellow-100 text-yellow-600';
      case 'content':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-2xl mx-auto p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-down"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(query);
                  }
                }}
                placeholder="Search products, vendors, categories..."
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="hover:bg-gray-200 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Results or Suggestions */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim().length === 0 ? (
              <div className="p-4 space-y-6">
                {/* Recent Searches */}
                {recentSearchesList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Searches
                      </h3>
                      <button
                        onClick={() => setRecentSearchesList([])}
                        className="text-xs text-gray-500 hover:text-pink-600"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentSearchesList.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between"
                        >
                          <span className="text-gray-700">{search}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending Searches
                  </h3>
                  <div className="space-y-2">
                    {trendingSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(item.query)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{item.query}</span>
                          <span className="text-xs text-gray-400">{item.count}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : isSearching ? (
              <div className="p-8 text-center">
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-gray-100 rounded-xl"></div>
                  <div className="h-12 bg-gray-100 rounded-xl"></div>
                  <div className="h-12 bg-gray-100 rounded-xl"></div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 mb-1">No results found</h3>
                <p className="text-gray-500 text-sm">
                  Try searching for products, vendors, or categories
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3"
                  >
                    {result.image ? (
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${getResultColor(
                          result.type
                        )}`}
                      >
                        {getResultIcon(result.type, result.icon)}
                      </div>
                    )}
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="text-gray-900 text-sm">{result.title}</h4>
                        {result.badge && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {result.badge}
                          </span>
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">{result.subtitle}</p>
                      )}
                      {result.price && (
                        <p className="text-xs text-pink-600 mt-0.5">₹{result.price}</p>
                      )}
                      {result.distance && (
                        <p className="text-xs text-purple-600 mt-0.5">{result.distance}km away</p>
                      )}
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
