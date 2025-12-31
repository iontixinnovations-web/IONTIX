import { useState, useEffect, lazy, Suspense } from "react";
import { RegisterView } from "./components/RegisterView";
import { LoginView } from "./components/LoginView";
import { OTPView } from "./components/OTPView";
import ProfileSetupView from "./components/ProfileSetupView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster, toast } from "sonner";
import { SupabaseSetupBanner } from "./components/SupabaseSetupBanner";
import { SupabaseDiagnostics } from "./components/SupabaseDiagnostics";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { AuthGuard } from "./components/AuthGuard";
import { useAuthStore } from "./lib/store";


const getInitialView = (
  isAuthenticated: boolean,
  profileCompleted: boolean
): View => {
  if (!isAuthenticated) return "register";
  if (!profileCompleted) return "profile";
  return "home";
};

// Lazy load heavy components for better performance
const HomeScreen = lazy(() =>
import("./components/HomeScreen").then((m) => ({
default: m.HomeScreen,
}))
);
const MirrorScreen = lazy(() =>
import("./components/MirrorScreen").then((m) => ({
default: m.MirrorScreen,
}))
);
const PhotoshootScreen = lazy(() =>
import("./components/PhotoshootScreen").then((m) => ({
default: m.PhotoshootScreen,
}))
);
const ChatScreen = lazy(() =>
import("./components/ChatScreen").then((m) => ({
default: m.ChatScreen,
}))
);
const ReelsScreen = lazy(() =>
import("./components/ReelsScreen").then((m) => ({
default: m.ReelsScreen,
}))
);
const MithasShopApp= lazy(() =>
import("./components/MithasShopApp").then((m) => ({
default: m.MithasShopApp,
}))
);
const InnovatorsHubScreen = lazy(() =>
import("./components/InnovatorsHubScreen").then((m) => ({
default: m.InnovatorsHubScreen,
}))
);
const ProfileScreen = lazy(() =>
import("./components/ProfileScreen").then((m) => ({
default: m.ProfileScreen,
}))
);
const SellerPlatform = lazy(() =>
import("./components/SellerPlatform").then((m) => ({
default: m.SellerPlatform,
}))
);

// Loading component
function LoadingScreen() {
return (

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">  
<div className="text-center">  
<div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>  
<p className="text-gray-600">Loading...</p>  
</div>  
</div>  
);  
}  type View =
| "register"
| "login"
| "otp"
| "profile"
| "home"
| "mirror"
| "photoshoot"
| "chat"
| "reels"
| "shop"
| "innovators"
| "userprofile"
| "sellerdashboard"
| "mithasshop";

// Theme configuration
const THEME_MAP: Record<View, string> = {
register: "mithas-theme",
login: "mithas-theme",
otp: "mithas-theme",
profile: "mithas-theme",
home: "glow-home-theme",
mirror: "glow-mirror-theme",
photoshoot: "glow-photoshoot-theme",
chat: "glow-chat-theme",
reels: "glow-reels-theme",
shop: "glow-shop-theme",
innovators: "glow-innovators-theme",
userprofile: "glow-profile-theme",
sellerdashboard: "glow-seller-theme",
mithasshop: "glow-shop-theme",
};

export default function App() {
// Replace mock state with real auth
// FIX: Simplified auth to prevent infinite loading
  
const isLoading = useAuthStore((state) => state.isLoading);
const authStore = useAuthStore();
const profileCompleted = authStore.profileCompleted;
const user = authStore.user;
const isAuthenticated = authStore.isAuthenticated;
const authLoading = false


const [isInitialLoading, setIsInitialLoading] = useState(true);
const [currentView, setCurrentView] = useState<View>("register");
const [identifier, setIdentifier] = useState("");
const [identifierType, setIdentifierType] = useState<"email" | "phone">("email");

const [chatInitialTab, setChatInitialTab] = useState<
"contacts" | "messenger" | "artist"

> ("contacts");

const navigate = (view: View) => {
  setCurrentView(view);              // ✅ correct
  window.history.pushState({ view }, "");
};
useEffect(() => {
  const initApp = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // செஷன் இருந்தால் மட்டும் டேட்டாபேஸில் செக் செய்
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', session.user.id)
          .single();

        if (profile?.profile_completed) {
          authStore.setProfileCompleted(true);
          setCurrentView('home');
        } else {
          authStore.setProfileCompleted(false);
          setCurrentView('profile');
        }
      } else {
        // செஷன் இல்லை என்றால் கண்டிப்பாக ரிஜிஸ்டர் பக்கம்
        setCurrentView('register');
      }
    } catch (error) {
      console.error("Init error:", error);
      setCurrentView('register');
    } finally {
      // இது நடந்தால் மட்டுமே ஸ்கிரீன் மாறும்
      setIsInitialLoading(false);
    }
  };

  initApp();
}, []);

