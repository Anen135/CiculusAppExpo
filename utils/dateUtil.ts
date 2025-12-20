export const getLocalDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const timeStringToDate = (time: string, dateStr: string): Date => {
  const [h, min, sec] = time.split(":").map(Number);
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, h, min, sec);
}

export const dateToTimeString = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:00`;
}

export const getCurrentTime = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}