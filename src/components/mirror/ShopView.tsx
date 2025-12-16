import { ArrowLeft, Search, ShoppingCart, ScanFace, Package, Palette, CheckSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Mode, ShopCategory, Product } from '../MirrorScreen';
import { LOOKS_DATA, PRODUCT_CATALOG, SKINCARE_PRODUCTS, SHOP_CATEGORIES } from './data';

interface ShopViewProps {
  mode: Mode;
  lookIndex: number;
  category: ShopCategory;
  onBackToMirror: () => void;
  onCategoryChange: (category: ShopCategory) => void;
  onARTrial: (product: Product) => void;
  onMicroSample: (product: Product) => void;
}

export function ShopView({
  mode,
  lookIndex,
  category,
  onBackToMirror,
  onCategoryChange,
  onARTrial,
  onMicroSample,
}: ShopViewProps) {
  const currentLook = LOOKS_DATA[mode][lookIndex];
  const productsForLook = PRODUCT_CATALOG[currentLook.name] || PRODUCT_CATALOG['Everyday Subtle Glam'];

  let filteredProducts: Product[] = [];
  let productsHeading = category;

  if (category === 'Recommended') {
    filteredProducts = productsForLook;
    productsHeading = `Recommended Products (${currentLook.name})`;
  } else if (category === 'Skincare') {
    filteredProducts = SKINCARE_PRODUCTS;
  } else {
    filteredProducts = productsForLook.filter(p => p.category === category);
  }

  const renderProductCard = (product: Product) => {
    const isSkincare = product.category === 'Skincare';

    return (
      <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg text-gray-800">{product.name}</h4>
            <span className="text-2xl">
              {product.image === 'droplets' && '💧'}
              {product.image === 'heart' && '❤️'}
              {product.image === 'sun' && '☀️'}
              {product.image === 'gem' && '💎'}
              {product.image === 'sparkles' && '✨'}
              {product.image === 'moon' && '🌙'}
              {product.image === 'zap' && '⚡'}
              {product.image === 'sun-medium' && '🌅'}
              {product.image === 'check-square' && '✅'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Category: {product.category} | Vendor: {product.seller}
          </p>
          <p className="text-sm text-gray-900 mb-3">
            ₹{product.price} <span className="text-xs text-green-600 ml-2">({product.delivery})</span>
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {product.ar && (
              <span className="text-green-500 text-xs flex items-center">
                <ScanFace className="w-4 h-4 mr-1" /> AR Trial
              </span>
            )}
            {product.bundle && (
              <span className="text-pink-500 text-xs flex items-center">
                <Package className="w-4 h-4 mr-1" /> Bundle
              </span>
            )}
          </div>

          {isSkincare ? (
            <button
              onClick={() => onMicroSample(product)}
              className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 active:scale-95 transition-transform flex items-center"
            >
              <Palette className="w-3 h-3 mr-1" /> Micro Sample
            </button>
          ) : product.ar ? (
            <button
              onClick={() => onARTrial(product)}
              className="text-xs bg-pink-500 text-white px-3 py-1 rounded-full hover:bg-pink-600 active:scale-95 transition-transform flex items-center"
            >
              <ScanFace className="w-3 h-3 mr-1" /> AR Trial
            </button>
          ) : (
            <button
              onClick={() => toast.success(`Added to Cart: ${product.name}!`)}
              className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full flex-grow bg-white">
      {/* Shop Header */}
      <div className="w-full p-4 sticky top-0 bg-white z-30 shadow-lg flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBackToMirror} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            🛍️ Glow Shop
          </h1>
          <button onClick={() => toast.success('Showing Cart contents')} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search for products or local vendors..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-full text-sm focus:border-pink-500 focus:ring-pink-500"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-scroll pb-2 scrollbar-hide">
          {SHOP_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(cat.name)}
              className={`flex-shrink-0 px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${
                category === cat.name
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="mr-1">
                {cat.icon === 'zap' && '⚡'}
                {cat.icon === 'droplets' && '💧'}
                {cat.icon === 'shirt' && '👔'}
                {cat.icon === 'sun' && '☀️'}
                {cat.icon === 'gem' && '💎'}
              </span>
              {cat.english}
            </button>
          ))}
        </div>
      </div>

      {/* Shop Content */}
      <div className="w-full p-4 flex-grow pb-24">
        {category === 'Recommended' && (
          <div className="bg-purple-600 p-4 rounded-xl shadow-xl mb-6 text-white text-center">
            <h2 className="text-xl mb-1">Buy the Full Look Bundle!</h2>
            <p className="text-sm">AI matched products for your current look: **{currentLook.name}**</p>
            <p className="text-xs mt-1 text-pink-200">Local Delivery / Express Shipping available</p>
            <button
              onClick={() => toast.success('Bundle added to cart with 20% discount!')}
              className="mt-3 bg-white text-purple-600 px-4 py-2 rounded-full text-sm hover:bg-gray-100"
            >
              Add Bundle to Cart (₹2550)
            </button>
          </div>
        )}

        {/* Product Grid */}
        <h2 className="text-xl text-gray-800 mb-4">{productsHeading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(renderProductCard)
          ) : (
            <p className="text-center text-gray-500 p-8 col-span-2">
              No products available in the **{productsHeading}** category. Try a different category!
            </p>
          )}
        </div>
      </div>

      {/* Floating Checkout */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-white/95 backdrop-blur-md shadow-2xl z-40 rounded-t-xl">
        <button
          onClick={() => toast.success('Navigating to one-click checkout with GlowPay!')}
          className="w-full py-3 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        >
          <CheckSquare className="w-5 h-5 mr-2" /> Checkout
        </button>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
