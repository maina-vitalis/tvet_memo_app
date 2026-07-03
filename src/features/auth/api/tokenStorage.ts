/**
 * [REFRESH TOKENS + RN SECURITY]
 * Secure token storage abstraction for React Native.
 *
 * Uses expo-secure-store when available (recommended).
 * Falls back to a non-secure implementation with warning (for dev only).
 *
 * Why this file:
 * - Never store refresh tokens in AsyncStorage or redux-persist plaintext.
 * - Central place to swap storage strategy later (keychain, etc).
 *
 * IMPORTANT REVIEW NOTE:
 * After adding expo-secure-store, make sure it is properly configured in app.json / eas.
 * On web during development you may see fallback warnings.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'memo_access_token';
const REFRESH_KEY = 'memo_refresh_token';

let isSecureAvailable = true;

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    // expo-secure-store has isAvailableAsync in newer versions
    // @ts-ignore - defensive
    if (typeof SecureStore.isAvailableAsync === 'function') {
      return await SecureStore.isAvailableAsync();
    }
    return true;
  } catch {
    return false;
  }
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      if (await isSecureStoreAvailable()) {
        return await SecureStore.getItemAsync(ACCESS_KEY);
      }
      // Fallback (dev only)
      console.warn('[Auth] Using insecure fallback for access token');
      return null; // or implement Async for dev if you must
    } catch (e) {
      console.error('[Auth] getAccessToken failed', e);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      if (await isSecureStoreAvailable()) {
        return await SecureStore.getItemAsync(REFRESH_KEY);
      }
      console.warn('[Auth] Using insecure fallback for REFRESH token - this is dangerous');
      return null;
    } catch (e) {
      console.error('[Auth] getRefreshToken failed', e);
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      if (await isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
        return;
      }
      console.warn('[Auth] Cannot securely store tokens on this platform');
    } catch (e) {
      console.error('[Auth] setTokens failed', e);
    }
  },

  async setAccessToken(accessToken: string): Promise<void> {
    try {
      if (await isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
      }
    } catch (e) {
      console.error('[Auth] setAccessToken failed', e);
    }
  },

  async clear(): Promise<void> {
    try {
      if (await isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(ACCESS_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
      }
    } catch (e) {
      console.error('[Auth] clear tokens failed', e);
    }
  },
};

export default tokenStorage;
