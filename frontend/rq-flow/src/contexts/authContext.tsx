import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react"

// supabase
import { createClient } from "@supabase/supabase-js"
import { SupabaseClient } from "@supabase/supabase-js"

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  supabaseClient: SupabaseClient
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken")
  })
  const supabaseClient = createClient(
    import.meta.env.VITE_APP_SUPABASE_URL,
    import.meta.env.VITE_APP_SUPABASE_KEY,
  );
  

  const isAuthenticated = !!token

  const login = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem("authToken", newToken)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem("authToken")
  }

  useEffect(() => {
    // todo: token validation logic
  }, [token])

  const value = {
    token,
    isAuthenticated,
    login,
    logout,
    supabaseClient,
  }

  return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
}
