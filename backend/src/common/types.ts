/**
 * JWT user payload from passport strategy
 */
export interface JwtUser {
  userId: number;
  email: string;
  role: string;
}

export interface RequestWithUser {
  user: JwtUser;
}
