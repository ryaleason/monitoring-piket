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
  assigneeText?: string;
  tasks: TaskReportData[];
}

export function formatDailyReport(areas: AreaReportData[], includeAssignee: boolean = false): string {
  const lines: string[] = ["List Piket Asrama & Musala", ""];

  areas.forEach((area, index) => {
    if (includeAssignee && area.assigneeText && area.assigneeText.trim() !== "") {
      lines.push(`${area.areaNumber}. ${area.areaName} : ${area.assigneeText}`);
    } else {
      lines.push(`${area.areaNumber}. ${area.areaName}`);
    }
    lines.push("");

    area.tasks.forEach((task) => {
      if (task.completed) {
        lines.push(`${task.text} ✅`);
      } else {
        lines.push(task.text);
      }
    });

    // Add empty line between areas, except after the last area
    if (index < areas.length - 1) {
      lines.push("");
    }
  });

  return lines.join("\n");
}
