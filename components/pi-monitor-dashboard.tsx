"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type SystemInfo = {
  hostname: string;
  platform: string;
  architecture: string;
  timestamp: string;
  cpuTemp: number | null;
  cpuUsage: string[];
  memoryUsage: {
    total: number;
    used: number;
    free: number;
  };
};

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/70 p-3 transition-all duration-300 hover:bg-muted">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function PiMonitorDashboard() {
  const [data, setData] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/system", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Unable to fetch metrics");
      }
      const nextData = (await res.json()) as SystemInfo;
      setData(nextData);
      setError(null);
    } catch {
      setError("Could not load live metrics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const timer = setInterval(() => {
      void fetchData();
    }, 3000);

    return () => clearInterval(timer);
  }, [fetchData]);

  const memoryPercent = useMemo(() => {
    if (!data || data.memoryUsage.total === 0) {
      return 0;
    }
    return (data.memoryUsage.used / data.memoryUsage.total) * 100;
  }, [data]);

  if (isLoading && !data) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <section className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Raspberry Pi Monitor</h1>
            <p className="text-sm text-muted-foreground">Live system metrics from your Pi</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${isRefreshing ? "animate-pulse bg-primary" : "bg-primary"}`} />
            {isRefreshing ? "Refreshing" : "Live"}
          </div>
        </header>

        {error ? (
          <Card className="border-destructive/40">
            <CardContent className="pt-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBadge label="Hostname" value={data?.hostname ?? "-"} />
          <StatBadge label="Platform" value={data?.platform ?? "-"} />
          <StatBadge label="Architecture" value={data?.architecture ?? "-"} />
          <StatBadge
            label="CPU Temp"
            value={data?.cpuTemp != null ? `${data.cpuTemp.toFixed(1)}°C` : "Unavailable"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
            <CardHeader>
              <CardTitle>CPU Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(data?.cpuUsage ?? []).map((usage, index) => (
                <div key={`${index}-${usage}`} className="space-y-1.5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Core {index}</span>
                    <span className="font-medium">{usage}%</span>
                  </div>
                  <Progress value={parseFloat(usage)} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Used</span>
                <span className="font-medium">
                  {data?.memoryUsage.used.toFixed(2) ?? "0.00"} / {data?.memoryUsage.total.toFixed(2) ?? "0.00"} GB
                </span>
              </div>
              <Progress value={memoryPercent} className="h-2" />

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground">
                <div className="rounded-md bg-muted/70 p-2">Used: {data?.memoryUsage.used.toFixed(2) ?? "0.00"} GB</div>
                <div className="rounded-md bg-muted/70 p-2">Free: {data?.memoryUsage.free.toFixed(2) ?? "0.00"} GB</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground">
          Last update: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "-"}
        </p>
      </section>
    </main>
  );
}