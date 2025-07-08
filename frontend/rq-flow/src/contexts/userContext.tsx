import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react"
import axios, { AxiosResponse } from "axios";
// supabase
import { createClient } from "@supabase/supabase-js"
import { SupabaseClient } from "@supabase/supabase-js"

// api
import { useApi } from "../controllers/API"

import CryptoJS from "crypto-js";
import { alertContext } from "./alertContext";
import { useAuth } from "./authContext";

interface UserContextType {
  userId: string | null
  checkQuota: () => Promise<{ quotaUsage: number; quotaTimestamp: number; refreshInSeconds: number; quotaLimit: number }>
  quotaUsage: number | null
  quotaLimit: number | null
  refreshInSeconds: number | null
  quotaTimestamp: number | null
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  isUsingSelfProvidedKey: boolean
  setIsUsingSelfProvidedKey: (value: boolean) => void
  encryptedCustomApiKey: string | null
  setEncryptedCustomApiKey: (key: string | null) => void
  customApiBaseUrl: string | null
  setCustomApiBaseUrl: (url: string | null) => void
  encryptApiKey: (apiKey: string) => string
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { setErrorData } = useContext(alertContext);
  const { supabaseClient } = useAuth();
  const [userId, setUserId] = useState<string | null>(null)
  const [quotaUsage, setQuotaUsage] = useState<number | null>(null)
  const [quotaTimestamp, setQuotaTimestamp] = useState<number | null>(null)
  const [refreshInSeconds, setRefreshInSeconds] = useState<number | null>(null)
  const [quotaLimit, setQuotaLimit] = useState<number | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const checkQuota = async (): Promise<{ quotaUsage: number; quotaTimestamp: number; refreshInSeconds: number; quotaLimit: number }> => {
    const quota_response = await getUserQuota();
    setQuotaUsage(parseInt(quota_response.data.quota_usage));
    setQuotaTimestamp(parseInt(quota_response.data.quota_timestamp));
    setRefreshInSeconds(quota_response.data.refresh_in_seconds);
    setQuotaLimit(quota_response.data.quota_limit);
    return {
      quotaUsage,
      quotaTimestamp,
      refreshInSeconds,
      quotaLimit,
    };
  };
  // Helper function for standardized API calls with error handling
  // remove dependency from useApi to avoid cyclic import
  const _apiCallNoKey = async (url: string, method: string, data: any): Promise<AxiosResponse> => {
    // prepare headers
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${(await supabaseClient.auth.getSession()).data.session?.access_token}`,
    };
    try {
      const response = await axios({
        url,
        method,
        data,
        headers: headers,
      });
      return response;
    } catch (error: any) {
      setErrorData({
        title: "Error",
        // list: [error.message],
        list: ["Sorry, the server is currently busy. Please try again later."],
      });
      throw error;
    }
  };
  const getUserQuota = async (): Promise<AxiosResponse> => {
    return await _apiCallNoKey("/api/v1/block/check_quota", "GET", {});
  };


  const [isUsingSelfProvidedKey, setIsUsingSelfProvidedKeyState] = useState<boolean>(false);
  const [encryptedCustomApiKey, setEncryptedCustomApiKeyState] = useState<string | null>(null);
  const [customApiBaseUrl, setCustomApiBaseUrlState] = useState<string | null>(null);
  // Load initial state from localStorage
  useEffect(() => {
    const storedIsUsingSelfKey = localStorage.getItem("isUsingSelfProvidedKey");
    const storedEncryptedKey = localStorage.getItem("encryptedCustomApiKey");
    const storedCustomApiBaseUrl = localStorage.getItem("customApiBaseUrl");
    
    if (storedIsUsingSelfKey) {
      setIsUsingSelfProvidedKeyState(storedIsUsingSelfKey === "true");
    }
    if (storedEncryptedKey) {
      setEncryptedCustomApiKeyState(storedEncryptedKey);
    }
    if (storedCustomApiBaseUrl) {
      setCustomApiBaseUrlState(storedCustomApiBaseUrl);
    }
  }, []);

  const secretKey = import.meta.env.VITE_APP_SECRET_KEY || "default_secret_key";

  const setIsUsingSelfProvidedKey = (value: boolean) => {
    setIsUsingSelfProvidedKeyState(value);
    localStorage.setItem("isUsingSelfProvidedKey", value.toString());
  };

  const encryptApiKey = (apiKey) => {
    const encrypted = CryptoJS.AES.encrypt(apiKey, CryptoJS.enc.Utf8.parse(secretKey), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    const ciphertextBase64 = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    return ciphertextBase64;
  };

  const setEncryptedCustomApiKey = (apiKey: string | null) => {
    if (apiKey) {
      const encrypted = encryptApiKey(apiKey);
      setEncryptedCustomApiKeyState(encrypted);
      localStorage.setItem("encryptedCustomApiKey", encrypted);
    } else {
      setEncryptedCustomApiKeyState(null);
      localStorage.removeItem("encryptedCustomApiKey");
      localStorage.removeItem("customApiBaseUrl");
    }
  };

  const setCustomApiBaseUrl = (url: string | null) => {
    setCustomApiBaseUrlState(url);
    localStorage.setItem("customApiBaseUrl", url);
  };
  

  const value = {
    userId,
    checkQuota,
    quotaUsage,
    quotaLimit,
    refreshInSeconds,
    quotaTimestamp,
    settingsOpen,
    setSettingsOpen,
    isUsingSelfProvidedKey,
    setIsUsingSelfProvidedKey,
    encryptedCustomApiKey,
    setEncryptedCustomApiKey,
    customApiBaseUrl,
    setCustomApiBaseUrl,
    encryptApiKey,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
