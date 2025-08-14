import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft, Download, Printer, Brain, CheckCircle, AlertTriangle } from "lucide-react";

export default function ExamResults() {
  const { submissionId } = useParams();
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();

  // In a real app, you'd fetch the specific submission by ID
  // For now, we'll show a sample result structure
  
  const sampleResult = {
    id: submissionId,
    examTitle: "Physics Midterm - Newton's Laws",
    subject: "Physics",
    submittedAt: new Date().toISOString(),
    score: 23,
    maxScore: 25,
    isCompleted: true,
    questions: [
      {
        questionText: "Calculate the net force on an object with a mass of 12 kg accelerating at 3.5 m/s². Show all work and include units in your final answer.",
        studentAnswer: "F = ma\nF = 12 kg × 3.5 m/s²\nF = 42 N\n\nThe net force is 42 Newtons.",
        points: 10,
        maxPoints: 10,
        feedback: "Excellent work! You correctly applied Newton's second law and showed all steps clearly.",
        status: "correct"
      },
      {
        questionText: "A ball is thrown at 45 degrees with initial velocity 20 m/s. Calculate the maximum height reached. Use g = 9.8 m/s².",
        studentAnswer: "Using kinematic equations:\nv² = u² + 2as\nAt max height, v = 0\n0 = (20 sin 45°)² - 2(9.8)h\nh = (20 × 0.707)² / (2 × 9.8)\nh = 10.2 m",
        points: 13,
        maxPoints: 15,
        feedback: "Good understanding of projectile motion! You correctly identified the vertical component and used the right equation. Minor calculation error in the final step.",
        status: "partial"
      }
    ]
  };

  const percentage = Math.round((sampleResult.score / sampleResult.maxScore) * 100);
  
  const getGradeLetter = (percent: number) => {
    if (percent >= 97) return "A+";
    if (percent >= 93) return "A";
    if (percent >= 90) return "A-";
    if (percent >= 87) return "B+";
    if (percent >= 83) return "B";
    if (percent >= 80) return "B-";
    if (percent >= 77) return "C+";
    if (percent >= 73) return "C";
    if (percent >= 70) return "C-";
    if (percent >= 67) return "D+";
    if (percent >= 65) return "D";
    return "F";
  };

  const getScoreColor = (status: string) => {
    switch (status) {
      case "correct": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "partial": return "text-amber-600 bg-amber-50 border-amber-200";
      case "incorrect": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "correct": return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "partial": return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Exam Results</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" data-testid="button-print">
                <Printer className="w-4 h-4 mr-2" />
                Printer
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2" data-testid="exam-title">
            {sampleResult.examTitle}
          </h2>
          <div className="flex items-center space-x-4 text-slate-600">
            <span>{sampleResult.subject}</span>
            <span>•</span>
            <span>Submitted {new Date(sampleResult.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Overall Score</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-emerald-600" data-testid="overall-score">
                    {percentage}%
                  </div>
                  <div className="text-slate-600">
                    <p className="font-medium">
                      {sampleResult.score} out of {sampleResult.maxScore} points
                    </p>
                    <p className="text-sm">Submitted on time</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-600 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-emerald-600">
                    {getGradeLetter(percentage)}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  Excellent
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question-by-Question Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {sampleResult.questions.map((question, index) => (
              <div key={index} className="border-b border-slate-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-slate-900">Question {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={getScoreColor(question.status)}
                      data-testid={`question-score-${index}`}
                    >
                      {question.points}/{question.maxPoints} points
                    </Badge>
                    {getStatusIcon(question.status)}
                  </div>
                </div>

                {/* AI Generated Question */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Your AI-Generated Question
                      </p>
                      <p className="text-blue-900" data-testid={`question-text-${index}`}>
                        {question.questionText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Answer */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Your Answer</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <pre className="text-slate-800 whitespace-pre-wrap font-mono text-sm" data-testid={`student-answer-${index}`}>
                      {question.studentAnswer}
                    </pre>
                  </div>
                </div>

                {/* Instructor Feedback */}
                <div className={`border rounded-lg p-4 ${getScoreColor(question.status)}`}>
                  <p className="text-sm font-medium mb-1">Instructor Feedback</p>
                  <p className="text-sm" data-testid={`feedback-${index}`}>
                    {question.feedback}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" data-testid="button-download-detailed">
              <Download className="w-4 h-4 mr-2" />
              Download Detailed Report
            </Button>
            <Button variant="outline" data-testid="button-review-answers">
              Review All Answers
            </Button>
          </div>
        </div>

        {/* Study Recommendations */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">Study Recommendations</h3>
            <div className="space-y-2 text-blue-800 text-sm">
              <p>• Great work on Newton's second law applications! Your methodology is solid.</p>
              <p>• Review projectile motion calculations, particularly vertical component analysis.</p>
              <p>• Consider practicing more problems involving kinematic equations for consistency.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
