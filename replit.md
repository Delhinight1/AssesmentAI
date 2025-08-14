# AssessmentAI - AI-Powered Digital Assessment Platform

## Overview

AssessmentAI is a full-stack web application that revolutionizes academic assessments by leveraging AI to generate unique questions for each student. The platform addresses two core problems: eliminating paper waste through digital assessments and maintaining academic integrity by preventing cheating through question variation. Built with modern web technologies, it provides separate interfaces for instructors to create template-based exams and for students to take personalized assessments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern component development
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, responsive design
- **Routing**: Wouter for lightweight client-side navigation
- **State Management**: TanStack Query for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for end-to-end type safety
- **Data Layer**: Drizzle ORM with PostgreSQL schema definitions
- **Storage**: Configurable storage layer with in-memory implementation for development
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling

### Authentication & Authorization
- **Simple Authentication**: Username/password based system stored in localStorage
- **Role-Based Access**: Separate user roles (instructor/student) with different UI flows and permissions
- **Session Management**: Client-side token storage for session persistence

### AI Integration
- **Provider**: OpenAI GPT-4o for question generation
- **Question Generation**: Template-based system where instructors provide question templates and context
- **Uniqueness**: AI generates unique variations for each student while maintaining equivalent difficulty
- **Fallback Strategy**: Returns original template if AI generation fails

### Database Design
- **Users Table**: Stores user credentials, roles, and profile information
- **Exams Table**: Contains exam metadata including title, subject, instructions, and instructor association
- **Template Questions Table**: Stores instructor-created question templates with context and scoring
- **Exam Submissions Table**: Tracks student submissions with AI-generated questions, answers, and scoring

### Component Architecture
- **Shared Schema**: Common TypeScript types and Zod validation schemas
- **UI Components**: Reusable component library based on Radix UI primitives
- **Page Components**: Route-specific components for different user flows
- **Custom Hooks**: Reusable logic for authentication, mobile detection, and toast notifications

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and management tools
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React

### AI Services
- **OpenAI API**: GPT-4o model for question generation and variation
- **Environment Variables**: OPENAI_API_KEY for API authentication

### UI Framework
- **@radix-ui/react-***: Headless UI components for accessibility and consistency
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Build tool and development server
- **PostCSS**: CSS processing with Tailwind
- **ESBuild**: Fast JavaScript bundling for production

### Additional Libraries
- **react-hook-form**: Form state management and validation
- **zod**: Runtime type validation
- **date-fns**: Date manipulation utilities
- **cmdk**: Command palette component