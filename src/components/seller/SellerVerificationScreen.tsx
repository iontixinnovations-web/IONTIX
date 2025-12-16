import { useState } from 'react';
import { Phone, FileText, Banknote } from 'lucide-react';
import { Button, Card, Input, ImagePickerComponent, SectionHeader } from './shared';
import { toast } from 'sonner@2.0.3';

interface SellerVerificationScreenProps {
  onComplete: () => void;
}

export function SellerVerificationScreen({ onComplete }: SellerVerificationScreenProps) {
  const [otp, setOtp] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upi, setUpi] = useState('');

  const handleSubmit = () => {
    if (!otp || otp.length < 6) {
      toast.error('Please enter valid OTP');
      return;
    }
    if (!accountNumber || !ifsc) {
      toast.error('Please enter bank details');
      return;
    }
    
    toast.success("✅ Verification complete! Creating your dashboard...");
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const handleResendOTP = () => {
    toast.success('OTP resent to your mobile number');
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl text-gray-900 mb-6">
        Shop Verification (KYC)
      </h1>

      <Card className="mb-6">
        <SectionHeader title="OTP Confirmation" icon={Phone} className="mb-3" />
        <p className="text-sm text-gray-600 mb-3">Enter OTP sent to your registered mobile number.</p>
        <Input 
          placeholder="Enter 6-digit OTP" 
          type="text" 
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="text-center text-lg tracking-widest" 
        />
        <button 
          onClick={handleResendOTP}
          className="text-xs text-pink-600 text-right mt-1 cursor-pointer hover:underline w-full"
        >
          Resend OTP
        </button>
      </Card>

      <Card className="mb-6">
        <SectionHeader title="ID Proof & Bank Details" icon={FileText} className="mb-3" />
        <ImagePickerComponent 
          title="Upload Aadhar / Pan Card" 
          multiple={false}
          onImageSelect={(file) => {
            toast.success('ID proof uploaded');
          }}
        />

        <SectionHeader title="Bank Details for Payouts" icon={Banknote} className="mb-3 mt-6" />
        <Input 
          placeholder="Account Number" 
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />
        <Input 
          placeholder="IFSC Code"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value)}
        />
        <Input 
          placeholder="UPI ID (optional)"
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
        />
      </Card>

      <Button title="Submit & Create Dashboard" onClick={handleSubmit} className="mt-6" />
    </div>
  );
}
