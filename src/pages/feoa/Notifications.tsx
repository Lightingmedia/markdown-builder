import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  Zap,
  Thermometer,
  Cpu,
  Wind,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string | null;
  impact_level: string | null;
  status: string | null;
  requires_approval: boolean | null;
  created_at: string;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";
type FilterImpact = "all" | "high" | "medium" | "low";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [impactFilter, setImpactFilter] = useState<FilterImpact>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recommendations" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchQuery, statusFilter, impactFilter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setIsLoading(false);
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((n) => n.status === statusFilter);
    }

    // Impact filter
    if (impactFilter !== "all") {
      filtered = filtered.filter((n) => n.impact_level === impactFilter);
    }

    setFilteredNotifications(filtered);
  };

  const getAnomalyIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("gpu") || lowerTitle.includes("wattage")) {
      return <Zap className="h-4 w-4" />;
    }
    if (lowerTitle.includes("temperature") || lowerTitle.includes("temp")) {
      return <Thermometer className="h-4 w-4" />;
    }
    if (lowerTitle.includes("hvac") || lowerTitle.includes("cooling")) {
      return <Wind className="h-4 w-4" />;
    }
    if (lowerTitle.includes("token") || lowerTitle.includes("model")) {
      return <Cpu className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-primary/20 text-primary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "executed":
        return (
          <Badge className="bg-secondary/20 text-secondary-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Executed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getImpactBadge = (level: string | null) => {
    switch (level) {
      case "high":
        return <Badge className="bg-destructive/20 text-destructive">High Impact</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/20 text-yellow-500">Medium Impact</Badge>;
      default:
        return <Badge className="bg-primary/20 text-primary">Low Impact</Badge>;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString("en-GB");
  };

  const stats = {
    total: notifications.length,
    pending: notifications.filter((n) => n.status === "pending").length,
    critical: notifications.filter((n) => n.impact_level === "high").length,
    today: notifications.filter((n) => {
      const created = new Date(n.created_at);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-primary">{stats.today}</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filter Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={impactFilter} onValueChange={(v) => setImpactFilter(v as FilterImpact)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impact</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchNotifications} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            {filteredNotifications.length} of {notifications.length} alerts shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="anomalies">
                Anomalies ({notifications.filter((n) => n.title.toLowerCase().includes("anomaly")).length})
              </TabsTrigger>
              <TabsTrigger value="efficiency">
                Efficiency ({notifications.filter((n) => n.title.toLowerCase().includes("efficiency")).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <NotificationsList
                notifications={filteredNotifications}
                getAnomalyIcon={getAnomalyIcon}
                getStatusBadge={getStatusBadge}
                getImpactBadge={getImpactBadge}
                getTimeAgo={getTimeAgo}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="anomalies">
              <NotificationsList
                notifications={filteredNotifications.filter((n) =>
                  n.title.toLowerCase().includes("anomaly")
                )}
                getAnomalyIcon={getAnomalyIcon}
                getStatusBadge={getStatusBadge}
                getImpactBadge={getImpactBadge}
                getTimeAgo={getTimeAgo}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="efficiency">
              <NotificationsList
                notifications={filteredNotifications.filter((n) =>
                  n.title.toLowerCase().includes("efficiency")
                )}
                getAnomalyIcon={getAnomalyIcon}
                getStatusBadge={getStatusBadge}
                getImpactBadge={getImpactBadge}
                getTimeAgo={getTimeAgo}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface NotificationsListProps {
  notifications: Notification[];
  getAnomalyIcon: (title: string) => React.ReactNode;
  getStatusBadge: (status: string | null) => React.ReactNode;
  getImpactBadge: (level: string | null) => React.ReactNode;
  getTimeAgo: (date: string) => string;
  isLoading: boolean;
}

function NotificationsList({
  notifications,
  getAnomalyIcon,
  getStatusBadge,
  getImpactBadge,
  getTimeAgo,
  isLoading,
}: NotificationsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No notifications found.</p>
        <p className="text-sm">Alerts will appear here when anomalies are detected.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground">
                {getAnomalyIcon(notification.title)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium truncate">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getTimeAgo(notification.created_at)}
                  </span>
                </div>
                {notification.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(notification.status)}
                  {getImpactBadge(notification.impact_level)}
                  {notification.requires_approval && (
                    <Badge variant="outline" className="text-xs">
                      Requires Approval
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
