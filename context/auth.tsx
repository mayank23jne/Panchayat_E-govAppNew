import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  janpadId: number;
  role?: string;
}

interface AuthContextType {
  authToken: string | null;
  user: UserProfile | null;
  isLoaded: boolean;
  login: (token: string, userData: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper for cross-platform storage (SecureStore doesn't work out-of-the-box on web without configuration)
const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const removeStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        console.log("🔄 App reloading... checking storage for token...");
        const token = await getStorageItem("userToken");
        const savedUser = await getStorageItem("userData");

        console.log("Found Token:", token ? "YES (Valid string)" : "NO (null)");
        console.log("Found User Data:", savedUser ? "YES" : "NO");

        if (token && savedUser) {
          setAuthToken(token);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to restore auth state", e);
      } finally {
        setIsLoaded(true);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (token: string, userData: UserProfile) => {
    try {
      console.log("💾 Saving credentials to storage...", token);
      await setStorageItem("userToken", token);
      await setStorageItem("userData", JSON.stringify(userData));

      setAuthToken(token);
      setUser(userData);
    } catch (e) {
      console.error("Failed committing login records", e);
    }
  };

  const logout = async () => {
    try {
      await removeStorageItem("userToken");
      await removeStorageItem("userData");
      setAuthToken(null);
      setUser(null);
    } catch (e) {
      console.error("Failed deleting user runtime assets", e);
    }
  };

  return (
    <AuthContext.Provider value={{ authToken, user, isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}