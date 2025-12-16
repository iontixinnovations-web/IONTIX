import { useState, useReducer, useMemo } from 'react';
import { 
  ArrowLeft, Package, Edit, PlusCircle, MinusCircle, Trash2, 
  Briefcase, DollarSign, TrendingUp, ShieldCheck, X, Edit3,
  BadgeIndianRupee, AlertCircle, Search, Filter, BarChart3,
  Clock, CheckCircle, Star, Store, HelpCircle, FileText
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SellerDashboardScreenProps {
  onNavigateBack?: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating?: number;
  seller?: string;
  sales?: number;
  views?: number;
}

// Initial mock products for seller
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'SAR123',
    name: 'Banarasi Silk Saree',
    price: 4999,
    category: 'Fashion',
    image: 'https://placehold.co/300x300/f87171/ffffff?text=Saree',
    stock: 45,
    rating: 4.8,
    seller: 'My Shop',
    sales: 23,
    views: 456
  },
  {
    id: 'LIP101',
    name: 'Velvet Matte Lipstick',
    price: 899,
    category: 'Makeup',
    image: 'https://placehold.co/300x300/ef4444/ffffff?text=Lipstick',
    stock: 150,
    rating: 4.7,
    seller: 'My Shop',
    sales: 87,
    views: 1234
  },
  {
    id: 'LEH456',
    name: 'Embroidered Lehenga',
    price: 8999,
    category: 'Fashion',
    image: 'https://placehold.co/300x300/fb923c/ffffff?text=Lehenga',
    stock: 20,
    rating: 4.9,
    seller: 'My Shop',
    sales: 12,
    views: 345
  },
];

// Inventory Reducer
const inventoryReducer = (state: Product[], action: any): Product[] => {
  switch (action.type) {
    case 'UPDATE_PRODUCT_DETAILS':
      return state.map(p => 
        p.id === action.payload.id 
          ? { ...p, ...action.payload.updates } 
          : p
      );
    case 'DELETE_PRODUCT':
      return state.filter(p => p.id !== action.payload.id);
    case 'UPDATE_STOCK':
      return state.map(p =>
        p.id === action.payload.id
          ? { ...p, stock: Math.max(0, p.stock + action.payload.change) }
          : p
      );
    case 'ADD_PRODUCT':
      const newId = 'PRD' + Date.now().toString().slice(-6);
      return [...state, { ...action.payload, id: newId }];
    default:
      return state;
  }
};

