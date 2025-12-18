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

export function exportAITrainingCostsPDF(
  data: AITrainingCost[],
  totals: { totalCost: number; totalEnergy: number; totalCarbon: number }
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Primary green
  doc.text("LightRail", 14, 20);

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
      `Page ${i} of ${pageCount} | LightRail - Facility Energy Optimisation Agent`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`ai-training-costs-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
