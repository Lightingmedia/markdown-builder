import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Bell, Shield } from "lucide-react";
import { DataExport } from "@/components/feoa/DataExport";
import { UserRoleManagement } from "@/components/feoa/UserRoleManagement";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    company: "",
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReport: true,
    criticalOnly: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile((prev) => ({
          ...prev,
          email: user.email || "",
        }));

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          setProfile({
            fullName: data.full_name || "",
            email: data.email || user.email || "",
            company: data.company || "",
          });
        }
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.fullName,
          company: profile.company,
        })
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved.",
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* User Role Management (Admin Only) */}
      <UserRoleManagement />

      {/* Data Export */}
      <DataExport />

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed directly
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={profile.company}
              onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure alert preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailAlerts">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts via email
              </p>
            </div>
            <Switch
              id="emailAlerts"
              checked={notifications.emailAlerts}
              onCheckedChange={(checked) =>
                setNotifications((n) => ({ ...n, emailAlerts: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReport">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly eco-efficiency summary
              </p>
            </div>
            <Switch
              id="weeklyReport"
              checked={notifications.weeklyReport}
              onCheckedChange={(checked) =>
                setNotifications((n) => ({ ...n, weeklyReport: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="criticalOnly">Critical Alerts Only</Label>
              <p className="text-sm text-muted-foreground">
                Only notify for high-impact issues
              </p>
            </div>
            <Switch
              id="criticalOnly"
              checked={notifications.criticalOnly}
              onCheckedChange={(checked) =>
                setNotifications((n) => ({ ...n, criticalOnly: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Account security options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <p className="text-sm text-muted-foreground">
            You will receive an email to reset your password.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
