import * as express from "express";
import * as _ from "lodash";
import { MultiBranchConfigInterface, MultiBranch } from "./MultiBranch";
import { monitor, monitoringHistory } from "./utils/process-monitor";
export class UI {
  static server: express.Application;
  static async bootstrap(config: MultiBranchConfigInterface) {
    this.server = express();

    this.server.get("/stats", (req, res) => {
      res.json(monitoringHistory);
    });

    this.server.get("/", (req, res) => {
      res.json({
        NODE_ENV: process.env["NODE_ENV"],
        BRANCH: process.env["BRANCH"],
        processes: Object.values(MultiBranch.instances).map((p: any) => {
          p = _.pick(p, "port", "branch", "process.pid");
          if (p.process && p.process.pid) {
            const stat = _.sortBy(
              monitoringHistory.filter(d => d && d.pid == p.process.pid),
              d => d.date * -1
            )[0];
            p.process.stats = { ...{ date: stat.date }, ...stat.result };
          }
          return p;
        })
      });
    });

    await UI.setupMonitoring();
    this.server.listen(config.interfacePort, "0.0.0.0", () => {
      console.info(
        `MultiBranch UI is available at http://0.0.0.0:${config.interfacePort} `
      );
    });
  }

  static async setupMonitoring() {
    const pids = Object.values(MultiBranch.instances).map(p => p.process.pid);

    console.info("setupMonitoring PID:", pids.join(" , "));
    if (pids.length == 0) {
      setTimeout(() => {
        this.setupMonitoring();
      }, 1000);
      return;
    } else {
      monitor({
        pid: pids,
        interval: 1000
      });
    }
  }
}
