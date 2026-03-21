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
