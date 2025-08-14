import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, clearCurrentUser } from "@/lib/auth";
import { GraduationCap, Plus, Users, Clock, BarChart3, FileText, LogOut, Edit, Trash2 } from "lucide-react";

export default function InstructorDashboard() {
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();

  const { data: exams, isLoading } = useQuery({
    queryKey: ['/api/exams', { instructorId: currentUser?.id }],
  });

  const handleLogout = () => {
    clearCurrentUser();
    setLocation("/");
  };

  const stats = {
    totalExams: Array.isArray(exams) ? exams.length : 0,
    activeExams: Array.isArray(exams) ? exams.filter((exam: any) => exam.isActive).length : 0,
    totalStudents: 84, // This would come from actual data
    avgScore: 87,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">AssessmentAI</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-4">
                  Dashboard
                </Link>
                <Link href="/create-exam" className="text-slate-600 hover:text-slate-900 pb-4">
                  Create Exam
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <Badge variant="secondary">Instructor</Badge>
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
            Welcome back, {currentUser?.firstName}
          </h1>
          <p className="text-slate-600">Manage your exams and monitor student progress.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Exams</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-total-exams">
                    {stats.totalExams}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Students</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-active-students">
                    {stats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Exams</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-active-exams">
                    {stats.activeExams}
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
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Avg Score</p>
                  <p className="text-2xl font-bold text-slate-900" data-testid="stat-avg-score">
                    {stats.avgScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/create-exam">
              <Button className="flex items-center space-x-2" data-testid="button-create-exam">
                <Plus className="w-4 h-4" />
                <span>Create New Exam</span>
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Manage Students</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </Button>
          </div>
        </div>

        {/* Recent Exams */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-slate-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : Array.isArray(exams) && exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map((exam: any) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    data-testid={`exam-card-${exam.id}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{exam.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <span>{exam.subject}</span>
                        <span>•</span>
                        <span>Created {new Date(exam.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={exam.isActive ? "default" : "secondary"}>
                          {exam.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${exam.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-delete-${exam.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No exams yet</h3>
                <p className="text-slate-600 mb-4">Create your first exam to get started.</p>
                <Link href="/create-exam">
                  <Button data-testid="button-create-first-exam">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Exam
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
