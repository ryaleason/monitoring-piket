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

export function formatDailyReport(areas: AreaReportData[]): string {
  const lines: string[] = ["List Piket Asrama & Musala", ""];

  areas.forEach((area, index) => {
    // Only show assignee name if the area is checked (has completed tasks)
    const isAreaChecked = area.tasks.some((t) => t.completed);
    const hasAssignee = area.assigneeText && area.assigneeText.trim() !== "";

    if (isAreaChecked && hasAssignee) {
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
