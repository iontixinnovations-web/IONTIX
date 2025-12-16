import { Button } from './shared';

interface SellerIntroScreenProps {
  onGetStarted: () => void;
}

export function SellerIntroScreen({ onGetStarted }: SellerIntroScreenProps) {
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-white text-center">
      <img
        src="https://placehold.co/200x200/ff512f/ffffff?text=MITHAS+Glow"
        alt="Seller Intro"
        className="mb-8 w-48 h-48 rounded-3xl shadow-lg"
      />
      <h1 className="text-3xl text-gray-900 mb-3">
        Become a Seller on MITHAS Glow
      </h1>
      <p className="text-lg text-gray-600 mb-10 max-w-sm">
        List your products, reach local buyers, and grow your business fast!
      </p>
      <Button
        title="Start Free"
        onClick={onGetStarted}
        className="w-full max-w-xs"
      />
      <p className="text-sm text-gray-500 mt-4">
        ✨ AI-powered setup • 📍 Local reach • 💰 Quick payouts
      </p>
    </div>
  );
}
