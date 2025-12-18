export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle different value types
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatTelemetryForExport(data: any[]) {
  return data.map((item) => ({
    Timestamp: item.timestamp,
    "Temperature (°C)": item.temp_c ?? "",
    "Humidity (%)": item.humidity_pct ?? "",
    "HVAC Status": item.hvac_status ?? "",
    "GPU Wattage (W)": item.gpu_wattage ?? "",
    "Tokens Generated": item.tokens_generated ?? "",
    "Model ID": item.model_id ?? "",
    "Facility ID": item.facility_id ?? "",
  }));
}

export function formatMetricsForExport(data: any[]) {
  return data.map((item) => ({
    "Created At": item.created_at,
    "Energy Score": item.ai_energy_score ?? "",
    "Efficiency Rating": item.eco_efficiency_rating ?? "",
    "Predicted Consumption (kWh)": item.predicted_consumption ?? "",
    "Identified Drivers": Array.isArray(item.identified_drivers)
      ? item.identified_drivers.join("; ")
      : item.identified_drivers ?? "",
  }));
}

export function formatRecommendationsForExport(data: any[]) {
  return data.map((item) => ({
    Title: item.title,
    Description: item.description ?? "",
    "Impact Level": item.impact_level ?? "",
    Status: item.status ?? "",
    "Requires Approval": item.requires_approval ? "Yes" : "No",
    "Created At": item.created_at,
  }));
}
