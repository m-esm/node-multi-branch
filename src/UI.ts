import * as express from "express";
import * as _ from "lodash";
import { MultiBranchConfigInterface, MultiBranch } from "./MultiBranch";
import { monitor, monitoringHistory } from "./utils/process-monitor";
import { logHistory } from "./utils/wrap-logs";
export class UI {
  static server: express.Application;
  static pids: number[];
  static async bootstrap(config: MultiBranchConfigInterface) {
    this.server = express();

    this.server.get("/stats", (req, res) => {
      res.json(monitoringHistory);
    });

    this.server.get("/instance-not-found/:branch", (req, res) => {
      res.writeHead(404, "branch not found");
      res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Branch not found</title>
          <style>
          body{
              font-family: monospace;
              color:#fff;
              background: #111;
              padding:15px;
              font-size: 17px;
          }
          </style>
      </head>
      <body>
          Branch "${req.params.branch}" not found !
      </body>
      </html>
      `);
    });

    this.server.get("/logs", (req, res) => {
      res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title> ${
            !MultiBranch.ready
              ? `Multi-Branch is loading ...`
              : "Multi branch logs"
          }</title>
          <style>
          body{
              font-family: monospace;
              color:#fff;
              background: #111;
              padding:10px 15px;
              font-size: 11px;
          }
          button{
            padding:4px 10px;
            background: #333;
            color:#ccc;
            border:none;
          }
          </style>
      </head>
      <body>
        ${!MultiBranch.ready ? `<h1>Multi-Branch is loading ... </h1>` : ""}
        <button onclick="localStorage.refresh = !(localStorage.refresh == 'true' ? true : false);location.reload()" id="toggleRefresh"></button> 
        <button onclick="localStorage.refreshInterval = 500">interval: 500ms</button> 
        <button onclick="localStorage.refreshInterval = 1000">interval: 1s</button> 
        <button onclick="localStorage.refreshInterval = 3000">interval: 3s</button> 
        <button onclick="localStorage.refreshInterval = 10000">interval: 10s</button> 
        <pre>
${logHistory.join("\n")}
        </pre>

        <script>
          if(localStorage.refresh == 'true'){
            document.querySelector('#toggleRefresh').innerText = 'Stop auto refresh';
            setTimeout(()=>{
              location.reload();
             },parseInt(localStorage.refreshInterval) || 1000)
          }
          else
           document.querySelector('#toggleRefresh').innerText = 'Start auto refresh';

          

        </script>
      </body>
      </html>
      `);
    });

    this.server.get("/", (req, res) => {
      res.json({
        NODE_ENV: process.env["NODE_ENV"],
        BRANCH: process.env["BRANCH"],
        processes: Object.values(MultiBranch.instances).map((p: any) => {
          p = _.pick(p, "port", "branch", "process.pid");
          if (p.process && p.process.pid) {
            const stat =
              _.sortBy(
                monitoringHistory.filter(d => d && d.pid == p.process.pid),
                d => d.date * -1
              )[0] || {};
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
    this.pids = Object.values(MultiBranch.instances).map(p => p.process.pid);

    if (this.pids.length)
      console.info("Monitoring PID's:", this.pids.join(" , "));
    if (this.pids.length != 0) {
      monitor({
        pid: this.pids,
        interval: 1000
      });
    }

    setTimeout(() => {
      this.setupMonitoring();
    }, 10000);
  }
}
