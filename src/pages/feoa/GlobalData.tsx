import GlobalDatacenterStats from "@/components/feoa/GlobalDatacenterStats";

export default function GlobalData() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Global Datacenter Statistics</h1>
        <p className="text-muted-foreground">
          Worldwide datacenter distribution and infrastructure metrics
        </p>
      </div>
      <GlobalDatacenterStats />
    </div>
  );
}
