// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow global.prisma to be cached in dev
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}
