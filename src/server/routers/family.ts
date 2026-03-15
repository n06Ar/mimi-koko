import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/server/trpc";
import { generateInviteCode } from "@/lib/invite-code";

export const familyRouter = router({
  getMyFamily: protectedProcedure.query(async ({ ctx }) => {
    const member = await ctx.prisma.familyMember.findFirst({
      where: { userId: ctx.session.user.id },
      include: {
        family: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
      },
    });

    return member?.family ?? null;
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.familyMember.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "すでにファミリーに参加しています",
        });
      }

      const family = await ctx.prisma.$transaction(async (tx) => {
        const inviteCode = generateInviteCode();
        const newFamily = await tx.family.create({
          data: { name: input.name, inviteCode },
        });
        await tx.familyMember.create({
          data: { familyId: newFamily.id, userId: ctx.session.user.id },
        });
        return newFamily;
      });

      return family;
    }),

  joinByCode: protectedProcedure
    .input(z.object({ inviteCode: z.string().length(8) }))
    .mutation(async ({ ctx, input }) => {
      const family = await ctx.prisma.family.findUnique({
        where: { inviteCode: input.inviteCode },
      });

      if (!family) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "招待コードが正しくありません",
        });
      }

      const existing = await ctx.prisma.familyMember.findUnique({
        where: { familyId_userId: { familyId: family.id, userId: ctx.session.user.id } },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "すでにこのファミリーに参加しています",
        });
      }

      await ctx.prisma.familyMember.create({
        data: { familyId: family.id, userId: ctx.session.user.id },
      });

      return family;
    }),
});
