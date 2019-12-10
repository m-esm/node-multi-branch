import * as processes from "child_process";
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
import { UI } from "./UI";
import * as Proxy from "http-proxy";
import * as http from "http";

process.on("uncaughtException", error => {
  console.error("uncaughtException", error);
});

process.on("unhandledRejection", error => {
  console.error("unhandledRejection", error);
});
export class MultiBranch {
  static object: MultiBranch;
  package: any;
  static instances: {
    [key: string]: {
      branch: string;
      started: Date;
      port: number;
      process: processes.ChildProcess;
    };
  } = {};
  static ready: boolean;
  static lastUsedPort: number;
  static proxy: Proxy;
  static async bootstrap(config: MultiBranchConfigInterface) {
    config = {
      ...{
        reserveStartDelay: 3000,
        port:
          parseInt(process.env["PORT"]) ||
          parseInt(process.env["HTTP_PORT"]) ||
          parseInt(process.env["HTTP_SERVER_PORT"]) ||
          3000,
        repoDir: process.cwd(),
        portENV: "PORT",
        defaultBranch: "master",
        restartWait: 100,
        instancesPortStart: 7000,
        interfacePort: parseInt(process.env["MULTIBRANCH_UI_PORT"]) || 8000
      },
      ..._.pickBy(config, value => {
        return value;
      })
    };

    if (process.env["RUNNED_BY_MULTIBRANCH"]) {
      console.info("Bootstrap canceled. started from MultiBranch");
      return;
    }

    new MultiBranch(config);

    process.on("exit", code => {
      console.warn(
        `Process is exiting with code ${code} ! closing processes ...`
      );
      Object.values(MultiBranch.instances)
        .filter(p => p && p.process)
        .forEach(instance => {
          console.warn(`Closing instance: ${instance.branch}`);
          instance.process.kill("SIGKILL");
        });
    });
  }

  constructor(public config: MultiBranchConfigInterface) {
    this.setupProxy()
      .then(() => {})
      .catch(e => {
        console.error("MultiBranch setupProxy failed !", e);
      });
    this.initRetry()
      .then(() => {})
      .catch(e => {
        console.error("MultiBranch initRetry failed !", e);
      });
  }

  async initRetry() {
    this.init()
      .then(() => {
        console.info("MultiBranch initialized !");
      })
      .catch(e => {
        console.error(
          `MultiBranch initialization failed ! trying again in 5 seconds ...`,
          e
        );

        setTimeout(async () => {
          try {
            await this.initRetry();
          } catch (e) {}
        }, 5000);
      });
  }

  async init() {
    console.info("MultiBranch initalizing config", this.config);

    await UI.bootstrap(this.config);

    this.package = fs.readJSONSync(
      path.join(this.config.repoDir, "package.json")
    );

    const branches =
      this.config.branches ||
      processes
        .execSync("git branch", {
          cwd: this.config.repoDir,
          stdio: "pipe"
        })
        .toString()
        .split("\n")
        .map(p => _.trim(p, "* "))
        .filter(p => p);

    MultiBranch.lastUsedPort = this.config.instancesPortStart;

    const promises = branches.map(branch => async () => {
      return this.runInstance(branch);
    });

    await Promise.all(promises.map(p => p()));

    MultiBranch.ready = true;
  }

