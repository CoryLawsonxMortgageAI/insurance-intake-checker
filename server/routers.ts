import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { intakeSubmissions } from "../drizzle/schema";
import { sendIntakeNotification } from "./emailNotification";
import { generateCarrierAnalysisText } from "./carrierAnalysis";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  intake: router({
    submit: publicProcedure
      .input(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          state: z.string(),
          age: z.number(),
          sex: z.string(),
          heightIn: z.number(),
          weightLb: z.number(),
          bmi: z.string(),
          annualIncome: z.number(),
          coverage: z.number(),
          productType: z.string(),
          termYears: z.number().optional(),
          tobaccoUse: z.string(),
          tobaccoYears: z.number().optional(),
          medications: z.string().optional(),
          doctorNames: z.string().optional(),
          cancerHistoryYears: z.number().optional(),
          heartEventYears: z.number().optional(),
          duiYears: z.number().optional(),
          felonyYears: z.number().optional(),
          bankruptcyYears: z.number().optional(),
          hazardousOccupation: z.string(),
          avocationRisk: z.string(),
          travelHighRisk: z.string(),
          uncontrolledDiabetes: z.string(),
          uncontrolledHypertension: z.string(),
          insulinDependent: z.string(),
          copd: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Generate unique ID
        const id = `intake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Generate carrier analysis (server-side only)
        const carrierAnalysis = generateCarrierAnalysisText(input);

        // Save to database
        const db = await getDb();
        if (db) {
          try {
            await db.insert(intakeSubmissions).values({
              id,
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email,
              phone: input.phone || null,
              state: input.state,
              age: input.age,
              sex: input.sex,
              heightIn: input.heightIn,
              weightLb: input.weightLb,
              bmi: input.bmi,
              annualIncome: input.annualIncome,
              coverage: input.coverage,
              productType: input.productType,
              termYears: input.termYears || null,
              tobaccoUse: input.tobaccoUse,
              tobaccoYears: input.tobaccoYears || null,
              medications: input.medications || null,
              doctorNames: input.doctorNames || null,
              cancerHistoryYears: input.cancerHistoryYears || null,
              heartEventYears: input.heartEventYears || null,
              duiYears: input.duiYears || null,
              felonyYears: input.felonyYears || null,
              bankruptcyYears: input.bankruptcyYears || null,
              hazardousOccupation: input.hazardousOccupation,
              avocationRisk: input.avocationRisk,
              travelHighRisk: input.travelHighRisk,
              uncontrolledDiabetes: input.uncontrolledDiabetes,
              uncontrolledHypertension: input.uncontrolledHypertension,
              insulinDependent: input.insulinDependent,
              copd: input.copd,
              carrierAnalysis,
            });
          } catch (error) {
            console.error("Failed to save intake submission:", error);
          }
        }

        // Send email notification
        const emailSent = await sendIntakeNotification({
          ...input,
          carrierAnalysis,
        });

        return {
          success: true,
          id,
          emailSent,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
