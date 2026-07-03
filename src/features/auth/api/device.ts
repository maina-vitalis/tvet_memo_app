/**
 * [REFRESH TOKENS] Device identifier helpers for React Native.
 *
 * A stable deviceId lets the backend associate sessions with physical/logical devices
 * and enables features like "sign out this device".
 *
 * Strategy:
 * - Generate once (uuid)
 * - Store in secure storage under DEVICE_ID_KEY
 * - Send on every login / refresh / sensitive call
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "memo_device_id";

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    // Fallback (should be rare)
    return `dev-${Platform.OS}-${Date.now()}`;
  }
}

export async function getDeviceId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(DEVICE_ID_KEY);
  } catch {
    return null;
  }
}
