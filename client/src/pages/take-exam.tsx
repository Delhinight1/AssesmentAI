import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Timer } from "../components/ui/timer";
import { GraduationCap, Brain, CheckCircle, Clock, Save } from "lucide-react";

export default function TakeExam() {
  const { examId } = useParams();
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeStarted] = useState(Date.now());
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("");

  // Get or create exam submission
  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['/api/exams', examId, 'start', currentUser?.id],
    enabled: !!examId && !!currentUser?.id,
  }) as { data: any, isLoading: boolean, error: any };

  // Auto-save answers
  const saveAnswerMutation = useMutation({
    mutationFn: async ({ questionIndex, answer }: { questionIndex: number; answer: string }) => {
      const updatedAnswers = { ...answers, [questionIndex]: answer };
      const response = await apiRequest("PUT", `/api/submissions/${submission.id}/answer`, {
        questionIndex,
        answer,
        answers: updatedAnswers,
      });
      return response.json();
    },
    onSuccess: () => {
      setAutoSaveStatus("Saved");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    },
    onError: () => {
      setAutoSaveStatus("Save failed");
    },
  });

  // Submit exam
  const submitExamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/submissions/${submission.id}/submit`, {
        answers,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/submissions/student', currentUser?.id] });
      toast({
        title: "Exam Submitted!",
        description: "Your exam has been successfully submitted for grading.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-save when answer changes
  useEffect(() => {
    if (submission && answers[currentQuestionIndex] !== undefined) {
      const timeoutId = setTimeout(() => {
        saveAnswerMutation.mutate({
          questionIndex: currentQuestionIndex,
          answer: answers[currentQuestionIndex],
        });
      }, 2000); // Auto-save after 2 seconds of no typing

      return () => clearTimeout(timeoutId);
    }
  }, [answers, currentQuestionIndex, submission]);

  // Initialize answers from existing submission
  useEffect(() => {
    if (submission && typeof submission === 'object' && submission.answers) {
      setAnswers(submission.answers);
    }
  }, [submission]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your exam...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900 mb-4">Exam Not Available</h1>
              <p className="text-slate-600 mb-4">
                This exam could not be loaded. It may no longer be available or you may not have access to it.
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-back-to-dashboard">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = submission && submission.generatedQuestions ? submission.generatedQuestions : [];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
    setAutoSaveStatus("Saving...");
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmit = () => {
    const unansweredQuestions = questions.filter((_: any, index: number) => !answers[index]?.trim());
    
    if (unansweredQuestions.length > 0) {
      if (!confirm(`You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit?`)) {
        return;
      }
    }

    submitExamMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-slate-900" data-testid="exam-title">
                    Taking Exam
                  </h1>
                  <p className="text-xs text-slate-600">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Timer startTime={timeStarted} />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <div className="w-24">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question Navigation */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-700">Question Navigation</span>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                {autoSaveStatus && (
                  <span className="flex items-center space-x-1">
                    <Save className="w-3 h-3" />
                    <span>{autoSaveStatus}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {questions.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-emerald-600 text-white'
                      : answers[index]?.trim()
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  data-testid={`question-nav-${index}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>Question {currentQuestionIndex + 1}</span>
                <Badge variant="outline" data-testid="question-points">
                  {currentQuestion?.points || 10} points
                </Badge>
              </CardTitle>
              <div className="flex items-center space-x-1 text-blue-600">
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">AI Generated</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Generated Question */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Your Unique Question
                  </p>
                  <p className="text-blue-900 leading-relaxed" data-testid="question-text">
                    {currentQuestion?.questionText}
                  </p>
                </div>
              </div>
            </div>

            {/* Answer Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Your Answer
              </label>
              <Textarea
                value={answers[currentQuestionIndex] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here. Show your work step by step for partial credit..."
                rows={8}
                className="resize-none"
                data-testid="answer-textarea"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Show your work step by step for partial credit</span>
                <span>{(answers[currentQuestionIndex] || "").length} characters</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation & Submit */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              data-testid="button-previous"
            >
              Previous
            </Button>
          </div>
          
          <div className="flex space-x-3">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                data-testid="button-next"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitExamMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-submit-exam"
              >
                {submitExamMutation.isPending ? "Submitting..." : "Submit Exam"}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-slate-600">
                    {Object.keys(answers).filter(key => answers[parseInt(key)]?.trim()).length} of {totalQuestions} questions answered
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Auto-save is enabled
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
