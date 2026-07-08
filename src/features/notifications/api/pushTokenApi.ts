import apiClient from "@/src/shared/utils/apiClient";

export interface RegisterPushTokenPayload {
  token: string;
  deviceId: string;
  deviceName?: string;
}

export async function registerPushToken(
  payload: RegisterPushTokenPayload,
): Promise<void> {
  await apiClient.patch("/users/me/push-token", payload);
}

export async function deactivatePushToken(token: string): Promise<void> {
  await apiClient.delete("/users/me/push-token", { data: { token } });
}
