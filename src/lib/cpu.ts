export type CpuTimes = { user: number; nice: number; sys: number; idle: number; irq: number };

export function cpuUsageBetween(previous: CpuTimes[], current: CpuTimes[]): string[] {
  return current.map((times, index) => {
    const before = previous[index];
    if (!before) return "0.0";
    const total = Object.values(times).reduce((sum, value) => sum + value, 0)
      - Object.values(before).reduce((sum, value) => sum + value, 0);
    const idle = times.idle - before.idle;
    if (total <= 0 || idle < 0) return "0.0";
    return Math.max(0, Math.min(100, 100 * (1 - idle / total))).toFixed(1);
  });
}