// Edit Product Modal
const EditProductModal = ({ 
  product, 
  onSave, 
  onClose 
}: { 
  product: Product; 
  onSave: (updates: Partial<Product>) => void; 
  onClose: () => void;
}) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock.toString());
  const [category, setCategory] = useState(product.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPrice = parseInt(price, 10);
    const updatedStock = parseInt(stock, 10);

    if (name && updatedPrice > 0 && updatedStock >= 0) {
      onSave({
        name,
        price: updatedPrice,
        stock: updatedStock,
        category
      });
      toast.success('Product updated successfully!');
      onClose();
    } else {
      toast.error('Please fill all fields correctly');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-800 sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 relative animate-in slide-in-from-bottom duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <h3 className="text-2xl text-white mb-6 flex items-center gap-2">
          <Edit3 size={24} className="text-pink-400" />
          Edit Product
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Image Preview */}
          <div className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-xl">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Product ID</p>
              <p className="text-white">{product.id}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-gray-700 text-white"
            >
              <option value="Makeup">Makeup</option>
              <option value="Fashion">Fashion</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Footwear">Footwear</option>
              <option value="Skincare">Skincare</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
              <div className="relative">
                <BadgeIndianRupee size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-gray-700 text-white"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-gray-700 text-white"
                required
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Product Modal
const AddProductModal = ({ 
  onAdd, 
  onClose 
}: { 
  onAdd: (product: Omit<Product, 'id'>) => void; 
  onClose: () => void;
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Makeup');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseInt(price, 10);
    const parsedStock = parseInt(stock, 10);

    if (name && parsedPrice > 0 && parsedStock >= 0) {
      onAdd({
        name,
        price: parsedPrice,
        stock: parsedStock,
        category,
        image: `https://placehold.co/300x300/db2777/ffffff?text=${encodeURIComponent(name.substring(0, 3))}`,
        rating: 0,
        seller: 'My Shop',
        sales: 0,
        views: 0
      });
      toast.success('Product added successfully!');
      onClose();
    } else {
      toast.error('Please fill all fields correctly');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-800 sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 relative animate-in slide-in-from-bottom duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <h3 className="text-2xl text-white mb-6 flex items-center gap-2">
          <PlusCircle size={24} className="text-green-400" />
          Add New Product
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Premium Lipstick"
              className="w-full p-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-gray-700 text-white"
            >
              <option value="Makeup">Makeup</option>
              <option value="Fashion">Fashion</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Footwear">Footwear</option>
              <option value="Skincare">Skincare</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
              <div className="relative">
                <BadgeIndianRupee size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="999"
                  className="w-full p-3 pl-10 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-gray-700 text-white placeholder-gray-500"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Initial Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className="w-full p-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 bg-gray-700 text-white placeholder-gray-500"
                required
                min="0"
              />
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200">
              Product images can be uploaded after creation. Default placeholder will be used initially.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// KYC Verification Modal
const KYCModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-800 sm:rounded-3xl rounded-t-3xl shadow-2xl p-6 relative animate-in slide-in-from-bottom duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <h3 className="text-2xl text-white mb-2 flex items-center gap-2">
          <ShieldCheck size={24} className="text-green-400" />
          Seller Verification
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Complete KYC to start selling on Mithas Glow
        </p>

        <div className="space-y-4 mb-6">
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full ${s <= step ? 'bg-green-500' : 'bg-gray-600'}`} />
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-white">Step 1: Business Details</h4>
              <input
                type="text"
                placeholder="Business/Shop Name"
                className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="GST Number (Optional)"
                className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-500"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-white">Step 2: Contact Information</h4>
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-500"
              />
              <input
                type="email"
                placeholder="Business Email"
                className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-500"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-white">Step 3: Documents</h4>
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">Upload Aadhaar/PAN Card</p>
                <button className="mt-3 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm">
                  Choose File
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                toast.success('KYC verification submitted!');
                onClose();
              }
            }}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition"
          >
            {step < 3 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Row Component
const ProductRow = ({ 
  product, 
  onEdit, 
  onDelete, 
  onStockChange 
}: { 
  product: Product; 
  onEdit: () => void; 
  onDelete: () => void;
  onStockChange: (change: number) => void;
}) => {
  return (
    <div className="flex items-center p-3 rounded-xl mb-2 bg-gray-700/50 shadow-sm border border-gray-600">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-12 h-12 rounded-lg object-cover mr-3"
      />
      
      <div className="flex-1 min-w-0">
        <p className="text-white truncate">{product.name}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-pink-400">₹{product.price.toLocaleString('en-IN')}</span>
          <span className={`text-sm ${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            Stock: {product.stock}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          title="Edit Product"
          className="p-2 text-blue-400 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onStockChange(1)}
          title="Add Stock"
          className="p-2 text-green-400 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition"
        >
          <PlusCircle size={16} />
        </button>
        <button
          onClick={() => onStockChange(-1)}
          disabled={product.stock <= 0}
          title="Remove Stock"
          className="p-2 text-yellow-400 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/30 disabled:opacity-30 transition"
        >
          <MinusCircle size={16} />
        </button>
        <button
          onClick={onDelete}
          title="Delete Product"
          className="p-2 text-red-400 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// Main Component
export function SellerDashboardScreen({ onNavigateBack }: SellerDashboardScreenProps) {
  const [inventory, dispatch] = useReducer(inventoryReducer, INITIAL_PRODUCTS);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isVerified, setIsVerified] = useState(true); // Mock verification status

  const filteredInventory = useMemo(() => {
    return inventory.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, filterCategory]);

  const totalListings = inventory.length;
  const totalStock = inventory.reduce((acc, p) => acc + p.stock, 0);
  const totalValue = inventory.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalSales = inventory.reduce((acc, p) => acc + (p.sales || 0), 0);

  const handleEditProduct = (updates: Partial<Product>) => {
    if (productToEdit) {
      dispatch({
        type: 'UPDATE_PRODUCT_DETAILS',
        payload: {
          id: productToEdit.id,
          updates
        }
      });
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      dispatch({ type: 'DELETE_PRODUCT', payload: { id: productId } });
      toast.success('Product deleted successfully');
    }
  };

  const handleStockChange = (productId: string, change: number) => {
    dispatch({ type: 'UPDATE_STOCK', payload: { id: productId, change } });
  };

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const categories = ['All', 'Makeup', 'Fashion', 'Jewelry', 'Footwear', 'Skincare'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white max-w-lg mx-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-md shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={onNavigateBack} 
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Seller Dashboard</h1>
          <button
            onClick={() => setShowKYCModal(true)}
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Verification Status */}
        {!isVerified && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-200">KYC verification pending</p>
            </div>
            <button
              onClick={() => setShowKYCModal(true)}
              className="text-sm text-yellow-400 hover:text-yellow-300"
            >
              Complete
            </button>
          </div>
        )}
      </header>

      <div className="p-4 space-y-6">
        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl shadow-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Package size={20} className="text-pink-400" />
              <p className="text-sm text-gray-300">Listings</p>
            </div>
            <p className="text-3xl">{totalListings}</p>
          </div>

          <div className="p-4 rounded-xl shadow-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-green-400" />
              <p className="text-sm text-gray-300">Total Sales</p>
            </div>
            <p className="text-3xl">{totalSales}</p>
          </div>

          <div className="p-4 rounded-xl shadow-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Store size={20} className="text-blue-400" />
              <p className="text-sm text-gray-300">Total Stock</p>
            </div>
            <p className="text-3xl">{totalStock}</p>
          </div>

          <div className="p-4 rounded-xl shadow-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-yellow-400" />
              <p className="text-sm text-gray-300">Est. Value</p>
            </div>
            <p className="text-2xl">₹{(totalValue / 1000).toFixed(1)}K</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                  filterCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl flex items-center gap-2">
              <Package size={20} className="text-purple-400" />
              Inventory ({filteredInventory.length})
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition"
            >
              <PlusCircle size={18} />
              Add
            </button>
          </div>

          {filteredInventory.length > 0 ? (
            <div className="space-y-2">
              {filteredInventory.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={() => setProductToEdit(product)}
                  onDelete={() => handleDeleteProduct(product.id, product.name)}
                  onStockChange={(change) => handleStockChange(product.id, change)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-50" />
              <p>No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => toast.info('Analytics dashboard coming soon!')}
            className="p-4 bg-gray-800 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-700 transition"
          >
            <BarChart3 size={24} className="text-purple-400" />
            <span className="text-sm">Analytics</span>
          </button>
          <button
            onClick={() => toast.info('Order management coming soon!')}
            className="p-4 bg-gray-800 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-700 transition"
          >
            <Clock size={24} className="text-blue-400" />
            <span className="text-sm">Orders</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {productToEdit && (
        <EditProductModal
          product={productToEdit}
          onSave={handleEditProduct}
          onClose={() => setProductToEdit(null)}
        />
      )}

      {showAddModal && (
        <AddProductModal
          onAdd={handleAddProduct}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showKYCModal && (
        <KYCModal onClose={() => setShowKYCModal(false)} />
      )}

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
