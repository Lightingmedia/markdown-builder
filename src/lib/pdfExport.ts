import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AITrainingCost {
  model_name: string;
  model_provider: string;
  energy_kwh: number;
  cost_usd: number;
  carbon_kg: number;
  parameters_billions: number;
  training_date: string;
}

interface FacilityTelemetry {
  timestamp: string;
  temp_c: number | null;
  humidity_pct: number | null;
  hvac_status: string | null;
  gpu_wattage: number | null;
  tokens_generated: number | null;
}

interface ProcessedMetric {
  created_at: string;
  ai_energy_score: number | null;
  eco_efficiency_rating: string | null;
}

interface Recommendation {
  title: string;
  description: string | null;
  impact_level: string | null;
  status: string | null;
}

export interface ReportConfig {
  title: string;
  notes: string;
  generatedAt: string;
  metrics: string[];
  facilityData: FacilityTelemetry[] | null;
  aiTrainingData: AITrainingCost[] | null;
  efficiencyData: {
    metrics: ProcessedMetric[];
    recommendations: Recommendation[];
  } | null;
}

export function exportAITrainingCostsPDF(
  data: AITrainingCost[],
  totals: { totalCost: number; totalEnergy: number; totalCarbon: number }
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text("LightRail AI", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("AI Training Cost Report", 14, 28);

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 14, 35);

  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(50);
  doc.text("Summary", 14, 48);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Total Models Tracked: ${data.length}`, 14, 56);
  doc.text(`Total Training Cost: $${(totals.totalCost / 1000000).toFixed(1)}M`, 14, 63);
  doc.text(`Total Energy Consumed: ${(totals.totalEnergy / 1000000).toFixed(1)} GWh`, 14, 70);
  doc.text(`Total Carbon Emissions: ${(totals.totalCarbon / 1000).toFixed(0)}k tonnes CO₂`, 14, 77);

  // Table
  const tableData = data.map((item) => [
    item.model_name,
    item.model_provider,
    `${item.parameters_billions}B`,
    `$${(item.cost_usd / 1000000).toFixed(1)}M`,
    `${(item.energy_kwh / 1000000).toFixed(2)} GWh`,
    `${(item.carbon_kg / 1000).toFixed(0)}k kg`,
    new Date(item.training_date).toLocaleDateString("en-GB"),
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["Model", "Provider", "Params", "Cost", "Energy", "Carbon", "Date"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | LightRail AI - Facility Energy Optimisation Agent`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`ai-training-costs-report-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportCustomReport(config: ReportConfig) {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text("LightRail AI", 14, yPos);

  yPos += 8;
  doc.setFontSize(14);
  doc.setTextColor(50);
  doc.text(config.title, 14, yPos);

  yPos += 7;
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Generated: ${new Date(config.generatedAt).toLocaleDateString("en-GB")}`, 14, yPos);

  // Notes
  if (config.notes) {
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80);
    const noteLines = doc.splitTextToSize(config.notes, 180);
    doc.text(noteLines, 14, yPos);
    yPos += noteLines.length * 5 + 5;
  }

  // Facility Data Section
  if (config.facilityData && config.facilityData.length > 0) {
    const facilityMetrics = config.metrics.filter((m) =>
      ["temperature", "humidity", "hvac_status", "gpu_wattage", "tokens_generated"].includes(m)
    );

    if (facilityMetrics.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text("Facility Telemetry Data", 14, yPos);

      const headers = ["Timestamp"];
      if (config.metrics.includes("temperature")) headers.push("Temp (°C)");
      if (config.metrics.includes("humidity")) headers.push("Humidity (%)");
      if (config.metrics.includes("hvac_status")) headers.push("HVAC");
      if (config.metrics.includes("gpu_wattage")) headers.push("GPU (W)");
      if (config.metrics.includes("tokens_generated")) headers.push("Tokens");

      const rows = config.facilityData.slice(0, 50).map((item) => {
        const row = [new Date(item.timestamp).toLocaleString("en-GB")];
        if (config.metrics.includes("temperature")) row.push(item.temp_c?.toFixed(1) || "-");
        if (config.metrics.includes("humidity")) row.push(item.humidity_pct?.toFixed(1) || "-");
        if (config.metrics.includes("hvac_status")) row.push(item.hvac_status || "-");
        if (config.metrics.includes("gpu_wattage")) row.push(item.gpu_wattage?.toString() || "-");
        if (config.metrics.includes("tokens_generated")) row.push(item.tokens_generated?.toString() || "-");
        return row;
      });

      autoTable(doc, {
        startY: yPos + 5,
        head: [headers],
        body: rows,
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // AI Training Data Section
  if (config.aiTrainingData && config.aiTrainingData.length > 0) {
    const aiMetrics = config.metrics.filter((m) =>
      ["training_costs", "training_energy", "training_carbon", "model_parameters"].includes(m)
    );

    if (aiMetrics.length > 0) {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text("AI Training Costs", 14, yPos);

      // Summary stats
      const totalCost = config.aiTrainingData.reduce((sum, item) => sum + item.cost_usd, 0);
      const totalEnergy = config.aiTrainingData.reduce((sum, item) => sum + item.energy_kwh, 0);
      const totalCarbon = config.aiTrainingData.reduce((sum, item) => sum + item.carbon_kg, 0);

      yPos += 7;
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(`Total Models: ${config.aiTrainingData.length} | Cost: $${(totalCost / 1000000).toFixed(1)}M | Energy: ${(totalEnergy / 1000000).toFixed(2)} GWh | Carbon: ${(totalCarbon / 1000).toFixed(0)}k tonnes`, 14, yPos);

      const headers = ["Model", "Provider"];
      if (config.metrics.includes("model_parameters")) headers.push("Params");
      if (config.metrics.includes("training_costs")) headers.push("Cost");
      if (config.metrics.includes("training_energy")) headers.push("Energy");
      if (config.metrics.includes("training_carbon")) headers.push("Carbon");

      const rows = config.aiTrainingData.map((item) => {
        const row = [item.model_name, item.model_provider];
        if (config.metrics.includes("model_parameters")) row.push(`${item.parameters_billions}B`);
        if (config.metrics.includes("training_costs")) row.push(`$${(item.cost_usd / 1000000).toFixed(1)}M`);
        if (config.metrics.includes("training_energy")) row.push(`${(item.energy_kwh / 1000000).toFixed(2)} GWh`);
        if (config.metrics.includes("training_carbon")) row.push(`${(item.carbon_kg / 1000).toFixed(0)}k kg`);
        return row;
      });

      autoTable(doc, {
        startY: yPos + 5,
        head: [headers],
        body: rows,
        theme: "striped",
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Efficiency Data Section
  if (config.efficiencyData) {
    const efficiencyMetrics = config.metrics.filter((m) =>
      ["energy_score", "efficiency_rating", "recommendations"].includes(m)
    );

    if (efficiencyMetrics.length > 0) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      // Efficiency metrics table
      if ((config.metrics.includes("energy_score") || config.metrics.includes("efficiency_rating")) &&
          config.efficiencyData.metrics.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text("Efficiency Metrics", 14, yPos);

        const headers = ["Timestamp"];
        if (config.metrics.includes("energy_score")) headers.push("Energy Score");
        if (config.metrics.includes("efficiency_rating")) headers.push("Rating");

        const rows = config.efficiencyData.metrics.slice(0, 30).map((item) => {
          const row = [new Date(item.created_at).toLocaleString("en-GB")];
          if (config.metrics.includes("energy_score")) row.push(item.ai_energy_score?.toFixed(2) || "-");
          if (config.metrics.includes("efficiency_rating")) row.push(item.eco_efficiency_rating || "-");
          return row;
        });

        autoTable(doc, {
          startY: yPos + 5,
          head: [headers],
          body: rows,
          theme: "striped",
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
          bodyStyles: { fontSize: 7 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Recommendations
      if (config.metrics.includes("recommendations") && config.efficiencyData.recommendations.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text("AI Recommendations", 14, yPos);

        const rows = config.efficiencyData.recommendations.slice(0, 20).map((rec) => [
          rec.title,
          rec.description || "-",
          rec.impact_level || "-",
          rec.status || "-",
        ]);

        autoTable(doc, {
          startY: yPos + 5,
          head: [["Title", "Description", "Impact", "Status"]],
          body: rows,
          theme: "striped",
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
          bodyStyles: { fontSize: 7 },
          columnStyles: {
            1: { cellWidth: 80 },
          },
        });
      }
    }
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | LightRail AI - Facility Energy Optimisation Agent`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  const fileName = config.title.toLowerCase().replace(/\s+/g, "-");
  doc.save(`${fileName}-${new Date().toISOString().split("T")[0]}.pdf`);
}
