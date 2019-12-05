import * as usage from "pidusage";

export interface ProcMonConfig {
  pid: number[];
  technique?: "proc" | "ps";
  format?: string;
  interval?: number;
}

/*
 process-monitor API
-------------------------------------------------------------------------- */

/**
 * Process-monitor API definition.
 * @param  {object}   config Configuration options.
 * @return {ProcMon}  Chainable instance of ProcMon.
 */

let monitoringTimeout;
export async function monitor(config: ProcMonConfig) {
  if (monitoringTimeout) clearTimeout(monitoringTimeout);
  const lookups = await Promise.all(
    config.pid.map(pid => {
      return new Promise(resolve => {
        usage(pid, (err, result) =>
          resolve({ pid, result, date: new Date() })
        );
      });
    })
  );

  lookups.forEach(p => {
    if (monitoringHistory.length > 100) monitoringHistory.shift();

    monitoringHistory.push(p);
  });

  monitoringTimeout = setTimeout(() => {
    monitor(config);
  }, config.interval);
}

export const monitoringHistory = [];
