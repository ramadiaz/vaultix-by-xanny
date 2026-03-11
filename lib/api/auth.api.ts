import { apiClient } from "./client";

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = LoginRequest;

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    username: string;
  };
};

export function login(data: LoginRequest) {
  return apiClient.post<AuthResponse>("/auth/login", data);
}

export function register(data: RegisterRequest) {
  return apiClient.post<AuthResponse>("/auth/register", data);
}

export function me() {
  return apiClient.get<{ id: string; username: string }>("/auth/me");
}
