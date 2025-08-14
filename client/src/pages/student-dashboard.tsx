import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, clearCurrentUser } from "@/lib/auth";
import { GraduationCap, CheckCircle, Clock, Star, LogOut, Play } from "lucide-react";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();

  const { data: availableExams, isLoading: examsLoading } = useQuery({
    queryKey: ['/api/exams', { active: true }],
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/submissions/student', currentUser?.id],
  });

  const handleLogout = () => {
    clearCurrentUser();
    setLocation("/");
  };

  const completedSubmissions = Array.isArray(submissions) ? submissions.filter((s: any) => s.isCompleted) : [];
  const avgScore = completedSubmissions.length > 0 
    ? Math.round(completedSubmissions.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / completedSubmissions.length)
    : 0;

  const stats = {
    availableExams: Array.isArray(availableExams) ? availableExams.length : 0,
    completedExams: completedSubmissions.length,
    avgScore: avgScore,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">AssessmentAI</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-emerald-600 font-medium border-b-2 border-emerald-600 pb-4">
                  Dashboard
                </Link>
                <span className="text-slate-600 pb-4">My Exams</span>
                <span className="text-slate-600 pb-4">Results</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Student</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Hello, {currentUser?.firstName}!
          </h1>
          <p className="text-slate-600">Ready to take your next assessment?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Available Exams</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-available-exams">
                    {stats.availableExams}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-completed-exams">
                    {stats.completedExams}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Average Score</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-avg-score">
                    {stats.avgScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Exams */}
          <Card>
            <CardHeader>
              <CardTitle>Available Exams</CardTitle>
            </CardHeader>
            <CardContent>
              {examsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : Array.isArray(availableExams) && availableExams.length > 0 ? (
                <div className="space-y-4">
                  {availableExams.map((exam: any) => {
                    const hasSubmission = Array.isArray(submissions) ? submissions.find((s: any) => s.examId === exam.id) : undefined;
                    
                    return (
                      <div
                        key={exam.id}
                        className="border border-slate-200 rounded-lg p-4"
                        data-testid={`available-exam-${exam.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 mb-2">{exam.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                              <span>{exam.subject}</span>
                              <span>•</span>
                              <span>Created {new Date(exam.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">
                              {exam.instructions || "Complete this assessment to test your knowledge."}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={hasSubmission?.isCompleted ? "secondary" : "default"}>
                                {hasSubmission?.isCompleted ? "Completed" : "Available Now"}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-6">
                            {hasSubmission?.isCompleted ? (
                              <Button variant="outline" size="sm" disabled>
                                Completed
                              </Button>
                            ) : (
                              <Link href={`/take-exam/${exam.id}`}>
                                <Button 
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  size="sm"
                                  data-testid={`button-start-exam-${exam.id}`}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Start Exam
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No exams available</h3>
                  <p className="text-slate-600">Check back later for new assessments.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : completedSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {completedSubmissions.slice(0, 5).map((submission: any) => {
                    const percentage = submission.score && submission.maxScore 
                      ? Math.round((submission.score / submission.maxScore) * 100)
                      : 0;
                    
                    const getScoreColor = (score: number) => {
                      if (score >= 90) return "text-emerald-600 border-emerald-500";
                      if (score >= 80) return "text-blue-600 border-blue-500";
                      if (score >= 70) return "text-amber-600 border-amber-500";
                      return "text-red-600 border-red-500";
                    };

                    return (
                      <div
                        key={submission.id}
                        className={`border-l-4 pl-4 py-2 ${getScoreColor(percentage)}`}
                        data-testid={`result-${submission.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">Exam Result</h4>
                            <p className="text-sm text-slate-600">
                              Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getScoreColor(percentage).split(' ')[0]}`}>
                              {submission.score ? `${percentage}%` : 'Pending'}
                            </p>
                            {submission.score && (
                              <p className="text-xs text-slate-500">
                                {submission.score}/{submission.maxScore} points
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No results yet</h3>
                  <p className="text-slate-600">Complete an exam to see your results here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
