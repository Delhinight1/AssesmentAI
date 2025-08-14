import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Brain, GraduationCap } from "lucide-react";

interface TemplateQuestion {
  templateText: string;
  context: string;
  points: number;
  orderIndex: number;
}

export default function CreateExam() {
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  const [examData, setExamData] = useState({
    title: "",
    subject: "",
    instructions: "",
  });

  const [questions, setQuestions] = useState<TemplateQuestion[]>([
    {
      templateText: "",
      context: "",
      points: 10,
      orderIndex: 1,
    },
  ]);

  const createExamMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create the exam
      const examResponse = await apiRequest("POST", "/api/exams", {
        ...examData,
        instructorId: currentUser?.id,
      });
      const exam = await examResponse.json();

      // Then create all template questions
      const questionPromises = questions.map((question, index) =>
        apiRequest("POST", `/api/exams/${exam.id}/questions`, {
          ...question,
          orderIndex: index + 1,
        })
      );

      await Promise.all(questionPromises);
      return exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      toast({
        title: "Exam Created!",
        description: "Your exam has been successfully created and is now active.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!examData.title || !examData.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in the exam title and subject.",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = questions.filter(q => q.templateText && q.context);
    if (validQuestions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one complete question template.",
        variant: "destructive",
      });
      return;
    }

    createExamMutation.mutate({ examData, questions: validQuestions });
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      templateText: "",
      context: "",
      points: 10,
      orderIndex: questions.length + 1,
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof TemplateQuestion, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-slate-900">Create New Exam</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createExamMutation.isPending}
                data-testid="button-save-exam"
              >
                {createExamMutation.isPending ? "Creating..." : "Create Exam"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    value={examData.title}
                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                    placeholder="e.g., Physics Midterm - Newton's Laws"
                    required
                    data-testid="input-exam-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={examData.subject}
                    onChange={(e) => setExamData({ ...examData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                    data-testid="select-subject"
                  >
                    <option value="">Select Subject</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions for Students</Label>
                <Textarea
                  id="instructions"
                  value={examData.instructions}
                  onChange={(e) => setExamData({ ...examData, instructions: e.target.value })}
                  placeholder="Provide clear instructions for how students should approach this exam..."
                  rows={4}
                  data-testid="textarea-instructions"
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question Templates</CardTitle>
                <Button type="button" onClick={addQuestion} variant="outline" data-testid="button-add-question">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-slate-900">
                      Question {index + 1}
                    </h3>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`button-remove-question-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Template Question</Label>
                      <Textarea
                        value={question.templateText}
                        onChange={(e) => updateQuestion(index, 'templateText', e.target.value)}
                        placeholder="e.g., Calculate the net force on an object with a mass of [mass] kg accelerating at [acceleration] m/s²."
                        rows={3}
                        data-testid={`textarea-template-${index}`}
                      />
                      <p className="text-xs text-slate-500">
                        Use [variables] in brackets to indicate values that should be randomized by AI
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Context/Topic</Label>
                      <Input
                        value={question.context}
                        onChange={(e) => updateQuestion(index, 'context', e.target.value)}
                        placeholder="e.g., High School Physics, Newton's Second Law"
                        data-testid={`input-context-${index}`}
                      />
                      <p className="text-xs text-slate-500">
                        Provide context to help AI generate appropriate variations
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 0)}
                          min="1"
                          max="100"
                          data-testid={`input-points-${index}`}
                        />
                      </div>
                    </div>

                    {/* AI Preview */}
                    {question.templateText && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          AI Preview
                        </h4>
                        <p className="text-sm text-blue-700 italic">
                          AI will generate unique variations like: "{question.templateText.replace(/\[([^\]]+)\]/g, (match, variable) => {
                            const examples: { [key: string]: string } = {
                              'mass': '15',
                              'acceleration': '4',
                              'velocity': '25',
                              'angle': '30',
                              'distance': '100',
                              'time': '5',
                            };
                            return examples[variable.toLowerCase()] || '10';
                          })}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Information */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">AI-Powered Question Generation</h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Each student will receive unique questions generated from your templates while maintaining 
                    equivalent difficulty and learning objectives. This ensures academic integrity while providing 
                    fair assessment for all students.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Unique per student
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Equivalent difficulty
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Academic integrity
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
