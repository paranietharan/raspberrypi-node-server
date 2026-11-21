export type Task = { pid: number; user: string; cpu: number; memory: number; name: string };

export function parseTasks(output: string): Task[] {
  const tasks: Task[] = [];
  for (const line of output.trim().split("\n")) {
    const match = line.trim().match(/^(\d+)\s+(\S+)\s+([\d.]+)\s+([\d.]+)\s+(.+)$/);
    if (!match) continue;
    const [, pid, user, cpu, memory, name] = match;
    tasks.push({ pid: Number(pid), user, cpu: Number(cpu), memory: Number(memory), name });
    if (tasks.length === 15) break;
  }
  return tasks;
}
