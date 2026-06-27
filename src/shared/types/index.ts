export type Role =
  | "student"
  | "staff"
  | "principal"
  | "dean"
  | "super_admin";

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: string;
  institutionId: string;
  roleId: string;
  departmentId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  admissionNumber: string | null;
  staffNumber: string | null;
  phoneNumber: string | null;
  totpEnabled: boolean;
  fcmToken: string | null;
  preferredLang: string;
  avatarUrl: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string | null;
  user: User;
}