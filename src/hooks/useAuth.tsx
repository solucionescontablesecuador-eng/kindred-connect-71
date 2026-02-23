import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  user: { id: string; email: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuario simulado para que la app funcione sin login
const MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "admin@condominios.pro"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState(MOCK_USER);
  const [loading] = useState(false);

  const signOut = async () => {
    console.log("Sign out simulado");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}