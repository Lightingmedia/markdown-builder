import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Box, Cpu, Cable, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface DesignObject {
  id: string;
  project_id: string;
  type: string;
  name: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

const OBJECT_TYPES = [
  { value: "BLOCK", label: "Block", icon: Box },
  { value: "COMPONENT", label: "Component", icon: Cpu },
  { value: "NET", label: "Net", icon: Cable },
  { value: "CONSTRAINT", label: "Constraint", icon: AlertCircle },
];

export default function DesignCanvas() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  
  const [project, setProject] = useState<Project | null>(null);
  const [objects, setObjects] = useState<DesignObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newObjectType, setNewObjectType] = useState("COMPONENT");
  const [newObjectName, setNewObjectName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchProjectAndObjects = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const { data: projectData, error: projectError } = await supabase
      .from("pcb_projects")
      .select("id, name")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      console.error("Error fetching project:", projectError);
      toast.error("Failed to load project");
    } else {
      setProject(projectData);
    }

    const { data: objectsData, error: objectsError } = await supabase
      .from("pcb_design_objects")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (objectsError) {
      console.error("Error fetching objects:", objectsError);
    } else {
      const formattedObjects = (objectsData || []).map(obj => ({
        ...obj,
        metadata: (obj.metadata as Record<string, unknown>) || {}
      }));
      setObjects(formattedObjects);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectAndObjects();
  }, [projectId]);

  const handleAddObject = async () => {
    if (!newObjectName.trim() || !projectId) {
      toast.error("Object name is required");
      return;
    }

    setAdding(true);
    const { data, error } = await supabase
      .from("pcb_design_objects")
      .insert({
        project_id: projectId,
        type: newObjectType,
        name: newObjectName.trim(),
        metadata: {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding object:", error);
      toast.error("Failed to add object");
    } else {
      toast.success("Object added");
      setObjects([{ ...data, metadata: {} }, ...objects]);
      setNewObjectName("");
      setAddDialogOpen(false);
    }
    setAdding(false);
  };

  const handleDeleteObject = async (objectId: string) => {
    const { error } = await supabase
      .from("pcb_design_objects")
      .delete()
      .eq("id", objectId);

    if (error) {
      console.error("Error deleting object:", error);
      toast.error("Failed to delete object");
    } else {
      toast.success("Object deleted");
      setObjects(objects.filter(o => o.id !== objectId));
    }
  };

  const handleSaveVersion = async () => {
    if (!projectId) return;

    const { data: versions } = await supabase
      .from("pcb_design_versions")
      .select("version_number")
      .eq("project_id", projectId)
      .order("version_number", { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number || 0) + 1;

    const { error } = await supabase
      .from("pcb_design_versions")
      .insert({
        project_id: projectId,
        version_number: nextVersion,
        summary_text: `Version ${nextVersion} - ${objects.length} objects`,
        design_snapshot: { objects } as unknown as Json,
      });

    if (error) {
      console.error("Error saving version:", error);
      toast.error("Failed to save version");
    } else {
      toast.success(`Version ${nextVersion} saved`);
    }
  };

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
        <p className="text-muted-foreground">
          Select a project from the Projects page to start designing.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading design...</div>
      </div>
    );
  }

  const groupedObjects = OBJECT_TYPES.reduce((acc, type) => {
    acc[type.value] = objects.filter(o => o.type === type.value);
    return acc;
  }, {} as Record<string, DesignObject[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{project?.name || "Design Canvas"}</h2>
          <p className="text-muted-foreground">{objects.length} design objects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveVersion}>
            <Save className="h-4 w-4 mr-2" />
            Save Version
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Object
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Design Object</DialogTitle>
                <DialogDescription>
                  Add a new component, net, block, or constraint to your design.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Object Type</Label>
                  <Select value={newObjectType} onValueChange={setNewObjectType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OBJECT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., U1, VCC_3V3, DDR_CLK"
                    value={newObjectName}
                    onChange={(e) => setNewObjectName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddObject} disabled={adding}>
                  {adding ? "Adding..." : "Add Object"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="COMPONENT">
        <TabsList>
          {OBJECT_TYPES.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="gap-2">
              <type.icon className="h-4 w-4" />
              {type.label}
              <Badge variant="secondary" className="ml-1">
                {groupedObjects[type.value]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {OBJECT_TYPES.map((type) => (
          <TabsContent key={type.value} value={type.value} className="mt-4">
            {groupedObjects[type.value]?.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <type.icon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No {type.label.toLowerCase()}s yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupedObjects[type.value]?.map((obj) => (
                  <Card key={obj.id} className="group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-medium">{obj.name}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteObject(obj.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {Object.keys(obj.metadata).length} properties
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
