import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { auth } from "../../firebase/auth";

type AuthContextValue = {
  currentUser: User | null;
  isAuthLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setIsAuthLoading(false);
      },
      () => {
        setAuthError("ログイン状態の確認に失敗しました。");
        setIsAuthLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setAuthError("Googleログインに失敗しました。時間をおいて再試行してください。");
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);

    try {
      await signOut(auth);
    } catch {
      setAuthError("ログアウトに失敗しました。時間をおいて再試行してください。");
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthLoading,
      authError,
      signInWithGoogle,
      logout,
      clearAuthError,
    }),
    [
      authError,
      clearAuthError,
      currentUser,
      isAuthLoading,
      logout,
      signInWithGoogle,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
