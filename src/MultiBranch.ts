import * as processes from "child_process";
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
import { UI } from "./UI";
import * as redbird from "redbird";
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
  static proxy: any;
  static ready: boolean;
  static lastUsedPort: number;
  static async bootstrap(config: MultiBranchConfigInterface) {
    config = {
      ...{
        reserveStartDelay: 3000,
        port: parseInt(process.env["PORT"]) || 3000,
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
    reserve: boolean = false,
    wasExited: boolean = false
  ) {
    if (reserve && MultiBranch.instances[branch + "|RESERVE"]) {
      return;
    }
    MultiBranch.lastUsedPort++;

    const port = MultiBranch.lastUsedPort;

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
      process: processes.exec("pwd && npm start", {
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

    if (!reserve) {
      setTimeout(() => {
        // start  reserve instance
        this.runInstance(branch, true);
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
          this.runInstance(originalBranchName, reserve, true);
        }, this.config.restartWait);
        MultiBranch.instances[branch] = null;
      });
    }
  }
  async setupProxy() {
    console.info(
      `MultiBranch PROXY is available at http://0.0.0.0:${this.config.port} `
    );
    MultiBranch.proxy = new redbird({
      port: this.config.port,
      resolvers: [
        (host: string, url: string, req) => {
          if (url.startsWith("/multi-branch")) {
            req.url = req.url.replace("/multi-branch", "/");
            return `http://localhost:${this.config.interfacePort}`;
          }

          if (!MultiBranch.ready)
            return `http://localhost:${this.config.interfacePort}/logs`;

          const branch: string =
            req.headers.branch || this.config.defaultBranch;

          if (branch.startsWith("http://") || branch.startsWith("https://")) {
            return branch;
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

            if (!instance)
              return `http://localhost:${
                this.config.interfacePort
              }/instance-not-found/${encodeURIComponent(branch)}`;
            return `http://localhost:${instance.port}`;
          }
        }
      ]
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
