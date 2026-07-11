export type ProfileState = { status: "idle" | "success" | "error"; message: string };
export const initialProfileState: ProfileState = { status: "idle", message: "" };
