import { useState, lazy, Suspense } from 'react';
import { Home, ShoppingCart, Package, DollarSign, Settings, X, Zap, Send, Mic } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Card, Input } from './seller/shared';

// Lazy load seller screens
const SellerIntroScreen = lazy(() => import('./seller/SellerIntroScreen').then(m => ({ default: m.SellerIntroScreen })));
const SellerSetupScreen = lazy(() => import('./seller/SellerSetupScreen').then(m => ({ default: m.SellerSetupScreen })));
const SellerVerificationScreen = lazy(() => import('./seller/SellerVerificationScreen').then(m => ({ default: m.SellerVerificationScreen })));
const EnhancedSellerDashboard = lazy(() => import('./seller/EnhancedSellerDashboard').then(m => ({ default: m.EnhancedSellerDashboard })));

type SellerView = 'intro' | 'setup' | 'verification' | 'dashboard' | 'addProduct' | 'inventory' | 'orders' | 'analytics' | 'payouts' | 'promotions' | 'growthGame' | 'settings';

interface SellerPlatformProps {
  onNavigateBack?: () => void;
}

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// AI Assistant Modal Component
interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AIGlowAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Glow Assistant. How can I help set up your shop?", sender: 'ai' as const }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { id: Date.now(), text: input, sender: 'user' as const };
    setMessages([...messages, newMessage]);

    // Mock AI response
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        text: `I see you asked about "${input}". I can help you with product listings, order management, or marketing tips!`, 
        sender: 'ai' as const 
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 800);

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end justify-center z-50 p-4">
      <Card className="w-full max-w-lg h-3/4 flex flex-col p-0 animate-slide-up">
        <header className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-t-xl">
          <h3 className="text-lg flex items-center">
            <Zap className="w-5 h-5 mr-2" /> Glow Assistant 🪄
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-indigo-500 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div className="h-10"></div>
        </div>
        <div className="p-4 border-t flex space-x-3">
          <button 
            onClick={() => toast.info('🎙️ Voice listening...')} 
            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-150"
          >
            <Mic className="w-6 h-6" />
          </button>
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 mb-0"
          />
          <button 
            onClick={handleSend} 
            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition duration-150"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}

// Bottom Navigation
interface BottomNavProps {
  activeView: SellerView;
  onNavigate: (view: SellerView) => void;
}

function SellerBottomNav({ activeView, onNavigate }: BottomNavProps) {
  const hideNav: SellerView[] = ['intro', 'setup', 'verification'];
  if (hideNav.includes(activeView)) return null;

  const navItems = [
    { view: 'dashboard' as SellerView, label: 'Dashboard', icon: Home },
    { view: 'orders' as SellerView, label: 'Orders', icon: Package },
    { view: 'inventory' as SellerView, label: 'Products', icon: ShoppingCart },
    { view: 'payouts' as SellerView, label: 'Wallet', icon: DollarSign },
    { view: 'settings' as SellerView, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl flex justify-around p-2 z-40 max-w-lg mx-auto">
      {navItems.map(item => {
        const isActive = activeView === item.view;
        const Icon = item.icon;
        return (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center p-1 transition-colors duration-200 ${
              isActive ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SellerPlatform({ onNavigateBack }: SellerPlatformProps) {
  const [activeView, setActiveView] = useState<SellerView>('intro');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const navigate = (view: SellerView) => {
    setActiveView(view);
    console.log(`Seller Platform: Navigating to ${view}`);
  };

  const showAssistantButton = !['intro'].includes(activeView);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto bg-white shadow-xl min-h-screen relative">
        {/* Header for dashboard views */}
        {!['intro', 'setup', 'verification'].includes(activeView) && onNavigateBack && (
          <div className="sticky top-0 z-30 bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <button 
                onClick={onNavigateBack}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl mr-2">←</span>
                <span>Back to Shop</span>
              </button>
              <span className="text-lg">Seller Hub</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="pb-20">
          <Suspense fallback={<LoadingScreen />}>
            {activeView === 'intro' && (
              <SellerIntroScreen onGetStarted={() => navigate('setup')} />
            )}
            {activeView === 'setup' && (
              <SellerSetupScreen onComplete={() => navigate('verification')} />
            )}
            {activeView === 'verification' && (
              <SellerVerificationScreen onComplete={() => navigate('dashboard')} />
            )}
            {activeView === 'dashboard' && (
              <EnhancedSellerDashboard
                onNavigateToAddProduct={() => navigate('addProduct')}
                onNavigateToOrders={() => navigate('orders')}
                onNavigateToAnalytics={() => navigate('analytics')}
                onNavigateToPromotions={() => navigate('promotions')}
                onNavigateToPayouts={() => navigate('payouts')}
                onNavigateToGrowthGame={() => navigate('growthGame')}
              />
            )}
            {activeView === 'addProduct' && (
              <div className="p-6 min-h-screen bg-gray-50">
                <h1 className="text-2xl text-gray-900 mb-4">Add Product</h1>
                <p className="text-gray-600">Product addition screen coming soon...</p>
              </div>
            )}
            {activeView === 'inventory' && (
              <div className="p-6 min-h-screen bg-gray-50">
                <h1 className="text-2xl text-gray-900 mb-4">Inventory</h1>
                <p className="text-gray-600">Inventory management coming soon...</p>
              </div>
            )}
            {activeView === 'orders' && (
              <div className="p-6 min-h-screen bg-gray-50">
                <h1 className="text-2xl text-gray-900 mb-4">Orders</h1>
                <p className="text-gray-600">Order management coming soon...</p>
              </div>
            )}
            {activeView === 'analytics' && (
              <div className="p-6 min-h-screen bg-gray-50">
                <h1 className="text-2xl text-gray-900 mb-4">Analytics</h1>
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </div>
            )}
            {activeView === 'payouts' && (
              <div className="p-6 min-h-screen bg-gray-50">
                <h1 className="text-2xl text-gray-900 mb-4">Payouts & Wallet</h1>
                <p className="text-gray-600">Payout management coming soon...</p>
              </div>
            )}
            {activeView === 'promotions' && (
              <div className="p-6 min-h-screen bg-gray-50">
                <h1 className="text-2xl text-gray-900 mb-4">Promotions</h1>
                <p className="text-gray-600">Promotion tools coming soon...</p>
              </div>
            )}
            {activeView === 'growthGame' && (
              <div className="p-6 min-h-screen bg-gray-50">
                <h1 className="text-2xl text-gray-900 mb-4">Growth Game</h1>
                <p className="text-gray-600">Seller gamification coming soon...</p>
              </div>
            )}
            {activeView === 'settings' && (
              <div className="p-6 min-h-screen bg-gray-50">
                <h1 className="text-2xl text-gray-900 mb-4">Settings</h1>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            )}
          </Suspense>
        </div>

        {/* Bottom Navigation */}
        <SellerBottomNav activeView={activeView} onNavigate={navigate} />

        {/* AI Glow Assistant Button */}
        {showAssistantButton && (
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="fixed bottom-20 right-4 p-4 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-2xl hover:opacity-90 transition duration-300 z-50 animate-pulse"
          >
            <Zap className="w-6 h-6" />
          </button>
        )}

        {/* AI Glow Assistant Modal */}
        <AIGlowAssistantModal
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />
      </div>
    </div>
  );
}
