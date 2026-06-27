import { API_BASE_URL } from "@/src/lib/api/config";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string | string[];
};

function extractErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const payload = data as ApiEnvelope<unknown>;

  if (Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

function unwrapResponse<T>(data: unknown): T {
  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    (data as ApiEnvelope<T>).success === true &&
    "data" in data
  ) {
    return (data as ApiEnvelope<T>).data as T;
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
  } = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(data, `Request failed (${response.status})`),
      response.status,
    );
  }

  return unwrapResponse<T>(data);
}
