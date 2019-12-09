import * as usage from "usage";

export interface ProcMonConfig {
  pid: number[];
  technique?: "proc" | "ps";
  format?: string;
}

let monitoringTimeout;
export async function monitor(config: ProcMonConfig) {
  const lookups = await Promise.all(
    config.pid.map(pid => {
      return new Promise(resolve => {
        usage.lookup(
          pid,
          {
            keepHistory: true
          },
          (err, result) => resolve({ pid, result, date: new Date(), err })
        );
      });
    })
  );

  lookups.forEach(p => {
    if (monitoringHistory.length > 1000) monitoringHistory.shift();

    monitoringHistory.push(p);
  });
}

export const monitoringHistory = [];
