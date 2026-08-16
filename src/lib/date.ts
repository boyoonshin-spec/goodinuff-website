export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayInputValue(): string {
  return toDateInputValue(new Date());
}

export function addDaysInputValue(dateInputValue: string, days: number): string {
  const [year, month, day] = dateInputValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function formatDateLabel(dateInputValue: string): string {
  const [year, month, day] = dateInputValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function isToday(dateInputValue: string): boolean {
  return dateInputValue === todayInputValue();
}

export function addMonthsInputValue(dateInputValue: string, months: number): string {
  const [year, month] = dateInputValue.split("-").map(Number);
  const date = new Date(year, month - 1 + months, 1);
  return toDateInputValue(date);
}

export function formatMonthLabel(dateInputValue: string): string {
  const [year, month] = dateInputValue.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(date);
}

// Returns the dates for a full calendar grid (Sun-Sat weeks) covering the
// month of dateInputValue, including leading/trailing days from adjacent
// months so every week row is complete.
export function getMonthGridDates(dateInputValue: string): string[] {
  const [year, month] = dateInputValue.split("-").map(Number);
  const firstOfMonth = new Date(year, month - 1, 1);
  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - start.getDay());

  const lastOfMonth = new Date(year, month, 0);
  const end = new Date(lastOfMonth);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toDateInputValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function isSameMonth(dateInputValue: string, monthInputValue: string): boolean {
  return dateInputValue.slice(0, 7) === monthInputValue.slice(0, 7);
}
