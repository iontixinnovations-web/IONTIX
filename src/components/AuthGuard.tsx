import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/lib/store";

interface AuthGuardProps {
  children: ReactNode;
  onUnauthenticated: () => void;
}

export function AuthGuard({ children, onUnauthenticated }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onUnauthenticated();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect handled above
  }

  return <>{children}</>;
}