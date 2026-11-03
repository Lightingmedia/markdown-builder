import SEO from "@/components/SEO";

const Index = () => (
  <>
    <SEO
      title="LightRail AI | AI workload placement and interconnect efficiency"
      description="Fabric OS runs on GPU clusters you already have. It intercepts All-Reduce and reroutes it across the cluster fabric. Efficiency is measured per cluster during the pilot."
      canonical="/"
    />
    <iframe
      src={`/home.html?v=${Date.now()}`}
      title="LightRail AI"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0, display: "block" }}
    />
  </>
);

export default Index;
