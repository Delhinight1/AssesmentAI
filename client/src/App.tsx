import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import InstructorDashboard from "./pages/instructor-dashboard";
import StudentDashboard from "./pages/student-dashboard";
import CreateExam from "./pages/create-exam";
import TakeExam from "./pages/take-exam";
import ExamResults from "./pages/exam-results";
import { getCurrentUser, type AuthUser } from "@/lib/auth";

function Router() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser());

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom auth events (for same-tab changes)
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  const authenticated = currentUser !== null;
  const instructor = currentUser?.role === 'instructor';
  const student = currentUser?.role === 'student';

  return (
    <Switch>
      {!authenticated ? (
        <Route path="/" component={Landing} />
      ) : instructor ? (
        <>
          <Route path="/" component={InstructorDashboard} />
          <Route path="/create-exam" component={CreateExam} />
          <Route path="/exam-results/:submissionId" component={ExamResults} />
        </>
      ) : student ? (
        <>
          <Route path="/" component={StudentDashboard} />
          <Route path="/take-exam/:examId" component={TakeExam} />
          <Route path="/exam-results/:submissionId" component={ExamResults} />
        </>
      ) : null}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
