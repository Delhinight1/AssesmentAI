import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { setCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, Users, Brain, Leaf, TrendingUp } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const user = await response.json();
      setCurrentUser(user);
      setLocation("/");
      toast({
        title: "Welcome!",
        description: `Logged in as ${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const user = await response.json();
      setCurrentUser(user);
      setLocation("/");
      toast({
        title: "Account Created!",
        description: "Welcome to AssessmentAI",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Username may already exist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">AssessmentAI</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            AI-Powered Digital Assessment Platform
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Reduce paper waste and ensure academic integrity with unique, AI-generated questions for every student. 
            Create, manage, and grade assessments with intelligent automation.
          </p>

          {/* Auth Section */}
          <div className="max-w-md mx-auto mb-16">
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Demo Login Buttons */}
          <div className="mb-16">
            <p className="text-sm text-slate-600 mb-4">Try the demo with sample accounts:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => handleLogin("prof.smith", "password123")}
                className="flex items-center space-x-2"
                data-testid="demo-instructor-login"
              >
                <Users className="w-4 h-4" />
                <span>Demo as Instructor</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleLogin("alice.johnson", "password123")}
                className="flex items-center space-x-2"
                data-testid="demo-student-login"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Demo as Student</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">AI Question Generation</h3>
            <p className="text-slate-600">
              Generate unique questions for each student while maintaining equivalent difficulty and academic integrity.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Paper-Free Assessments</h3>
            <p className="text-slate-600">
              Completely digital platform that eliminates paper waste and streamlines the assessment process.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Smart Analytics</h3>
            <p className="text-slate-600">
              Track student performance and get insights into learning patterns and assessment effectiveness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (username: string, password: string) => void; isLoading: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onSubmit(username, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
          data-testid="input-username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          data-testid="input-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="First name"
            required
            data-testid="input-first-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Last name"
            required
            data-testid="input-last-name"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="your.email@example.com"
          required
          data-testid="input-email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => updateField("username", e.target.value)}
          placeholder="Choose a username"
          required
          data-testid="input-register-username"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="Choose a password"
          required
          data-testid="input-register-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => updateField("role", e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md"
          data-testid="select-role"
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
