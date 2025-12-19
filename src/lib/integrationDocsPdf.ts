import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface IntegrationDocsConfig {
  webhookUrl: string;
  projectId: string;
}

export function exportIntegrationDocumentation(config: IntegrationDocsConfig) {
  const doc = new jsPDF();
  let yPos = 20;

  // Title Page
  doc.setFontSize(28);
  doc.setTextColor(16, 185, 129);
  doc.text("FEOA", 105, 60, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(50);
  doc.text("Facility Energy Optimisation Agent", 105, 72, { align: "center" });

  doc.setFontSize(22);
  doc.setTextColor(30);
  doc.text("Data Centre Integration Guide", 105, 100, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("API Specifications & Setup Instructions", 105, 115, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Version 1.0 | Generated: ${new Date().toLocaleDateString("en-GB")}`, 105, 250, { align: "center" });

  // Page 2: Table of Contents
  doc.addPage();
  yPos = 30;

  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129);
  doc.text("Table of Contents", 14, yPos);

  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(50);
  const toc = [
    "1. Overview .................................................. 3",
    "2. Prerequisites ............................................ 3",
    "3. Webhook Integration ...................................... 4",
    "4. Payload Schema ........................................... 5",
    "5. Code Examples ............................................ 6",
    "6. Error Handling ........................................... 8",
    "7. Security Best Practices .................................. 9",
    "8. Troubleshooting .......................................... 10",
  ];

  toc.forEach((item) => {
    doc.text(item, 14, yPos);
    yPos += 8;
  });

  // Page 3: Overview & Prerequisites
  doc.addPage();
  yPos = 30;

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text("1. Overview", 14, yPos);

  yPos += 12;
  doc.setFontSize(11);
  doc.setTextColor(60);
  const overviewText = `FEOA (Facility Energy Optimisation Agent) is an Industrial IoT SaaS platform designed for facility managers to monitor, analyse, and optimise energy consumption across data centre infrastructure.

This integration guide provides comprehensive instructions for connecting your GPU/TPU infrastructure to the FEOA platform for real-time monitoring, benchmarking, and energy efficiency analysis.

Key capabilities:
• Real-time telemetry ingestion via webhooks
• Support for NVIDIA, AMD, and Google TPU accelerators
• AI-powered energy efficiency recommendations
• Comprehensive benchmarking and reporting`;

  const overviewLines = doc.splitTextToSize(overviewText, 180);
  doc.text(overviewLines, 14, yPos);
  yPos += overviewLines.length * 5 + 15;

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text("2. Prerequisites", 14, yPos);

  yPos += 12;
  doc.setFontSize(11);
  doc.setTextColor(60);

  const prerequisites = [
    ["Infrastructure", "NVIDIA GPU with DCGM or nvidia-smi, AMD Instinct, or Google TPU"],
    ["Network", "Outbound HTTPS (port 443) to FEOA endpoints"],
    ["Authentication", "API key from FEOA dashboard (Settings > API Keys)"],
    ["Agent", "Python 3.8+ or cURL for webhook integration"],
    ["Memory", "Minimum 100MB RAM for monitoring agent"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Requirement", "Details"]],
    body: prerequisites,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  // Page 4: Webhook Integration
  doc.addPage();
  yPos = 30;

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text("3. Webhook Integration", 14, yPos);

  yPos += 12;
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text("The primary method for sending telemetry data to FEOA is via HTTPS POST requests.", 14, yPos);

  yPos += 12;
  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text("Endpoint URL:", 14, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.setFont("courier", "normal");
  doc.text(config.webhookUrl, 14, yPos);
  doc.setFont("helvetica", "normal");

  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text("Request Headers:", 14, yPos);

  yPos += 8;
  const headers = [
    ["Content-Type", "application/json"],
    ["Authorization", "Bearer YOUR_API_KEY"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Header", "Value"]],
    body: headers,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9, font: "courier" },
    columnStyles: { 0: { cellWidth: 50 } },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text("Response Codes:", 14, yPos);

  yPos += 8;
  const responseCodes = [
    ["200", "Success - Data ingested successfully"],
    ["400", "Bad Request - Invalid payload format"],
    ["401", "Unauthorised - Invalid or missing API key"],
    ["429", "Rate Limited - Too many requests (max 1000/min)"],
    ["500", "Server Error - Contact support"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Code", "Description"]],
    body: responseCodes,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 30, fontStyle: "bold" } },
  });

  // Page 5: Payload Schema
  doc.addPage();
  yPos = 30;

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text("4. Payload Schema", 14, yPos);

  yPos += 12;
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text("All telemetry data must be sent as JSON. The following fields are supported:", 14, yPos);

  yPos += 10;

  const schemaFields = [
    ["timestamp", "ISO 8601", "Yes", "UTC timestamp (e.g., 2024-01-15T10:30:00Z)"],
    ["facility_id", "String", "Yes", "Unique identifier for your facility"],
    ["accelerator_vendor", "Enum", "No", "nvidia | google_tpu | amd"],
    ["gpu_wattage", "Number", "No", "GPU power consumption in watts"],
    ["nvidia_utilization", "Number", "No", "GPU utilisation (0-100%)"],
    ["nvidia_memory_gb", "Number", "No", "GPU memory used in GB"],
    ["tpu_wattage", "Number", "No", "TPU power consumption in watts"],
    ["tpu_utilization", "Number", "No", "TPU utilisation (0-100%)"],
    ["amd_gpu_wattage", "Number", "No", "AMD GPU power in watts"],
    ["amd_utilization", "Number", "No", "AMD utilisation (0-100%)"],
    ["temp_c", "Number", "No", "Ambient temperature in Celsius"],
    ["humidity_pct", "Number", "No", "Humidity percentage (0-100)"],
    ["hvac_status", "String", "No", "ON | OFF | AUTO"],
    ["tokens_generated", "Integer", "No", "Tokens generated (LLM workloads)"],
    ["model_id", "String", "No", "AI model identifier"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Field", "Type", "Required", "Description"]],
    body: schemaFields,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { fontStyle: "bold", font: "courier", cellWidth: 38 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
    },
  });

  // Page 6: Code Examples
  doc.addPage();
  yPos = 30;

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text("5. Code Examples", 14, yPos);

  yPos += 15;
  doc.setFontSize(14);
  doc.setTextColor(50);
  doc.text("5.1 cURL", 14, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setFont("courier", "normal");
  doc.setTextColor(60);

  const curlCommand = `curl -X POST "${config.webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "timestamp": "2024-01-15T10:30:00Z",
    "facility_id": "dc-west-01",
    "accelerator_vendor": "nvidia",
    "gpu_wattage": 350,
    "nvidia_utilization": 85,
    "temp_c": 72,
    "tokens_generated": 15000
  }'`;

  const curlLines = doc.splitTextToSize(curlCommand, 180);
  doc.text(curlLines, 14, yPos);
  doc.setFont("helvetica", "normal");

  yPos += curlLines.length * 4 + 15;

  doc.setFontSize(14);
  doc.setTextColor(50);
  doc.text("5.2 Python", 14, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setFont("courier", "normal");
  doc.setTextColor(60);

  const pythonCode = `import requests
from datetime import datetime

FEOA_WEBHOOK_URL = "${config.webhookUrl}"
API_KEY = "your_api_key_here"

def send_telemetry(facility_id, gpu_data):
    payload = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "facility_id": facility_id,
        "accelerator_vendor": "nvidia",
        **gpu_data
    }
    
    response = requests.post(
        FEOA_WEBHOOK_URL,
        json=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }
    )
    return response.status_code == 200`;

  const pythonLines = doc.splitTextToSize(pythonCode, 180);
  doc.text(pythonLines, 14, yPos);
  doc.setFont("helvetica", "normal");

  // Page 7: More Examples
  doc.addPage();
  yPos = 30;

  doc.setFontSize(14);
  doc.setTextColor(50);
  doc.text("5.3 Bash Script (nvidia-smi Integration)", 14, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setFont("courier", "normal");
  doc.setTextColor(60);

  const bashScript = `#!/bin/bash
# FEOA Telemetry Collection Script

WEBHOOK_URL="${config.webhookUrl}"
API_KEY="your_api_key_here"
FACILITY_ID="dc-west-01"

while true; do
  GPU_POWER=$(nvidia-smi --query-gpu=power.draw --format=csv,noheader,nounits | head -1)
  GPU_UTIL=$(nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits | head -1)
  GPU_TEMP=$(nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader | head -1)
  
  curl -s -X POST "$WEBHOOK_URL" \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer $API_KEY" \\
    -d "{
      \\"timestamp\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\",
      \\"facility_id\\": \\"$FACILITY_ID\\",
      \\"gpu_wattage\\": $GPU_POWER,
      \\"nvidia_utilization\\": $GPU_UTIL,
      \\"temp_c\\": $GPU_TEMP
    }"
  
  sleep 60  # Send every 60 seconds
done`;

  const bashLines = doc.splitTextToSize(bashScript, 180);
  doc.text(bashLines, 14, yPos);
  doc.setFont("helvetica", "normal");

  // Page 8: Error Handling
  doc.addPage();
  yPos = 30;

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text("6. Error Handling", 14, yPos);

  yPos += 12;
  doc.setFontSize(11);
  doc.setTextColor(60);
  const errorText = `When integrating with FEOA, implement proper error handling to ensure reliable data delivery:`;
  doc.text(errorText, 14, yPos);

  yPos += 15;

  const errorHandling = [
    ["Retry Logic", "Implement exponential backoff for transient errors (5xx codes)"],
    ["Buffering", "Buffer telemetry locally if FEOA is temporarily unavailable"],
    ["Validation", "Validate payload structure before sending to avoid 400 errors"],
    ["Logging", "Log all failed requests with timestamps for debugging"],
    ["Alerting", "Set up alerts for sustained connection failures"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Strategy", "Implementation"]],
    body: errorHandling,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  // Page 9: Security
  doc.addPage();
  yPos = 30;

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text("7. Security Best Practices", 14, yPos);

  yPos += 12;

  const securityPractices = [
    ["API Key Storage", "Store API keys in environment variables or secrets manager, never in code"],
    ["HTTPS Only", "All requests must use HTTPS - HTTP requests will be rejected"],
    ["Key Rotation", "Rotate API keys every 90 days via the FEOA dashboard"],
    ["IP Whitelisting", "Configure IP whitelisting in Settings > Security for additional protection"],
    ["Audit Logs", "Review API access logs regularly in the FEOA dashboard"],
    ["Least Privilege", "Create separate API keys for different facilities/environments"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Practice", "Recommendation"]],
    body: securityPractices,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  // Page 10: Troubleshooting
  doc.addPage();
  yPos = 30;

  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text("8. Troubleshooting", 14, yPos);

  yPos += 12;

  const troubleshooting = [
    ["401 Unauthorised", "Verify API key is correct and not expired. Check Authorization header format."],
    ["400 Bad Request", "Check JSON syntax. Ensure timestamp is valid ISO 8601 format."],
    ["No data showing", "Confirm facility_id matches dashboard configuration. Check timestamp is recent."],
    ["Connection timeout", "Verify outbound HTTPS (443) is allowed. Check DNS resolution."],
    ["Rate limiting (429)", "Reduce request frequency. Implement request batching if needed."],
    ["Missing metrics", "Verify field names match schema exactly (case-sensitive)."],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Issue", "Solution"]],
    body: troubleshooting,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 } },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(12);
  doc.setTextColor(50);
  doc.text("Support Contact", 14, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("Email: support@lightrail.ai", 14, yPos);
  yPos += 6;
  doc.text("Documentation: https://docs.lightrail.ai", 14, yPos);

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | FEOA Integration Guide | Confidential`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.save(`feoa-integration-guide-${new Date().toISOString().split("T")[0]}.pdf`);
}
