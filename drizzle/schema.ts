import { mysqlEnum, mysqlTable, text, timestamp, varchar, int } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Insurance intake submissions table
 */
export const intakeSubmissions = mysqlTable("intake_submissions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  state: varchar("state", { length: 10 }).notNull(),
  age: int("age").notNull(),
  sex: varchar("sex", { length: 20 }).notNull(),
  heightIn: int("heightIn").notNull(),
  weightLb: int("weightLb").notNull(),
  bmi: varchar("bmi", { length: 10 }),
  annualIncome: int("annualIncome").notNull(),
  coverage: int("coverage").notNull(),
  productType: varchar("productType", { length: 50 }).notNull(),
  termYears: int("termYears"),
  tobaccoUse: varchar("tobaccoUse", { length: 10 }).notNull(),
  tobaccoYears: int("tobaccoYears"),
  medications: text("medications"),
  doctorNames: text("doctorNames"),
  cancerHistoryYears: int("cancerHistoryYears"),
  heartEventYears: int("heartEventYears"),
  duiYears: int("duiYears"),
  felonyYears: int("felonyYears"),
  bankruptcyYears: int("bankruptcyYears"),
  hazardousOccupation: varchar("hazardousOccupation", { length: 10 }).notNull(),
  avocationRisk: varchar("avocationRisk", { length: 10 }).notNull(),
  travelHighRisk: varchar("travelHighRisk", { length: 10 }).notNull(),
  uncontrolledDiabetes: varchar("uncontrolledDiabetes", { length: 10 }).notNull(),
  uncontrolledHypertension: varchar("uncontrolledHypertension", { length: 10 }).notNull(),
  insulinDependent: varchar("insulinDependent", { length: 10 }).notNull(),
  copd: varchar("copd", { length: 10 }).notNull(),
  carrierAnalysis: text("carrierAnalysis"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type IntakeSubmission = typeof intakeSubmissions.$inferSelect;
export type InsertIntakeSubmission = typeof intakeSubmissions.$inferInsert;
