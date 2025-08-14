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

  const addExampleQuestion = () => {
    const exampleQuestion = {
      templateText: "Calculate the velocity of an object with a mass of [mass] kg when a force of [force] N is applied for [time] seconds, starting from rest.",
      context: "High School Physics - Newton's Laws and Kinematics",
      points: 15,
      orderIndex: questions.length + 1
    };
    setQuestions([...questions, exampleQuestion]);
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
                <div className="flex items-center space-x-2">
                  <Button type="button" onClick={addExampleQuestion} variant="outline" size="sm" data-testid="button-add-example">
                    <Brain className="w-4 h-4 mr-2" />
                    Add Example
                  </Button>
                  <Button type="button" onClick={addQuestion} variant="outline" data-testid="button-add-question">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
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
                        rows={4}
                        data-testid={`textarea-template-${index}`}
                      />
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-amber-800 mb-1">💡 AI Generation Tips:</h5>
                        <ul className="text-xs text-amber-700 space-y-1">
                          <li>• Use [variables] for values AI should randomize (e.g., [mass], [velocity])</li>
                          <li>• Include specific scenarios that can be varied (person names, objects, locations)</li>
                          <li>• Write clear, complete questions that test specific learning objectives</li>
                          <li>• AI will create unique variations while maintaining equivalent difficulty</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Context/Topic</Label>
                      <Input
                        value={question.context}
                        onChange={(e) => updateQuestion(index, 'context', e.target.value)}
                        placeholder="e.g., High School Physics, Newton's Second Law, Problem-solving with kinematics"
                        data-testid={`input-context-${index}`}
                      />
                      <p className="text-xs text-slate-500">
                        Specific learning objective and difficulty level - helps AI maintain educational equivalence
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
                          AI Variation Preview
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Student A might get:</span><br />
                            <span className="italic">"{question.templateText.replace(/\[([^\]]+)\]/g, (match, variable) => {
                              const examples: { [key: string]: string } = {
                                'mass': '15',
                                'acceleration': '4',
                                'velocity': '25',
                                'angle': '30',
                                'distance': '100',
                                'time': '5',
                                'force': '50',
                                'speed': '12',
                                'height': '25'
                              };
                              return examples[variable.toLowerCase()] || '10';
                            })}"</span>
                          </p>
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Student B might get:</span><br />
                            <span className="italic">"{question.templateText.replace(/\[([^\]]+)\]/g, (match, variable) => {
                              const examples: { [key: string]: string } = {
                                'mass': '8',
                                'acceleration': '6',
                                'velocity': '18',
                                'angle': '45',
                                'distance': '75',
                                'time': '3',
                                'force': '35',
                                'speed': '20',
                                'height': '40'
                              };
                              return examples[variable.toLowerCase()] || '15';
                            })}"</span>
                          </p>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">Each student receives a completely unique question with equivalent difficulty.</p>
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
                  <h3 className="font-semibold text-blue-900 mb-2">Advanced AI Question Generation System</h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Our AI ensures <strong>zero question duplication</strong> across all students. Each student receives 
                    completely unique questions that test identical concepts with equivalent difficulty. This advanced 
                    system eliminates cheating while maintaining fair assessment standards.
                  </p>
                  <ul className="text-blue-700 text-sm space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span><strong>Unique Questions:</strong> No two students get identical questions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span><strong>Equivalent Difficulty:</strong> All variations maintain the same challenge level</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span><strong>Same Learning Goals:</strong> Every question tests identical concepts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span><strong>Academic Integrity:</strong> Eliminates cheating through uniqueness</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span><strong>Smart Templates:</strong> Use [variables] for automatic value randomization</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
