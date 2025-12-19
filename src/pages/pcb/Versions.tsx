import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Clock, FileJson, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface DesignVersion {
  id: string;
  project_id: string;
  version_number: number;
  summary_text: string | null;
  design_snapshot: Json;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Versions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || "");

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

  const fetchVersions = async () => {
    if (!selectedProject) {
      setVersions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("pcb_design_versions")
      .select("*")
      .eq("project_id", selectedProject)
      .order("version_number", { ascending: false });

    if (error) {
      console.error("Error fetching versions:", error);
      toast.error("Failed to load versions");
    } else {
      setVersions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      fetchVersions();
      setSearchParams({ project: selectedProject });
    }
  }, [selectedProject]);

  const getSnapshotObjectCount = (snapshot: Json): number => {
    if (typeof snapshot === 'object' && snapshot !== null && 'objects' in snapshot) {
      const objects = (snapshot as { objects?: unknown[] }).objects;
      return Array.isArray(objects) ? objects.length : 0;
    }
    return 0;
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Design Versions</h2>
          <p className="text-muted-foreground">View and manage design version history</p>
        </div>
        <div className="w-64">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedProject ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
            <p className="text-muted-foreground">
              Select a project to view its version history.
            </p>
          </CardContent>
        </Card>
      ) : versions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Versions Yet</h3>
            <p className="text-muted-foreground text-center">
              Save your first version from the Design Canvas to start tracking history.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <Card key={version.id} className={index === 0 ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">
                      Version {version.version_number}
                    </CardTitle>
                    {index === 0 && (
                      <Badge variant="default">Latest</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <CardDescription>
                  {version.summary_text || "No summary"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileJson className="h-4 w-4 text-muted-foreground" />
                    <span>{getSnapshotObjectCount(version.design_snapshot)} objects in snapshot</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
