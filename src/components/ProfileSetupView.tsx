import { useState } from 'react';
import { Sparkles, User, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth';
import { toast } from 'sonner@2.0.3';

interface ProfileSetupViewProps {
  onComplete: () => void;
}

export function ProfileSetupView({ onComplete }: ProfileSetupViewProps) {
  const { user, updateProfile, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: user?.display_name || user?.full_name || '',
    dateOfBirth: user?.date_of_birth || '',
    city: '',
    language: 'en',
    interests: [] as string[],
  });

  const interestOptions = [
    'Fashion', 'Makeup', 'Skincare', 'Jewelry', 'Sarees',
    'Lehengas', 'Western Wear', 'Footwear', 'Accessories', 'Beauty Tips'
  ];

  const toggleInterest = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest),
      });
    } else if (formData.interests.length < 5) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest],
      });
    } else {
      toast.info('You can select up to 5 interests');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    // Update profile in Supabase
    const result = await updateProfile({
      display_name: formData.displayName,
      date_of_birth: formData.dateOfBirth || null,
      preferred_language: formData.language,
      // Note: You might want to store interests in a separate table or JSONB column
      // For now, we'll just update the basic profile fields
    });

    if (result.success) {
      toast.success('Profile setup complete! 🎉');
      onComplete();
    }
  };

  const handleSkip = () => {
    toast.info('You can complete your profile later from settings');
    onComplete();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up your Glow Identity ✨</h2>
      <p className="text-sm text-gray-500 mb-6">
        This helps us personalize your AI styling and feed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name / Username */}
        <div>
          <label htmlFor="profile-name" className="block text-sm text-gray-700 mb-1 flex items-center">
            <User className="w-4 h-4 mr-1" />
            Display Name / Username
          </label>
          <input
            type="text"
            id="profile-name"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="w-full p-3 border border-pink-200 rounded-xl text-gray-700 placeholder-gray-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all"
            placeholder="E.g., Maya_Glow_Official"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            This is how others will see you on MITHAS Glow
          </p>
        </div>

        {/* Date of Birth (Optional) */}
        <div>
          <label htmlFor="dob" className="block text-sm text-gray-700 mb-1 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Date of Birth (Optional)
          </label>
          <input
            type="date"
            id="dob"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full p-3 border border-pink-200 rounded-xl text-gray-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all"
            disabled={isLoading}
          />
        </div>

        {/* City (Optional) */}
        <div>
          <label htmlFor="city" className="block text-sm text-gray-700 mb-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            City (Optional)
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full p-3 border border-pink-200 rounded-xl text-gray-700 placeholder-gray-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all"
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            disabled={isLoading}
          />
        </div>

        {/* Language Selection */}
        <div>
          <label htmlFor="language" className="block text-sm text-gray-700 mb-1">
            Primary Content Language
          </label>
          <select
            id="language"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full p-3 border border-pink-200 rounded-xl text-gray-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all appearance-none bg-white"
            disabled={isLoading}
          >
            <option value="en">English (Default)</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="ml">Malayalam</option>
            <option value="kn">Kannada</option>
          </select>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Your Interests (Select up to 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  formData.interests.includes(interest)
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isLoading}
              >
                {interest}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {formData.interests.length}/5
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-white bg-pink-500 hover:bg-pink-600 active:scale-99 transition-all flex items-center justify-center space-x-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Finish Setup & Enter GLOW</span>
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Skip Button */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={isLoading}
          className="w-full text-gray-600 text-sm hover:text-gray-900 transition mt-2"
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}
