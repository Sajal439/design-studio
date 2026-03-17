import type { Prisma } from "@prisma/client";

export type QuoteWithUser = Prisma.QuoteRequestGetPayload<{
  include: { user: true };
}>;

export type ConsultationWithUser = Prisma.ConsultationGetPayload<{
  include: { user: true };
}>;

export type UserWithCount = Prisma.UserGetPayload<{
  include: { _count: { select: { quoteRequests: true; consultations: true } } };
}>;
