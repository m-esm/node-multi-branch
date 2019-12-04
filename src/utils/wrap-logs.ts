import * as chalk from "chalk";
export default function wrapLogs() {
  const LogSavingLimit = 1000;

  const colors = { log: "green", warn: "orange", error: "red", info: "cyan" };
  for (const type of ["log", "warn", "error", "info"]) {
    console["_" + type] = (console as any)[type];
    console[type] = (...params: any[]) => {
      const msg = `[${type.toUpperCase()}] ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      logHistory.unshift(
        msg +
          " | " +
          params
            .map(p => {
              if (typeof p !== "string") p = JSON.stringify(p, null, 2);
              return p;
            })
            .join(" ")
      );
      if (logHistory.length === LogSavingLimit) logHistory.pop();

      (console as any)["_" + type](chalk[colors[type]](msg), ...params);
    };
  }
}
export const logHistory = [];
