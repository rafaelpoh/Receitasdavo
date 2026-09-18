export interface AuthUser {
  readonly uid: string;
  readonly email: string | null;
}

export interface AuthCredentials {
  readonly email: string;
  readonly password: string;
}

export type AuthMode = 'login' | 'register';
