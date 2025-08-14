import { type User, type InsertUser, type Exam, type InsertExam, type TemplateQuestion, type InsertTemplateQuestion, type ExamSubmission, type InsertExamSubmission } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Exam operations
  getExam(id: string): Promise<Exam | undefined>;
  getExamsByInstructor(instructorId: string): Promise<Exam[]>;
  getActiveExams(): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: string, exam: Partial<Exam>): Promise<Exam | undefined>;
  
  // Template question operations
  getTemplateQuestionsByExam(examId: string): Promise<TemplateQuestion[]>;
  createTemplateQuestion(question: InsertTemplateQuestion): Promise<TemplateQuestion>;
  deleteTemplateQuestion(id: string): Promise<boolean>;
  
  // Exam submission operations
  getSubmission(examId: string, studentId: string): Promise<ExamSubmission | undefined>;
  getSubmissionsByExam(examId: string): Promise<ExamSubmission[]>;
  getSubmissionsByStudent(studentId: string): Promise<ExamSubmission[]>;
  createSubmission(submission: InsertExamSubmission): Promise<ExamSubmission>;
  updateSubmission(id: string, submission: Partial<ExamSubmission>): Promise<ExamSubmission | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private exams: Map<string, Exam>;
  private templateQuestions: Map<string, TemplateQuestion>;
  private examSubmissions: Map<string, ExamSubmission>;

  constructor() {
    this.users = new Map();
    this.exams = new Map();
    this.templateQuestions = new Map();
    this.examSubmissions = new Map();
    
    // Pre-populate with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample instructor
    const instructor: User = {
      id: "instructor-1",
      username: "prof.smith",
      password: "password123",
      role: "instructor",
      firstName: "Jane",
      lastName: "Smith",
      email: "prof.smith@university.edu",
      createdAt: new Date(),
    };
    this.users.set(instructor.id, instructor);

    // Create sample students
    const student1: User = {
      id: "student-1",
      username: "alice.johnson",
      password: "password123",
      role: "student",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@university.edu",
      createdAt: new Date(),
    };
    this.users.set(student1.id, student1);

    const student2: User = {
      id: "student-2",
      username: "bob.wilson",
      password: "password123",
      role: "student",
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob.wilson@university.edu",
      createdAt: new Date(),
    };
    this.users.set(student2.id, student2);

    // Create sample exam
    const exam: Exam = {
      id: "exam-1",
      title: "Physics Midterm - Newton's Laws",
      subject: "Physics",
      instructions: "Answer all questions showing your work. Each question has been uniquely generated for you using AI.",
      instructorId: instructor.id,
      isActive: true,
      createdAt: new Date(),
    };
    this.exams.set(exam.id, exam);

    // Create sample template questions
    const question1: TemplateQuestion = {
      id: "template-1",
      examId: exam.id,
      templateText: "Calculate the net force on an object with a mass of [mass] kg accelerating at [acceleration] m/s².",
      context: "High School Physics, Newton's Second Law",
      points: 10,
      orderIndex: 1,
    };
    this.templateQuestions.set(question1.id, question1);

    const question2: TemplateQuestion = {
      id: "template-2",
      examId: exam.id,
      templateText: "A ball is thrown upward with an initial velocity of [velocity] m/s. Calculate the maximum height reached.",
      context: "High School Physics, Projectile Motion",
      points: 15,
      orderIndex: 2,
    };
    this.templateQuestions.set(question2.id, question2);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null
    };
    this.users.set(id, user);
    return user;
  }

  // Exam operations
  async getExam(id: string): Promise<Exam | undefined> {
    return this.exams.get(id);
  }

  async getExamsByInstructor(instructorId: string): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter(
      (exam) => exam.instructorId === instructorId,
    );
  }

  async getActiveExams(): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter((exam) => exam.isActive);
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const id = randomUUID();
    const exam: Exam = { 
      ...insertExam, 
      id, 
      createdAt: new Date(),
      instructions: insertExam.instructions || null,
      isActive: insertExam.isActive ?? true
    };
    this.exams.set(id, exam);
    return exam;
  }

  async updateExam(id: string, examUpdate: Partial<Exam>): Promise<Exam | undefined> {
    const exam = this.exams.get(id);
    if (!exam) return undefined;
    
    const updatedExam = { ...exam, ...examUpdate };
    this.exams.set(id, updatedExam);
    return updatedExam;
  }

  // Template question operations
  async getTemplateQuestionsByExam(examId: string): Promise<TemplateQuestion[]> {
    return Array.from(this.templateQuestions.values())
      .filter((question) => question.examId === examId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createTemplateQuestion(insertQuestion: InsertTemplateQuestion): Promise<TemplateQuestion> {
    const id = randomUUID();
    const question: TemplateQuestion = { 
      ...insertQuestion, 
      id,
      points: insertQuestion.points ?? 10
    };
    this.templateQuestions.set(id, question);
    return question;
  }

  async deleteTemplateQuestion(id: string): Promise<boolean> {
    return this.templateQuestions.delete(id);
  }

  // Exam submission operations
  async getSubmission(examId: string, studentId: string): Promise<ExamSubmission | undefined> {
    return Array.from(this.examSubmissions.values()).find(
      (submission) => submission.examId === examId && submission.studentId === studentId,
    );
  }

  async getSubmissionsByExam(examId: string): Promise<ExamSubmission[]> {
    return Array.from(this.examSubmissions.values()).filter(
      (submission) => submission.examId === examId,
    );
  }

  async getSubmissionsByStudent(studentId: string): Promise<ExamSubmission[]> {
    return Array.from(this.examSubmissions.values()).filter(
      (submission) => submission.studentId === studentId,
    );
  }

  async createSubmission(insertSubmission: InsertExamSubmission): Promise<ExamSubmission> {
    const id = randomUUID();
    const submission: ExamSubmission = { 
      ...insertSubmission, 
      id, 
      createdAt: new Date(),
      generatedQuestions: insertSubmission.generatedQuestions || null,
      answers: insertSubmission.answers || null,
      score: insertSubmission.score || null,
      maxScore: insertSubmission.maxScore || null,
      isCompleted: insertSubmission.isCompleted ?? false,
      submittedAt: insertSubmission.submittedAt || null
    };
    this.examSubmissions.set(id, submission);
    return submission;
  }

  async updateSubmission(id: string, submissionUpdate: Partial<ExamSubmission>): Promise<ExamSubmission | undefined> {
    const submission = this.examSubmissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission = { ...submission, ...submissionUpdate };
    this.examSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }
}

export const storage = new MemStorage();
