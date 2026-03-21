"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Task = {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  memory: number;
};

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      // Allow browser cache + server cache to reduce server load
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        throw new Error("Unable to fetch tasks");
      }
      const data = (await res.json()) as Task[];
      setTasks(data);
      setError(null);
    } catch {
      setError("Could not load running tasks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
    const timer = setInterval(() => {
      void fetchTasks();
    }, 5000); // Refresh every 5 seconds (matches server cache)

    return () => clearInterval(timer);
  }, [fetchTasks]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-4 text-sm text-muted-foreground">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-in-up">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Running Tasks
          <span className="text-xs font-normal text-muted-foreground">Top {tasks.length} by Memory</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks found</p>
        ) : (
          <div className="space-y-2">
            <div className="hidden md:grid grid-cols-12 gap-2 mb-2 pb-2 border-b text-xs text-muted-foreground font-semibold">
              <div className="col-span-1">PID</div>
              <div className="col-span-5">Process Name</div>
              <div className="col-span-2">User</div>
              <div className="col-span-2">CPU %</div>
              <div className="col-span-2">Memory %</div>
            </div>

            {tasks.map((task, idx) => (
              <div
                key={`${task.pid}-${idx}`}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-all duration-300 hover:bg-muted/50 text-xs sm:text-sm animate-fade-in-scale"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="col-span-3 sm:col-span-1 text-muted-foreground">{task.pid}</div>
                <div className="col-span-6 sm:col-span-5 truncate font-medium text-foreground">{task.name}</div>
                <div className="col-span-3 sm:col-span-2 text-muted-foreground">{task.user}</div>
                <div className="col-span-3 sm:col-span-2 text-center">
                  <span className={task.cpu > 50 ? "text-destructive font-medium" : "text-foreground"}>
                    {task.cpu.toFixed(1)}%
                  </span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-center">
                  <span className={task.memory > 10 ? "text-destructive font-medium" : "text-foreground"}>
                    {task.memory.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