useEffect(() => {
  if (isInitialLoading) return;

  if (isAuthenticated) {
    if (!profileCompleted) {
      if (currentView !== "profile") setCurrentView("profile");
    } else {
      if (["register", "login", "otp", "profile"].includes(currentView)) {
        setCurrentView("home");
      }
    }
  } else {
    if (!["login", "register", "otp"].includes(currentView)) {
      setCurrentView("register");
    }
  }
}, [isAuthenticated, profileCompleted, currentView, isInitialLoading]);




useEffect(() => {
// Optimized theme management
const newTheme = THEME_MAP[currentView] || "mithas-theme";
const allThemes = Object.values(THEME_MAP);

// Remove all themes at once
document.body.classList.remove(...allThemes);
// Add new theme
document.body.classList.add(newTheme);

return () => {
document.body.classList.remove(...allThemes);
};

}, [currentView]);

// Show loading screen while checking auth
if (authLoading) {
return <LoadingScreen />;
}

const handleSendOTP = (id: string, type: "email" | "phone") => {
setIdentifier(id);
setIdentifierType(type);
// Note: Toast is now handled in OTPView via useAuth
navigate("otp");
};

const handleVerifyOTP = () => {
  toast.success("Verification successful! Now, set up your profile.");
  
  // 1. ப்ரொபைல் இன்னும் முடியலைன்னு செட் பண்றோம்
  authStore.setProfileCompleted(false); 
  
  // 2. நேராக ப்ரொபைல் ஸ்கிரீனுக்கு அனுப்புறோம்
  setCurrentView("profile");
};



const handleResendOTP = () => {
    toast.success(`OTP resent to ${identifier}!`);
}

const handleProfileComplete = async (profileData: any) => {
  // 1. setIsLoading இருக்கிறதா என்று செக் செய்கிறோம்
  if (typeof setIsLoading !== 'undefined') setIsLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not found!");
      return;
    }

    // 2. டேட்டாபேஸில் சேமிக்கிறோம் (இங்கே 'full_name' மற்றும் 'username' முக்கியம்)
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: profileData?.displayName || '',
        username: profileData?.username || `user_${user.id.slice(0, 5)}`,
        city: profileData?.city || '',
        bio: profileData?.bio || '',
        date_of_birth: profileData?.dob || null,
        account_type: profileData?.accountType || 'normal',
        profile_completed: true, // அடுத்த முறை லாகின் பண்ணும்போது இதுதான் உதவும்
        updated_at: new Date().toISOString(),
      });

    if (upsertError) throw upsertError;

    // 3. யூசர் மெட்டாடேட்டாவிலும் அப்டேட் செய்கிறோம்
    await supabase.auth.updateUser({
      data: { profile_completed: true }
    });

    // 4. வெற்றிகரமாக முடிந்தால் மட்டுமே ஹோம் ஸ்கிரீன் போகும்
    authStore.setProfileCompleted(true);
    setCurrentView("home");
    toast.success("Profile saved perfectly! ✨");

  } catch (error: any) {
    console.error("Critical Save Error:", error.message);
    toast.error("Save Error: " + error.message);
  } finally {
    if (typeof setIsLoading !== 'undefined') setIsLoading(false);
  }
};





const handleLogin = async (userData: any) => {
  authStore.setSession(userData.session);

  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_completed')
    .eq('id', userData.user.id)
    .single();

  if (profile?.profile_completed) {
    authStore.setProfileCompleted(true);
    setCurrentView("home");
  } else {
    authStore.setProfileCompleted(false);
    setCurrentView("profile");
  }
};

// Render user profile if view is 'userprofile'
if (isInitialLoading) return <LoadingScreen />;
if (currentView === "userprofile") {
return (
<AuthGuard onUnauthenticated={() => navigate("register")}>
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<ProfileScreen onNavigateHome={() => navigate("home")} />
</Suspense>
</ErrorBoundary>
</AuthGuard>
);
}

// Render innovators hub if view is 'innovators'
if (currentView === "innovators") {
return (
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<InnovatorsHubScreen onNavigateHome={() => navigate("home")} />
</Suspense>
</ErrorBoundary>
);
}

// Render shop screen if view is 'shop' - Now shows MITHAS marketplace
if (currentView === "shop") {
return (
<AuthGuard onUnauthenticated={() => navigate("register")}>
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<MithasShopApp
onNavigateBack={() => navigate("home")}
onNavigateToSellerDashboard={() =>
navigate("sellerdashboard")
}
/>
</Suspense>
</ErrorBoundary>
</AuthGuard>
);
}

