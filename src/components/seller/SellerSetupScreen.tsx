import { useState, useEffect } from 'react';
import { Mic, MapPin, Zap } from 'lucide-react';
import { Button, Card, Input, Dropdown, ImagePickerComponent, SectionHeader } from './shared';
import { toast } from 'sonner@2.0.3';

interface SellerSetupScreenProps {
  onComplete: () => void;
}

export function SellerSetupScreen({ onComplete }: SellerSetupScreenProps) {
  const [shopName, setShopName] = useState('');
  const [shopType, setShopType] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const shopTypes = ['Boutique', 'Jewellery', 'Beauty / Salon', 'Footwear', 'Accessories', 'General Store'];

  const handleProceed = () => {
    console.log("Attempting to proceed. Shop Name:", shopName, "| Shop Type:", shopType);
    
    let validationError = '';
    
    if (!shopName.trim()) { 
      validationError = 'Shop Name is required.';
    } else if (!shopType) {
      validationError = 'Shop Type is required.';
    } else if (!mobile.trim()) {
      validationError = 'Mobile number is required.';
    }

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError('');
    toast.success('Shop details saved! Moving to verification...');
    onComplete();
  };

  const handleVoiceInput = () => {
    toast.info("🎙️ Voice Input: Speak your shop name and type!");
    // Mock voice input
    setTimeout(() => {
      setShopName("Lakshmi Boutique");
      setShopType("Boutique");
      toast.success("Voice input captured!");
    }, 1500);
  };

  const handleLocation = () => {
    toast.info("🗺️ Getting GPS location...");
    setTimeout(() => {
      setAddress("123 Fashion Street, Peelamedu, Coimbatore");
      toast.success("Location auto-filled!");
    }, 1000);
  };

  // Clear error when inputs change
  useEffect(() => {
    if (shopName.trim() && shopType && mobile.trim()) {
      setError('');
    }
  }, [shopName, shopType, mobile]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl text-gray-900 mb-6">
        👋 Welcome to Glow Seller Hub
      </h1>

      <Card className="mb-6">
        <p className="text-sm text-gray-700 mb-4">
          🔊 <strong>Voice Intro:</strong> "Let's set up your shop in 2 minutes."
        </p>
        <div className="flex space-x-3 mb-6">
          <Button 
            title="Voice Input" 
            icon={Mic} 
            isPrimary={false} 
            onClick={handleVoiceInput} 
            className="flex-1" 
          />
          <Button 
            title="Use GPS" 
            icon={MapPin} 
            isPrimary={false} 
            onClick={handleLocation} 
            className="flex-1" 
          />
        </div>
      </Card>

      <SectionHeader title="Shop Details" />
      
      <Input 
        label="Shop Name" 
        placeholder="Lakshmi Boutique" 
        value={shopName} 
        onChange={(e) => setShopName(e.target.value)} 
      />
      
      <Dropdown 
        label="Shop Type" 
        options={shopTypes} 
        value={shopType} 
        onChange={(e) => setShopType(e.target.value)} 
      />
      
      <Input 
        label="Mobile (OTP will be sent)" 
        placeholder="+91 98765 43210" 
        type="tel"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      
      <Input 
        label="Address" 
        placeholder="Enter full shop address" 
        isTextArea 
        value={address} 
        onChange={(e) => setAddress(e.target.value)} 
      />

      <ImagePickerComponent 
        title="Upload Shop Logo / Photo" 
        multiple={true}
        onImageSelect={(files) => {
          toast.success(`${Array.isArray(files) ? files.length : 1} image(s) selected`);
        }}
      />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
          <strong className="mr-1">Error:</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <p className="text-sm text-center text-pink-600 flex items-center justify-center">
          <Zap className="w-4 h-4 mr-1" /> Want help? Talk to Glow Assistant 🪄
        </p>
        <Button title="Proceed to Verification →" onClick={handleProceed} />
      </div>
    </div>
  );
}
