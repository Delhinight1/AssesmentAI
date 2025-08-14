import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'instructor' or 'student'
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  instructions: text("instructions"),
  instructorId: varchar("instructor_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templateQuestions = pgTable("template_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").notNull(),
  templateText: text("template_text").notNull(),
  context: text("context").notNull(),
  points: integer("points").default(10),
  orderIndex: integer("order_index").notNull(),
});

export const examSubmissions = pgTable("exam_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").notNull(),
  studentId: varchar("student_id").notNull(),
  generatedQuestions: jsonb("generated_questions"), // Array of AI-generated questions
  answers: jsonb("answers"), // Student answers
  score: integer("score"),
  maxScore: integer("max_score"),
  isCompleted: boolean("is_completed").default(false),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateQuestionSchema = createInsertSchema(templateQuestions).omit({
  id: true,
});

export const insertExamSubmissionSchema = createInsertSchema(examSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertTemplateQuestion = z.infer<typeof insertTemplateQuestionSchema>;
export type TemplateQuestion = typeof templateQuestions.$inferSelect;
export type InsertExamSubmission = z.infer<typeof insertExamSubmissionSchema>;
export type ExamSubmission = typeof examSubmissions.$inferSelect;
