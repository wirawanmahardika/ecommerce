import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { fail } from "./response";

export const SESSION_COOKIE_NAME = "shop_session";

function getSecretKey() {
  const secret =
    process.env.JWT_SECRET ??
    "tokosedia-super-secret-jwt-key-change-in-production";
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  username: string;
  role: "user" | "admin";
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.id === "string" &&
      typeof payload.username === "string" &&
      (payload.role === "user" || payload.role === "admin")
    ) {
      return {
        id: payload.id,
        username: payload.username,
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<
  { user: SessionUser; error?: never } | { user?: never; error: Response }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: fail("Sesi login tidak ditemukan atau telah berakhir", 401),
    };
  }
  return { user };
}

export async function requireAdmin(): Promise<
  { user: SessionUser; error?: never } | { user?: never; error: Response }
> {
  const auth = await requireAuth();
  if (auth.error) return auth;
  if (auth.user.role !== "admin") {
    return {
      error: fail("Akses ditolak: hanya untuk admin", 403),
    };
  }
  return auth;
}