  async runInstance(
    branch: string,
    port?: number,
    reserve: boolean = false,
    wasExited: boolean = false
  ) {
    if (reserve && MultiBranch.instances[branch + "|RESERVE"]) {
      return;
    }

    if (!wasExited && !port) MultiBranch.lastUsedPort += 1;

    if (!port) port = MultiBranch.lastUsedPort;

    console.info("Run instance", { branch, reserve, wasExited, port });

    try {
      const lsof =
        processes
          .execSync("lsof -i:" + port)
          .toString()
          .split("\n")[1] || "";

      console.log("lsof", lsof);

      const pid = lsof.split(" ").filter(p => p)[1];

      console.log(pid);
      if (pid) processes.execSync(`kill ${pid} -9`);
    } catch (e) {
      if (!e) e = { message: "unknown error" };
      console.warn(e.message || e);
    }

    const branchDir = path.join(
      this.config.repoDir,
      "..",
      `${this.package.name.replace(/ /g, "_")}-${branch
        .replace(/\//g, "_")
        .replace(/ /g, "_")}`
    );

    if (!reserve && !wasExited) {
      await fs.ensureDir(branchDir);
      await fs.emptyDir(branchDir);
      console.info(`Copying repository to create "${branch}" branch folder`);
      await fs.copy(this.config.repoDir, branchDir);

      processes.execSync(`git reset HEAD --hard && git checkout ${branch}`, {
        cwd: branchDir,
        stdio: "ignore"
      });
    }

    const customPortEnvObj = {};

    customPortEnvObj[this.config.portENV] = port;

    MultiBranch.instances[branch + (reserve ? "|RESERVE" : "")] = {
      process: processes.exec("npm start", {
        cwd: branchDir,
        env: {
          ...(process.env as any),
          ...customPortEnvObj,
          ...{
            RUNNED_BY_MULTIBRANCH: true,
            BRANCH: branch
          }
        }
      }),
      branch,
      started: new Date(),
      port: port
    };

    if (!reserve && !wasExited) {
      setTimeout(() => {
        // start  reserve instance
        this.runInstance(branch, null, true, false);
      }, this.config.reserveStartDelay);
    }

    const originalBranchName = branch;
    branch = branch + (reserve ? "|RESERVE" : "");

    const instanceProcess = (MultiBranch.instances[branch] || {}).process;

    if (instanceProcess) {
      instanceProcess.stdout.on("data", chunk => {
        //console.log(`[${branch}]\n`, (chunk || "").toString());
        process.stdout.write(chunk);
      });

      instanceProcess.stderr.on("data", chunk => {
        // console.warn(`[${branch}]\n`, (chunk || "").toString());
        process.stderr.write(chunk);
      });
      instanceProcess.on("exit", code => {
        console.warn(
          `process of "${branch}" branch exited(code:${code}) ! starting again in ${this.config.restartWait} ms ...`
        );
        setTimeout(() => {
          this.runInstance(originalBranchName, port, reserve, true);
        }, this.config.restartWait);
        MultiBranch.instances[branch] = null;
      });
    }
  }
  async setupProxy() {
    const proxy = Proxy.createProxyServer({
      xfwd: true
    });

    (proxy as any).on("upgrade", (req, socket, head) => {
      try {
        proxy.ws(req, socket, head);
      } catch (e) {
        console.warn(e);
      }
    });

    var server = http.createServer(async (req, res) => {
      (async () => {
        // You can define here your custom logic to handle the request
        // and then proxy the request.
        const url = req.url;

        if (url.startsWith("/multi-branch")) {
          req.url = req.url.replace("/multi-branch", "/");
          return proxy.web(req, res, {
            target: `http://localhost:${this.config.interfacePort}`
          });
        }
        if (!MultiBranch.ready)
          return proxy.web(req, res, {
            target: `http://localhost:${this.config.interfacePort}/logs`
          });
        const branch: string =
          (req.headers["branch"] as any) || this.config.defaultBranch;
        if (branch.startsWith("http://") || branch.startsWith("https://")) {
          return proxy.web(req, res, { target: branch });
        } else {
          let instance = null;
          if (
            MultiBranch.instances[branch] &&
            MultiBranch.instances[branch].process
          )
            instance = MultiBranch.instances[branch];
          else if (
            MultiBranch.instances[branch + "|RESERVE"] &&
            MultiBranch.instances[branch + "|RESERVE"].process
          )
            instance = MultiBranch.instances[branch + "|RESERVE"];
          let target = "";
          if (!instance)
            target = `http://localhost:${
              this.config.interfacePort
            }/instance-not-found/${encodeURIComponent(branch)}`;
          target = `http://localhost:${instance.port}`;
          return proxy.web(req, res, { target });
        }
      })()
        .then(() => {})
        .catch(console.error);
    });

    server.listen(this.config.port, "0.0.0.0", () => {
      console.info(
        `MultiBranch PROXY is available at http://0.0.0.0:${this.config.port} `
      );
    });
  }
}

export interface MultiBranchConfigInterface {
  branches?: string[];
  reserveStartDelay?: number;
  port?: number;
  repoDir?: string;
  portENV?: string;

  restartWait?: number;
  defaultBranch?: string;

  instancesPortStart?: number;

  interfacePort?: number;
}
