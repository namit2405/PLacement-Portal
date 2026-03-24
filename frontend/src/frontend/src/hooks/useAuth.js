import { useState, useEffect, useCallback, createContext, useContext, createElement } from "react";
import { api, BASE_URL } from "../api";
import axios from "axios";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setIsInitializing(false); return; }
    api.get("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => setIsInitializing(false));
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/token/`, { username, password });
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      const me = await api.get("/auth/me/");
      setUser(me.data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid credentials.";
      setLoginError(msg);
      throw new Error(msg);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      try { await api.post("/auth/logout/", { refresh }); } catch {}
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }, []);

  const register = useCallback(async (data) => {
    const endpoint = data.role === "STUDENT"
      ? "/auth/register/student/"
      : data.role === "ADMIN"
      ? "/auth/register/admin/"
      : "/auth/register/company/";
    await axios.post(`${BASE_URL}${endpoint}`, data);
    await login(data.username, data.password);
  }, [login]);

  const getSecurityQuestion = useCallback(async (username) => {
    const { data } = await axios.post(`${BASE_URL}/auth/get-security-question/`, { username });
    return data.security_question;
  }, []);

  const resetPassword = useCallback(async ({ username, security_answer, new_password }) => {
    await axios.post(`${BASE_URL}/auth/reset-password/`, { username, security_answer, new_password });
  }, []);

  const value = { user, isInitializing, isLoggingIn, loginError, login, logout, register, getSecurityQuestion, resetPassword };
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
