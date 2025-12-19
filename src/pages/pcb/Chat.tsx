import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Plus, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ChatSession {
  id: string;
  project_id: string;
  title: string | null;
  created_at: string;
}

interface ChatMessage {
  id: string;
  chat_session_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || "");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("pcb_projects")
      .select("id, name")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setProjects(data || []);
      if (!selectedProject && data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    }
  };

  const fetchSessions = async () => {
    if (!selectedProject) {
      setSessions([]);
      return;
    }

    const { data, error } = await supabase
      .from("pcb_chat_sessions")
      .select("*")
      .eq("project_id", selectedProject)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
    } else {
      setSessions(data || []);
      if (data && data.length > 0 && !selectedSession) {
        setSelectedSession(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const { data, error } = await supabase
      .from("pcb_chat_messages")
      .select("*")
      .eq("chat_session_id", selectedSession)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      fetchSessions();
      setSearchParams({ project: selectedProject });
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages();
    }
  }, [selectedSession]);

  const handleCreateSession = async () => {
    if (!selectedProject) {
      toast.error("Select a project first");
      return;
    }

    const { data, error } = await supabase
      .from("pcb_chat_sessions")
      .insert({
        project_id: selectedProject,
        title: `Chat ${format(new Date(), "MMM d, h:mm a")}`,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create chat session");
    } else {
      setSessions([data, ...sessions]);
      setSelectedSession(data.id);
      setMessages([]);
      toast.success("New chat session created");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedSession) return;

    setSending(true);
    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message to DB
    const { data: userMsgData, error: userMsgError } = await supabase
      .from("pcb_chat_messages")
      .insert({
        chat_session_id: selectedSession,
        role: "user",
        content: userMessage,
      })
      .select()
      .single();

    if (userMsgError) {
      console.error("Error sending message:", userMsgError);
      toast.error("Failed to send message");
      setSending(false);
      return;
    }

    setMessages(prev => [...prev, userMsgData]);

    // Call AI copilot edge function
    try {
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke("pcb-design-copilot", {
        body: {
          message: userMessage,
          projectId: selectedProject,
          sessionId: selectedSession,
        },
      });

      if (aiError) throw aiError;

      const assistantContent = aiResponse?.response || "I'm sorry, I couldn't process that request.";

      // Add assistant message to DB
      const { data: assistantMsgData, error: assistantMsgError } = await supabase
        .from("pcb_chat_messages")
        .insert({
          chat_session_id: selectedSession,
          role: "assistant",
          content: assistantContent,
        })
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      setMessages(prev => [...prev, assistantMsgData]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get AI response");
    }

    setSending(false);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-4">
      {/* Sessions sidebar */}
      <Card className="w-64 flex-shrink-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCreateSession}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Select value={selectedProject} onValueChange={(v) => {
            setSelectedProject(v);
            setSelectedSession("");
          }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-1">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={selectedSession === session.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-xs h-8"
                  onClick={() => setSelectedSession(session.id)}
                >
                  <MessageSquare className="h-3 w-3 mr-2" />
                  <span className="truncate">{session.title || "Untitled"}</span>
                </Button>
              ))}
              {sessions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No chat sessions yet
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">PCB Design Copilot</CardTitle>
            <Badge variant="outline" className="ml-auto">AI Powered</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && selectedSession && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your PCB Design Copilot</p>
                  <p className="text-sm mt-2">
                    Ask about component placement, net topology, design rules, or optimization suggestions.
                  </p>
                </div>
              )}
              {!selectedSession && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Create a new chat session to start</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "assistant" ? "" : "flex-row-reverse"}`}
                >
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`flex-1 max-w-[80%] rounded-lg p-3 ${
                    message.role === "assistant" 
                      ? "bg-muted" 
                      : "bg-primary text-primary-foreground"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {format(new Date(message.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder={selectedSession ? "Ask about your PCB design..." : "Select a session first"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={!selectedSession || sending}
                className="flex-1"
              />
              <Button type="submit" disabled={!selectedSession || sending || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
