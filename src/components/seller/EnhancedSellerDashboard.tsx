import { useState } from 'react';
import { 
  DollarSign, ShoppingCart, TrendingUp, CheckCircle, Gamepad2, 
  ArrowRight, Zap, Globe, ClipboardList, Camera, Package, BarChart, 
  Gift, Map
} from 'lucide-react';
import { Button, Card, SectionHeader, SummaryCard } from './shared';
import { toast } from 'sonner@2.0.3';

interface EnhancedSellerDashboardProps {
  onNavigateToAddProduct: () => void;
  onNavigateToOrders: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToPromotions: () => void;
  onNavigateToPayouts: () => void;
  onNavigateToGrowthGame: () => void;
}

export function EnhancedSellerDashboard({ 
  onNavigateToAddProduct,
  onNavigateToOrders,
  onNavigateToAnalytics,
  onNavigateToPromotions,
  onNavigateToPayouts,
  onNavigateToGrowthGame
}: EnhancedSellerDashboardProps) {
  const kpis = [
    { title: "Daily Sales", value: "₹1,250", icon: DollarSign, color: 'primary' as const },
    { title: "Orders", value: "3", icon: ShoppingCart, color: 'accent' as const },
    { title: "Views Today", value: "520", icon: TrendingUp, color: 'primary' as const },
  ];

  return (
    <div className="p-4 sm:p-6 pb-20 bg-gray-50 min-h-screen">
      {/* Shop Header */}
      <Card className="mb-6 p-4 flex items-center justify-between border-t-4 border-t-pink-600">
        <div>
          <h1 className="text-2xl text-gray-900">
            🏪 Alpha Seller Boutique
          </h1>
          <p className="text-sm text-green-600 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" /> Verified Vendor
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Wallet Balance</p>
          <p className="text-2xl text-pink-600">₹4,520</p>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map(kpi => (
          <SummaryCard key={kpi.title} {...kpi} className="col-span-1" />
        ))}
      </div>

      {/* Growth Game Card */}
      <Card className="mb-6 bg-indigo-50 border-indigo-200">
        <div className="flex items-center justify-between">
          <SectionHeader title="Seller Growth Game" icon={Gamepad2} className="mb-0 text-indigo-800" />
          <button 
            onClick={onNavigateToGrowthGame} 
            className="text-sm text-indigo-600 flex items-center hover:underline"
          >
            View Levels <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-indigo-700">Level 3: Expert Seller (85% to Level 4)</p>
          <div className="w-full bg-indigo-200 rounded-full h-2.5 mt-1">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </Card>

      {/* Smart Suggestions & AI Insights */}
      <Card className="mb-6 p-5">
        <SectionHeader title="🧠 Smart Suggestions & AI Insights" icon={Zap} />
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span> Users in your area are searching for <strong>Bridal Blouse</strong>.
          </li>
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">•</span> Try boosting <strong>"Kundan Earrings Set"</strong> for ₹99 to increase visibility.
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span> <strong>Glow Pulse Alert:</strong> New order received from <strong>Keerthana</strong>.
          </li>
        </ul>
        <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-100">
          <Button 
            title="View 3D Shop Preview" 
            icon={Globe} 
            isPrimary={false} 
            className="flex-1"
            onClick={() => toast.info('3D shop preview coming soon!')}
          />
          <Button 
            title="Manage Payouts" 
            icon={DollarSign} 
            isPrimary={true} 
            className="flex-1" 
            onClick={onNavigateToPayouts} 
          />
        </div>
      </Card>

      {/* Quick Actions & Local Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <SectionHeader title="Quick Actions" icon={ClipboardList} />
          <div className="grid grid-cols-2 gap-3">
            <Button title="Add Product" icon={Camera} onClick={onNavigateToAddProduct} isPrimary={true} />
            <Button title="View Orders" icon={Package} onClick={onNavigateToOrders} isPrimary={false} />
            <Button title="Analytics" icon={BarChart} onClick={onNavigateToAnalytics} isPrimary={false} />
            <Button title="Promotions" icon={Gift} onClick={onNavigateToPromotions} isPrimary={false} />
          </div>
        </Card>
        
        <Card className="p-5">
          <SectionHeader title="📍 Nearby Insights Map" icon={Map} />
          <div className="h-32 w-full bg-gray-200 rounded-lg flex items-center justify-center relative">
            <div className="absolute top-1/3 left-1/4 bg-red-500 h-4 w-4 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-600">
              🔴 <strong>Hotspot:</strong> Peelamedu (320 active buyers)
            </p>
          </div>
          <button 
            className="mt-3 w-full text-sm text-pink-600 hover:underline"
            onClick={() => toast.info('Local HeatMap Ads coming soon!')}
          >
            Launch Local HeatMap Ads
          </button>
        </Card>
      </div>
    </div>
  );
}