// Render seller dashboard if view is 'sellerdashboard'if (currentView === "sellerdashboard") {
if (currentView === "sellerdashboard") {
  return (
    <AuthGuard onUnauthenticated={() => navigate("login")}>
      <ErrorBoundary>
        <Toaster position="top-center" richColors />
        <Suspense fallback={<LoadingScreen />}>
          <SellerPlatform onNavigateBack={() => navigate("shop")} />
        </Suspense>
      </ErrorBoundary>
    </AuthGuard>
  );
}


// Render MITHAS shop if view is 'mithasshop'
if (currentView === "mithasshop") {
return (
<>
<Toaster position="top-center" richColors />
<MithasShopApp onNavigateBack={() => navigate("home")} />
</>
);
}

// Render reels screen if view is 'reels'
if (currentView === "reels") {
return (
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<ReelsScreen
onNavigateToShop={() => navigate("shop")}
onNavigateHome={() => navigate("home")}
onNavigateToChat={() => {
setChatInitialTab("artist");
navigate("chat");
}}
/>
</Suspense>
</ErrorBoundary>
);
}

// Render chat screen if view is 'chat'
if (currentView === "chat") {
return (
<AuthGuard onUnauthenticated={() => navigate("register")}>
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<ChatScreen
onNavigateHome={() => navigate("home")}
initialTab={chatInitialTab}
/>
</Suspense>
</ErrorBoundary>
</AuthGuard>
);
}

// Render photoshoot screen if view is 'photoshoot'
if (currentView === "photoshoot") {
return (
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<PhotoshootScreen onNavigateHome={() => navigate("home")} />
</Suspense>
</ErrorBoundary>
);
}

// Render mirror screen if view is 'mirror'
if (currentView === "mirror") {
return (
<AuthGuard onUnauthenticated={() => navigate("register")}>
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<MirrorScreen onNavigateHome={() => navigate("home")} />
</Suspense>
</ErrorBoundary>
</AuthGuard>
);
}

// Render home screen if view is 'home'
if (currentView === "home") {
return (
<AuthGuard onUnauthenticated={() => navigate("register")}>
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<HomeScreen
onNavigateToMirror={() => navigate("mirror")}
onNavigateToPhotoshoot={() => navigate("photoshoot")}
onNavigateToChat={() => {
setChatInitialTab("contacts");
navigate("chat");
}}
onNavigateToReels={() => navigate("reels")}
onNavigateToShop={() => navigate("shop")}
onNavigateToInnovators={() => navigate("innovators")}
onNavigateToProfile={() => navigate("userprofile")}
/>
</Suspense>
</ErrorBoundary>
</AuthGuard>
);
}

return (

<div className="min-h-screen flex items-center justify-center p-4">  
{/* <SupabaseSetupBanner /> */}
{/* <SupabaseDiagnostics /> */}
<Toaster position="top-center" richColors />  {/* Quick Navigation - Dev Helper */}
<button
onClick={() => navigate("home")}
className="fixed top-4 right-4 px-3 py-1 text-xs bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all z-50"

> 

Skip to Home

  </button>      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8">    
    {/* Header */}    
    <header className="text-center mb-8">    
      <h1 className="text-4xl tracking-tighter text-pink-600">    
        MITHAS GLOW    
      </h1>    
      <p className="text-gray-500 mt-1">Discover your perfect look.</p>    
    </header>    {/* Tab Navigation (Login / Register) - Only show on login/register views */}    
{(currentView === "login" || currentView === "register") && (    
  <div className="flex border-b border-gray-200 mb-6">    
    <button    
      onClick={() => navigate("login")}    
      className={`flex-1 py-3 text-gray-500 hover:text-pink-500 transition-colors ${    
        currentView === "login"    
          ? "border-b-3 border-pink-500 text-pink-600"    
          : ""    
      }`}    
    >    
      Login    
    </button>    
    <button    
      onClick={() => navigate("register")}    
      className={`flex-1 py-3 text-gray-500 hover:text-pink-500 transition-colors ${    
        currentView === "register"    
          ? "border-b-3 border-pink-500 text-pink-600"    
          : ""    
      }`}    
    >    
      Register    
    </button>    
  </div>    
)}    

{/* View Content */}    
{currentView === "register" && (    
  <RegisterView onSendOTP={handleSendOTP} />    
)}    
{currentView === "login" && <LoginView onLogin={handleLogin} />}    
{currentView === "otp" && (    
  <OTPView    
    identifier={identifier}    
    identifierType={identifierType}    
    onVerify={handleVerifyOTP}    
    onResend={handleResendOTP}    
  />    
)}    
{currentView === "profile" && (
  <ProfileSetupView onComplete={handleProfileComplete} />
)}


  </div>    
</div> 
 );
}
