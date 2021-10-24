export class AuthUser {
  login: string;
  IAT?: string;
  JTI?: string;
  email?: string;
}

export class AuthResponse {
  result: boolean;
  message?: string;
  token?: string;
  status?: number;
  user?: AuthUser;
  data?: any;
}

export class ApiResponse {
  result: boolean;
  message?: string;
  status?: number;
  token?: string;
  code?: string;
  data?: any;
  structure?: any;
  files?: any;
  count?: number;
}
