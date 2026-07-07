export type Role =
  | "SUPER_ADMIN"
  | "CHAIRPERSON"
  | "BOARD_MEMBER"
  | "PRINCIPAL"
  | "DEPUTY_PRINCIPAL_ACADEMICS"
  | "DEPUTY_PRINCIPAL_ADMIN"
  | "INSTITUTION_ADMIN"
  | "HOD"
  | "TRAINER"
  | "TRAINEE";

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
  role: Role;
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