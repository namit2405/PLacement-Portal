/**
 * Compatibility shim — replaces ICP Internet Identity with JWT auth.
 */
import { useAuth } from "./useAuth";

export function useInternetIdentity() {
  const { user, isInitializing, isLoggingIn, logout } = useAuth();

  const identity = user
    ? { getPrincipal: () => ({ toString: () => user.username }), user }
    ;

  return {
    identity,
    login: () => {},
    clear: logout,
    loginStatus: isInitializing ? "initializing" : isLoggingIn ? "logging-in" : user ? "success" : "idle",
    isInitializing,
    isLoginIdle: !isInitializing && !isLoggingIn && !user,
    isLoggingIn,
    isLoginSuccess: !!user,
    isLoginError: false,
    loginError,
  };
}
