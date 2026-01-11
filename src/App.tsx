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
// 🎯 FIX 1: SPEED OPTIMIZATION
// முக்கியமான ஸ்கிரீன்களை மட்டும் Direct Import செய்கிறோம்.
// அப்போதுதான் Back அழுத்தினால் 'Loading' லேக் இல்லாமல் இன்ஸ்டாகிராம் போல வேகமாக வரும்.
import { HomeScreen } from "./components/HomeScreen";
import { ProfileScreen } from "./components/ProfileScreen";
// Lazy load heavy components for better performance
const MirrorScreen = lazy(() => import("./components/MirrorScreen").then((m) => ({ default: m.MirrorScreen })));
const PhotoshootScreen = lazy(() => import("./components/PhotoshootScreen").then((m) => ({ default: m.PhotoshootScreen })));
const ChatScreen = lazy(() => import("./components/ChatScreen").then((m) => ({ default: m.ChatScreen })));
const ReelsScreen = lazy(() => import("./components/ReelsScreen").then((m) => ({ default: m.ReelsScreen })));
const ShopScreen = lazy(() => import("./components/ShopScreen"));
const InnovatorsHubScreen = lazy(() => import("./components/InnovatorsHubScreen").then((m) => ({ default: m.InnovatorsHubScreen })));
const SellerPlatform = lazy(() => import("./components/SellerPlatform").then((m) => ({ default: m.SellerPlatform })));
type View = "register" | "login" | "otp" | "profile" | "home" | "mirror" | "photoshoot" | "chat" | "reels" | "shop" | "innovators" | "userprofile" | "sellerdashboard" | "mithasshop";
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
}
// Theme configuration
const THEME_MAP: Record<View, string> = {
register: "mithas-theme", login: "mithas-theme", otp: "mithas-theme", profile: "mithas-theme",
home: "glow-home-theme", mirror: "glow-mirror-theme", photoshoot: "glow-photoshoot-theme",
chat: "glow-chat-theme", reels: "glow-reels-theme", shop: "glow-shop-theme",
innovators: "glow-innovators-theme", userprofile: "glow-profile-theme",
sellerdashboard: "glow-seller-theme",
};
const safeOnComplete = async (data: ProfileInput) => {
const { data: savedProfile, error } = await supabase
.from("profiles")
.upsert({
id: user.id,
username: data.username,
full_name: data.displayName,
display_name: data.displayName,
bio: data.bio,
city: data.city,
date_of_birth: data.dob,
business_name: data.businessName,
portfolio_link: data.portfolioLink,
industry: data.industry,
business_type: data.businessType,
experience: data.experience,
operating_hours: data.operatingHours,
profile_completed: true,
updated_at: new Date().toISOString(),
})
.select()
.single();
if (error) {
console.log(error);
return;
}
// 🔥 THIS LINE IS MOST IMPORTANT
authStore.setProfile(savedProfile);
authStore.setProfileCompleted(true);
setCurrentView("home");
}
export default function App() {

const authStore = useAuthStore();
const profileCompleted = authStore.profileCompleted;
const isAuthenticated = authStore.isAuthenticated;
const authLoading = false;
const [isInitialLoading, setIsInitialLoading] = useState(true);
const [currentView, setCurrentView] = useState<View>(() => {
  const savedView = localStorage.getItem("currentView") as View;
  return savedView || "register";
});
const [identifier, setIdentifier] = useState("");
const [identifierType, setIdentifierType] = useState<"email" | "phone">("email");
const [chatInitialTab, setChatInitialTab] = useState<"contacts" | "messenger" | "artist">("contacts");
const navigate = (view: View) => {
setCurrentView(view);
localStorage.setItem("currentView", view);
window.history.pushState({ view }, "");
};
// 🎯 FIX 2: BROWSER BACK BUTTON SYNC (Back அழுத்தினால் ஸ்கிரீன் மாறும்)
useEffect(() => {
const handlePopState = (event: PopStateEvent) => {
if (event.state?.view) setCurrentView(event.state.view);
};
window.addEventListener("popstate", handlePopState);
return () => window.removeEventListener("popstate", handlePopState);
}, []);
useEffect(() => {
const initApp = async () => {
try {
const { data: { session } } = await supabase.auth.getSession();
if (session) {
const { data: profile } = await supabase.from('profiles').select('profile_completed').eq('id', session.user.id).single();
authStore.setProfileCompleted(!!profile?.profile_completed);

// If there's a saved view and it's valid for authenticated user, use it
const savedView = localStorage.getItem("currentView") as View;
const validViews: View[] = ["home", "mirror", "photoshoot", "chat", "reels", "shop", "innovators", "userprofile", "sellerdashboard"];
if (savedView && validViews.includes(savedView)) {
setCurrentView(savedView);
} else if (profile?.profile_completed) {
setCurrentView('home');
} else {
setCurrentView('profile');
}
} else {
// Not authenticated, clear saved view and go to register
localStorage.removeItem("currentView");
setCurrentView('register');
}
} catch (error) {
localStorage.removeItem("currentView");
setCurrentView('register');
} finally {
setIsInitialLoading(false);
}
};
initApp();
}, []);
useEffect(() => {
if (isInitialLoading) return;
if (isAuthenticated) {
if (!profileCompleted && currentView !== "profile") setCurrentView("profile");
else if (profileCompleted && ["register", "login", "otp", "profile"].includes(currentView)) setCurrentView("home");
} else if (!["login", "register", "otp"].includes(currentView)) {
setCurrentView("register");
}
}, [isAuthenticated, profileCompleted, currentView, isInitialLoading]);
useEffect(() => {
const newTheme = THEME_MAP[currentView] || "mithas-theme";
document.body.className = newTheme;
}, [currentView]);
const handleSendOTP = (id: string, type: "email" | "phone") => {
setIdentifier(id);
setIdentifierType(type);
navigate("otp");
};
const handleVerifyOTP = () => {
toast.success("Verification successful!");
authStore.setProfileCompleted(false);
setCurrentView("profile");
};
const handleProfileComplete = async (profileData: any) => {
try {
const { data: { user: currentUser } } = await supabase.auth.getUser();
if (!currentUser) {
toast.error("User session not found!");
return;
}
const { data, error } = await supabase
.from("profiles")
.upsert(
{
id: currentUser.id,
email: currentUser.email,
full_name: profileData.displayName,
username: profileData.username,
city: profileData.city,
profile_completed: true,
updated_at: new Date().toISOString(),
},
{ onConflict: "id" }
)
.select()
.single();
if (error) throw error;
if (data) {
// This line ensures My Account updates in real-time
authStore.setProfile(data);
authStore.setProfileCompleted(true);
setCurrentView("home");
toast.success("Profile saved and synced! ✨");
}
} catch (error: any) {
toast.error(error.message);
}
};
// 🎯 FIX 3: REFRESH PROBLEM SOLVED (Login ஆனதும் Refresh இல்லாமல் ஹோம் போகும்)
const handleLogin = async (userData: any) => {
authStore.setSession(userData.session);
const { data: profile } = await supabase.from('profiles').select('profile_completed').eq('id', userData.user.id).single();
if (profile?.profile_completed) {
authStore.setProfileCompleted(true);
setCurrentView("home");
} else {
authStore.setProfileCompleted(false);
setCurrentView("profile");
}
};
if (isInitialLoading) return <LoadingScreen />;
// --- RENDERING LOGIC (Your Original Style Maintained) ---
if (currentView === "userprofile") {
return <AuthGuard onUnauthenticated={() => navigate("register")}><ErrorBoundary><Toaster position="top-center" richColors /><Suspense fallback={<LoadingScreen />}><ProfileScreen onNavigateHome={() => navigate("home")} /></Suspense></ErrorBoundary></AuthGuard>;
}
if (currentView === "innovators") {
return <ErrorBoundary><Toaster position="top-center" richColors /><Suspense fallback={<LoadingScreen />}><InnovatorsHubScreen onNavigateHome={() => navigate("home")} /></Suspense></ErrorBoundary>;
}
if (currentView === "shop") {
return <AuthGuard onUnauthenticated={() => navigate("register")}><ErrorBoundary><Toaster position="top-center" richColors /><Suspense fallback={<LoadingScreen />}><ShopScreen
onNavigateBack={() => navigate("home")}
onNavigateToSellerDashboard={() => navigate("sellerdashboard")} /></Suspense></ErrorBoundary></AuthGuard>;
}
if (currentView === "sellerdashboard") {
return <AuthGuard onUnauthenticated={() => navigate("login")}><ErrorBoundary><Toaster position="top-center" richColors /><Suspense fallback={<LoadingScreen />}><SellerPlatform onNavigateBack={() => navigate("shop")} /></Suspense></ErrorBoundary></AuthGuard>;
}
if (currentView === "reels") {
return <ErrorBoundary><Toaster position="top-center" richColors /><Suspense fallback={<LoadingScreen />}><ReelsScreen onNavigateToShop={() => navigate("shop")} onNavigateHome={() => navigate("home")} onNavigateToChat={() => { setChatInitialTab("artist"); navigate("chat"); }} /></Suspense></ErrorBoundary>;
}
if (currentView === "chat") {
return <AuthGuard onUnauthenticated={() => navigate("register")}><ErrorBoundary><Toaster position="top-center" richColors /><Suspense fallback={<LoadingScreen />}><ChatScreen onNavigateHome={() => navigate("home")} initialTab={chatInitialTab} /></Suspense></ErrorBoundary></AuthGuard>;
}
if (currentView === "photoshoot") {
return <ErrorBoundary><Toaster position="top-center" richColors /><Suspense fallback={<LoadingScreen />}><PhotoshootScreen onNavigateHome={() => navigate("home")} /></Suspense></ErrorBoundary>;
}
if (currentView === "mirror") {
return <AuthGuard onUnauthenticated={() => navigate("register")}><ErrorBoundary><Toaster position="top-center" richColors /><Suspense fallback={<LoadingScreen />}><MirrorScreen onNavigateHome={() => navigate("home")} /></Suspense></ErrorBoundary></AuthGuard>;
}
if (currentView === "home") {
return (
<AuthGuard onUnauthenticated={() => navigate("register")}>
<ErrorBoundary>
<Toaster position="top-center" richColors />
<Suspense fallback={<LoadingScreen />}>
<HomeScreen
onNavigateToMirror={() => navigate("mirror")}
onNavigateToPhotoshoot={() => navigate("photoshoot")}
onNavigateToChat={(tab) => { setChatInitialTab(tab || "contacts"); navigate("chat"); }}
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
<Toaster position="top-center" richColors />

{/* 🎯 SKIP BUTTON REMOVED AS REQUESTED */}  
  <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8">  
    <header className="text-center mb-8">  
      <h1 className="text-4xl tracking-tighter text-pink-600">MITHAS GLOW</h1>  
      <p className="text-gray-500 mt-1">Discover your perfect look.</p>  
    </header>  
    {(currentView === "login" || currentView === "register") && (  
      <div className="flex border-b border-gray-200 mb-6">  
        <button onClick={() => navigate("login")} className={`flex-1 py-3 ${currentView === "login" ? "border-b-3 border-pink-500 text-pink-600" : "text-gray-500"}`}>Login</button>  
        <button onClick={() => navigate("register")} className={`flex-1 py-3 ${currentView === "register" ? "border-b-3 border-pink-500 text-pink-600" : "text-gray-500"}`}>Register</button>  
      </div>  
    )}  
    <Suspense fallback={null}>  
      {currentView === "register" && <RegisterView onSendOTP={handleSendOTP} />}  
      {currentView === "login" && <LoginView onLogin={handleLogin} />}  
      {currentView === "otp" && <OTPView identifier={identifier} identifierType={identifierType} onVerify={handleVerifyOTP} onResend={() => toast.success("OTP Resent")} />}  
      {currentView === "profile" && <ProfileSetupView onComplete={handleProfileComplete} />}  
    </Suspense>  
  </div>  
</div>

);
}






