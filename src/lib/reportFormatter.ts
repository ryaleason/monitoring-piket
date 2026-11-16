/**
 * Pure function to format daily piket report for WhatsApp.
 * Output must be verbatim identical to PRD Section 6.
 */

export interface TaskReportData {
  text: string;
  completed: boolean;
}

export interface AreaReportData {
  areaNumber: number;
  areaName: string;
  assigneeText: string;
  tasks: TaskReportData[];
}

export function formatDailyReport(areas: AreaReportData[]): string {
  const lines: string[] = ["List Piket Asrama & Musala", ""];

  areas.forEach((area, index) => {
    // Exact header format: "N. AreaName : AssigneeName" (note space before colon)
    lines.push(`${area.areaNumber}. ${area.areaName} : ${area.assigneeText}`);
    lines.push("");

    area.tasks.forEach((task) => {
      const mark = task.completed ? "✅" : "❌";
      lines.push(`${task.text} ${mark}`);
    });

    // Add empty line between areas, except after the last area
    if (index < areas.length - 1) {
      lines.push("");
    }
  });

  return lines.join("\n");
}
