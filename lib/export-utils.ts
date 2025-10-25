interface KPISummary {
  metric: string;
  value: string | number;
  description: string;
}

export function generateCSVReport(kpiData: KPISummary[]): string {
  const headers = ['Metric', 'Value', 'Description'];
  const rows = kpiData.map(item => [
    item.metric,
    item.value.toString(),
    item.description
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDFSummary(kpiData: KPISummary[]): string {
  const summary = `HVAC Business KPI Report
Generated: ${new Date().toLocaleDateString()}

${kpiData.map(item => `${item.metric}: ${item.value}
${item.description}`).join('\n\n')}
`;

  return summary;
}
