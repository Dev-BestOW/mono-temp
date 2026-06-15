/** Standard API envelope returned by the backend. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/** Cursor/offset paginated collection. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Minimal user shape shared across user web and admin. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = "user" | "admin";
