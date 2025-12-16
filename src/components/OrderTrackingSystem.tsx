import { useState, useEffect } from 'react';
import { X, Package, MapPin, CheckCircle, Clock, Truck, Home, Phone, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface Order {
  id: string;
  orderId: string;
  items: OrderItem[];
  vendor: {
    name: string;
    phone: string;
    address: string;
    distance: number;
  };
  status: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  placedAt: Date;
  estimatedDelivery: Date;
  deliveryPerson?: {
    name: string;
    phone: string;
    photo?: string;
  };
  trackingSteps: TrackingStep[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface TrackingStep {
  label: string;
  timestamp?: Date;
  completed: boolean;
  icon: 'check' | 'clock' | 'truck' | 'home';
}

interface OrderTrackingProps {
  orderId: string;
  onClose: () => void;
  onRateOrder?: (orderId: string, rating: number) => void;
  onContactVendor?: (orderId: string) => void;
}

const statusColors = {
  confirmed: 'bg-blue-500',
  preparing: 'bg-yellow-500',
  out_for_delivery: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500'
};

const statusLabels = {
  confirmed: 'Order Confirmed',
  preparing: 'Being Prepared',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export function OrderTrackingSystem({ orderId, onClose, onRateOrder, onContactVendor }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    // Mock order data - In real app, fetch from API
    const mockOrder: Order = {
      id: '1',
      orderId: 'ORD-2025-001',
      items: [
        {
          id: '1',
          name: 'Banarasi Silk Saree',
          quantity: 1,
          price: 4799,
          image: 'https://placehold.co/100x100/f87171/ffffff?text=Saree'
        },
        {
          id: '2',
          name: 'Velvet Matte Lipstick',
          quantity: 2,
          price: 899,
          image: 'https://placehold.co/100x100/ef4444/ffffff?text=Lipstick'
        }
      ],
      vendor: {
        name: "Seema's Saree Emporium",
        phone: '+91 98765 43210',
        address: '123 Fashion Street, Sector 5',
        distance: 1.2
      },
      status: 'out_for_delivery',
      total: 6597,
      placedAt: new Date(Date.now() - 2700000), // 45 min ago
      estimatedDelivery: new Date(Date.now() + 900000), // 15 min from now
      deliveryPerson: {
        name: 'Rajesh Kumar',
        phone: '+91 87654 32109',
        photo: 'https://placehold.co/40x40/8b5cf6/ffffff?text=RK'
      },
      trackingSteps: [
        { label: 'Order Confirmed', timestamp: new Date(Date.now() - 2700000), completed: true, icon: 'check' },
        { label: 'Being Prepared', timestamp: new Date(Date.now() - 1800000), completed: true, icon: 'clock' },
        { label: 'Out for Delivery', timestamp: new Date(Date.now() - 600000), completed: true, icon: 'truck' },
        { label: 'Delivered', completed: false, icon: 'home' }
      ]
    };

    setOrder(mockOrder);
  }, [orderId]);

  const handleRating = (value: number) => {
    setRating(value);
    if (onRateOrder) {
      onRateOrder(orderId, value);
    }
    toast.success('Thank you for your rating!');
    setShowRating(false);
  };

  const handleContactVendor = () => {
    if (onContactVendor) {
      onContactVendor(orderId);
    } else {
      toast.success('Opening chat with vendor...');
    }
  };

  const handleCallDelivery = () => {
    if (order?.deliveryPerson) {
      toast.success(`Calling ${order.deliveryPerson.name}...`);
    }
  };

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const timeRemaining = Math.max(0, Math.floor((order.estimatedDelivery.getTime() - Date.now()) / 60000));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${statusColors[order.status]} text-white p-6 rounded-t-3xl relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8" />
              <div>
                <h2 className="text-2xl">Order Tracking</h2>
                <p className="text-white/90 text-sm">{order.orderId}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-lg">{statusLabels[order.status]}</span>
              {order.status === 'out_for_delivery' && timeRemaining > 0 && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  Arriving in ~{timeRemaining} min
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Delivery Person (if out for delivery) */}
            {order.status === 'out_for_delivery' && order.deliveryPerson && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.deliveryPerson.photo}
                      alt={order.deliveryPerson.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="text-gray-900">Your delivery partner</p>
                      <p className="text-sm text-gray-600">{order.deliveryPerson.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCallDelivery}
                    className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Phone className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Tracking Steps */}
            <div className="space-y-4">
              <h3 className="text-gray-900">Order Progress</h3>
              <div className="relative">
                {order.trackingSteps.map((step, index) => (
                  <div key={index} className="flex gap-4 relative pb-8 last:pb-0">
                    {/* Line */}
                    {index < order.trackingSteps.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-full ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    
                    {/* Icon */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.icon === 'check' && <CheckCircle className="w-5 h-5" />}
                      {step.icon === 'clock' && <Clock className="w-5 h-5" />}
                      {step.icon === 'truck' && <Truck className="w-5 h-5" />}
                      {step.icon === 'home' && <Home className="w-5 h-5" />}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 pt-1">
                      <p className={`${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {step.timestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="text-gray-900">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-900">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Info */}
            <div className="space-y-3">
              <h3 className="text-gray-900">Vendor Details</h3>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-900">{order.vendor.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{order.vendor.distance}km away</span>
                </div>
                <p className="text-sm text-gray-600 pl-7">{order.vendor.address}</p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleContactVendor}
                    className="flex-1 bg-white border border-gray-200 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </button>
                  <button
                    onClick={() => toast.success(`Calling ${order.vendor.name}...`)}
                    className="flex-1 bg-white border border-gray-200 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="text-gray-900">Payment Summary</h3>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.total - 50}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹50</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-gray-900">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {order.status === 'delivered' && !showRating && (
              <button
                onClick={() => setShowRating(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                Rate This Order
              </button>
            )}

            {/* Rating Modal */}
            {showRating && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl space-y-4">
                <h4 className="text-center text-gray-900">How was your experience?</h4>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowRating(false)}
                  className="w-full text-gray-600 text-sm"
                >
                  Maybe later
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage orders
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (orderData: Omit<Order, 'id' | 'placedAt' | 'trackingSteps'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      placedAt: new Date(),
      trackingSteps: [
        { label: 'Order Confirmed', timestamp: new Date(), completed: true, icon: 'check' },
        { label: 'Being Prepared', completed: false, icon: 'clock' },
        { label: 'Out for Delivery', completed: false, icon: 'truck' },
        { label: 'Delivered', completed: false, icon: 'home' }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrder = (orderId: string) => {
    return orders.find(o => o.orderId === orderId);
  };

  return {
    orders,
    addOrder,
    getOrder
  };
}
