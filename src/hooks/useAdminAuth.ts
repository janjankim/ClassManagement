import { useCallback, useState } from "react";
import { loginAdmin } from "@/lib/api";

const STORAGE_KEY = "volleyball-admin-token";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(STORAGE_KEY));

  const login = useCallback(async (password: string) => {
    const result = await loginAdmin(password);
    sessionStorage.setItem(STORAGE_KEY, result.token);
    setToken(result.token);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  return { token, isAuthenticated: Boolean(token), login, logout };
}
