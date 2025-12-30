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
const authLoading = false;

// Initialize auth in background (doesn't block UI)

const [currentView, setCurrentView] = useState<View>(() =>
  getInitialView(isAuthenticated, profileCompleted)
  );

const [identifier, setIdentifier] = useState("");
const [identifierType, setIdentifierType] = useState<"email" | "phone">(
"email"
);
const [chatInitialTab, setChatInitialTab] = useState<
"contacts" | "messenger" | "artist"

> ("contacts");

const navigate = (view: View) => {
  setCurrentView(view);              // ✅ correct
  window.history.pushState({ view }, "");
};
useEffect(() => {
  if (authLoading) return;
  
  // கண்டிஷனை சிம்பிளா மாத்துங்க
  if (!isAuthenticated && currentView !== "register" && currentView !== "login" && currentView !== "otp") {
    setCurrentView("register");
  }
}, [isAuthenticated, currentView]);


useEffect(() => {
  // Initial history entry
  window.history.replaceState({ view: currentView }, "");

  const onBack = (event: PopStateEvent) => {
    if (event.state?.view) {
      navigate(event.state.view);
    } else {
      // Home reached → allow app exit
      window.history.go(-1);
    }
  };

  window.addEventListener("popstate", onBack);

  return () => {
    window.removeEventListener("popstate", onBack);
  };
}, []);


// ✅ Persist current view across refresh
useEffect(() => {
  if (isAuthenticated) {
    if (currentView !== "profile") {
      localStorage.setItem("currentView", currentView);
    }
  } else {
    localStorage.removeItem("currentView");
  }
}, [currentView, isAuthenticated]);
useEffect(() => {
  if (!isAuthenticated) {
    if (!["login", "register", "otp"].includes(currentView)) {
      navigate("register");
    }
    return;
  }

  if (isAuthenticated && !profileCompleted) {
      // 🔒 allow profile screen to render fully
        if (currentView !== "profile") {
            navigate("profile");
              }
                return;
                }
  

  if (isAuthenticated && profileCompleted) {
    if (["register", "login", "otp", "profile"].includes(currentView)) {
      navigate("home");
    }
  }
}, [isAuthenticated, profileCompleted, currentView]);

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
navigate("profile");
};

const handleResendOTP = () => {
    toast.success(`OTP resent to ${identifier}!`);
    };

const handleProfileComplete = async () => {
  toast.success("Welcome to MITHAS GLOW! ✨");

  // ✅ UPDATE SUPABASE USER METADATA
  await supabase.auth.updateUser({
    data: { profile_completed: true },
  });

  // ✅ UPDATE ZUSTAND
  authStore.setProfileCompleted(true);

  navigate("home");
};

const handleLogin = (userData: any) => {
  authStore.setSession(userData.session);
  const completed =
    userData.user?.user_metadata?.profile_completed ?? false;

  authStore.setProfileCompleted(completed);

  if (completed) {
    navigate("home");
  } else {
    navigate("profile");
  }
};
              


// Render user profile if view is 'userprofile'
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
    <ProfileSetupView
        onComplete={(profile) => {
              // 1️⃣ store update
                    useAuthStore.getState().setProfile(profile);

                          // 2️⃣ mark profile completed
                                useAuthStore.getState().setProfileCompleted(true);

                                      // 3️⃣ go to home
                                            setCurrentView("home");
                                                }}
                                                  />
                                                  )}


  </div>    
</div> 
 );
}
