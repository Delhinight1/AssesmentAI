import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertExamSchema, insertTemplateQuestionSchema } from "@shared/schema";
import { generateAllQuestionsForStudent } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use proper session management or JWT
      // For simplicity, just return user data
      res.json({ 
        id: user.id, 
        username: user.username, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Exam routes
  app.get('/api/exams', async (req, res) => {
    try {
      const { instructorId, active } = req.query;
      
      let exams;
      if (instructorId) {
        exams = await storage.getExamsByInstructor(instructorId as string);
      } else if (active === 'true') {
        exams = await storage.getActiveExams();
      } else {
        exams = await storage.getActiveExams(); // Default to active exams
      }
      
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.get('/api/exams/:id', async (req, res) => {
    try {
      const exam = await storage.getExam(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  app.post('/api/exams', async (req, res) => {
    try {
      const examData = insertExamSchema.parse(req.body);
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  // Template question routes
  app.get('/api/exams/:examId/questions', async (req, res) => {
    try {
      const questions = await storage.getTemplateQuestionsByExam(req.params.examId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/exams/:examId/questions', async (req, res) => {
    try {
      const questionData = insertTemplateQuestionSchema.parse({
        ...req.body,
        examId: req.params.examId,
      });
      const question = await storage.createTemplateQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.delete('/api/questions/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteTemplateQuestion(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Exam submission routes
  app.get('/api/exams/:examId/start/:studentId', async (req, res) => {
    try {
      const { examId, studentId } = req.params;
      
      // Check if student already has a submission
      let submission = await storage.getSubmission(examId, studentId);
      if (submission) {
        return res.json(submission);
      }

      // Get exam and template questions
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      const templates = await storage.getTemplateQuestionsByExam(examId);
      if (templates.length === 0) {
        return res.status(400).json({ message: "Exam has no questions" });
      }

      // Generate unique questions using AI
      const templatesForAI = templates.map(t => ({
        templateText: t.templateText,
        context: t.context,
        points: t.points || 10,
        orderIndex: t.orderIndex
      }));
      const generatedQuestions = await generateAllQuestionsForStudent(templatesForAI, studentId);
      
      // Calculate max score
      const maxScore = templates.reduce((sum, q) => sum + (q.points || 0), 0);

      // Create submission
      submission = await storage.createSubmission({
        examId,
        studentId,
        generatedQuestions,
        answers: {},
        maxScore,
        isCompleted: false,
      });

      res.json(submission);
    } catch (error) {
      console.error("Error starting exam:", error);
      res.status(500).json({ message: "Failed to start exam" });
    }
  });

  app.put('/api/submissions/:id/answer', async (req, res) => {
    try {
      const { questionIndex, answer } = req.body;
      
      const submission = await storage.updateSubmission(req.params.id, {
        answers: { ...req.body.answers, [questionIndex]: answer },
      });

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      res.json(submission);
    } catch (error) {
      console.error("Error updating answer:", error);
      res.status(500).json({ message: "Failed to update answer" });
    }
  });

  app.put('/api/submissions/:id/submit', async (req, res) => {
    try {
      const submission = await storage.updateSubmission(req.params.id, {
        isCompleted: true,
        submittedAt: new Date(),
        answers: req.body.answers,
      });

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      res.json(submission);
    } catch (error) {
      console.error("Error submitting exam:", error);
      res.status(500).json({ message: "Failed to submit exam" });
    }
  });

  app.get('/api/submissions/student/:studentId', async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByStudent(req.params.studentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/submissions/exam/:examId', async (req, res) => {
    try {
      const submissions = await storage.getSubmissionsByExam(req.params.examId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching exam submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.put('/api/submissions/:id/grade', async (req, res) => {
    try {
      const { score } = req.body;
      
      const submission = await storage.updateSubmission(req.params.id, {
        score: parseInt(score),
      });

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      res.json(submission);
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ message: "Failed to grade submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
