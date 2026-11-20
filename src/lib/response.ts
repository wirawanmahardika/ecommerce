import { NextResponse } from "next/server";

export function ok<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, message, ...(details ? { details } : {}) },
    { status }
  );
}

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function handleApiError(err: unknown) {
  console.error(err);

  if (err instanceof AppError) {
    return fail(err.message, err.status);
  }

  const pgErr = err as { code?: string; message?: string };
  if (pgErr?.code === "23505") {
    return fail("Data sudah terdaftar (duplikat)", 409);
  }
  if (pgErr?.code === "23503") {
    return fail("Data masih terhubung dengan entitas lain", 409);
  }

  return fail("Terjadi kesalahan pada server", 500);
}
