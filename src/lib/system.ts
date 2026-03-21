import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function getCpuUsage() {
  const cpus = os.cpus();
  return cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const usage = 100 - (100 * cpu.times.idle) / total;
    return usage.toFixed(1);
  });
}

async function getCpuTemp() {
  try {
    const { stdout } = await execAsync("vcgencmd measure_temp");
    return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
  } catch {
    return null;
  }
}

function bytesToGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

export type Task = {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  memory: number;
};

export async function getRunningTasks(): Promise<Task[]> {
  try {
    // Use ps command to get top 15 processes (reduced from 20 for lower overhead)
    // Optimize: use simpler awk parsing instead of split()
    const { stdout } = await execAsync(
      "ps aux --sort=-%mem | head -16 | tail -15 | awk '{print $2, $1, $3, $4, $NF}'"
    );
    const lines = stdout.split("\n").filter((line) => line.trim());

    return lines
      .slice(0, 15)
      .map((line) => {
        const parts = line.split(/\s+/);
        return {
          pid: parseInt(parts[0], 10),
          user: parts[1],
          cpu: parseFloat(parts[2]),
          memory: parseFloat(parts[3]),
          name: parts[4] || "unknown",
        };
      })
      .filter((t) => !isNaN(t.pid));
  } catch {
    return [];
  }
}

export async function getSystemDetails() {
  // Get CPU usage
  const cpuUsage = getCpuUsage();

  // Get memory info
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
 
  const cpuTemp = await getCpuTemp();

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    architecture: os.arch(),
    timestamp: new Date().toISOString(),
    cpuTemp,
    cpuUsage,
    memoryUsage: {
      total: parseFloat(bytesToGB(totalMem)),
      used: parseFloat(bytesToGB(usedMem)),
      free: parseFloat(bytesToGB(freeMem)),
    },
  };
}
