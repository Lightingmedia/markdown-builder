import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CircuitBoard, Bell, Shield } from "lucide-react";

export default function PcbSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">PCB Copilot Settings</h2>
        <p className="text-muted-foreground">Configure your PCB design assistant preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CircuitBoard className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Design Preferences</CardTitle>
          </div>
          <CardDescription>
            Customize how the AI assists with your PCB designs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-suggest components</Label>
              <p className="text-sm text-muted-foreground">
                Get AI suggestions for component selection
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Design rule checking</Label>
              <p className="text-sm text-muted-foreground">
                Enable real-time DRC feedback from AI
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Optimization hints</Label>
              <p className="text-sm text-muted-foreground">
                Show optimization suggestions for power and signal integrity
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Design review alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when AI completes design analysis
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Version save confirmations</Label>
              <p className="text-sm text-muted-foreground">
                Show confirmation when versions are saved
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Security</CardTitle>
          </div>
          <CardDescription>
            Data and access settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Encrypt design data</Label>
              <p className="text-sm text-muted-foreground">
                Enable end-to-end encryption for sensitive designs
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Audit logging</Label>
              <p className="text-sm text-muted-foreground">
                Track all design modifications
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
