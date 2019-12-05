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
      port: number;
      process: processes.ChildProcess;
    };
  } = {};
  static proxy: any;
  static async bootstrap(config: MultiBranchConfigInterface) {
    config = {
      ...{
        port: parseInt(process.env["PORT"]) || 3000,
        repoDir: process.cwd(),
        portENV: "PORT",
        defaultBranch: "master",
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
      Object.values(MultiBranch.instances).forEach(instance => {
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

    let lastUsedPort = this.config.instancesPortStart;

    const promises = branches.map(branch => async () => {
      const branchDir = path.join(
        this.config.repoDir,
        "..",
        `${this.package.name.replace(/ /g, "_")}-${branch
          .replace(/\//g, "_")
          .replace(/ /g, "_")}`
      );

      await fs.ensureDir(branchDir);

      await fs.emptyDir(branchDir);

      console.info(`Copying repository to create "${branch}" branch folder`);

      await fs.copy(this.config.repoDir, branchDir);

      processes.execSync(`git reset HEAD --hard && git checkout ${branch}`, {
        cwd: branchDir,
        stdio: "ignore"
      });

      const customPortEnvObj = {};

      customPortEnvObj[this.config.portENV] = lastUsedPort;

      MultiBranch.instances[branch] = {
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
        port: lastUsedPort
      };

      MultiBranch.instances[branch].process.stdout.on("data", chunk => {
        console.log(`[${branch}]\n`, (chunk || "").toString());
      });

      MultiBranch.instances[branch].process.stderr.on("data", chunk => {
        console.warn(`[${branch}]\n`, (chunk || "").toString());
      });

      lastUsedPort++;
    });

    await Promise.all(promises.map(p => p()));
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

          const branch = req.headers.branch || this.config.defaultBranch;

          const instance = MultiBranch.instances[branch];
          if (!instance) return;

          return `http://localhost:${MultiBranch.instances[branch].port}`;
        }
      ]
    });
  }
}

export interface MultiBranchConfigInterface {
  branches?: string[];
  port?: number;
  repoDir?: string;
  portENV?: string;

  defaultBranch?: string;

  instancesPortStart?: number;

  interfacePort?: number;
}
