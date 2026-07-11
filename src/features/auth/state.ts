export type AuthState = { status: "idle" | "error" | "success"; message: string };
export const initialAuthState: AuthState = { status: "idle", message: "" };
