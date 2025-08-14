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
import { isAuthenticated, isInstructor, isStudent } from "@/lib/auth";

function Router() {
  const authenticated = isAuthenticated();
  const instructor = isInstructor();
  const student = isStudent();

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
