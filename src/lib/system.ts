import { parseTasks, type Task } from "./tasks";
import os from "os";
import { cpuUsageBetween } from "./cpu";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

let previousCpuTimes = os.cpus().map(cpu => cpu.times);

function getCpuUsage() {
  const current = os.cpus().map(cpu => cpu.times);
  const usage = cpuUsageBetween(previousCpuTimes, current);
  previousCpuTimes = current;
  return usage;
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

export async function getRunningTasks(): Promise<Task[]> {
  const { stdout } = await execAsync("ps -eo pid=,user=,pcpu=,pmem=,comm= --sort=-pmem");
  return parseTasks(stdout);
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
