import * as processes from "child_process";
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
export class MultiBranch {
  static object: MultiBranch;
  package: any;
  instances: { [key: string]: processes.ChildProcess } = {};
  static async bootstrap(
    config: MultiBranchConfigInterface = {
      repoDir: process.cwd(),
      portENV: "PORT",
      instancesPortStart: 7000,
      interfacePort: 6000
    }
  ) {
      
    console.log(process.env["RUNNED_BY_MULTIBRANCH"]);
    if (process.env["RUNNED_BY_MULTIBRANCH"]) {
      console.info("Bootstrap canceled. started from MultiBranch");
      return;
    }

    this.object = new MultiBranch(config);
  }

  constructor(public config: MultiBranchConfigInterface) {
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

    this.package = fs.readJSONSync(
      path.join(this.config.repoDir, "package.json")
    );

    this.instances = {};

    const branches = processes
      .execSync("git branch", {
        cwd: this.config.repoDir
      })
      .toString()
      .split("\n")
      .map(p => _.trim(p, "* "))
      .filter(p => p);

    for (const branch of branches) {
      const branchDir = path.join(
        this.config.repoDir,
        "..",
        `${this.package.name.replace(/ /g, "_")}-${branch
          .replace(/\//g, "_")
          .replace(/ /g, "_")}`
      );

      fs.ensureDirSync(branchDir);

      fs.emptyDirSync(branchDir);

      fs.copySync(this.config.repoDir, branchDir);

      processes.execSync(`git reset HEAD --hard && git checkout ${branch}`, {
        cwd: branchDir,
        stdio: "inherit"
      });

      this.instances[branch] = processes.exec("pwd && npm start", {
        cwd: branchDir,
        env: {
          ...(process.env as any),
          ...{
            RUNNED_BY_MULTIBRANCH: true
          }
        }
      });

      this.instances[branch].stdout.on("data", chunk => {
        console.log(chunk.toString());
      });

      this.instances[branch].stderr.on("data", chunk => {
        console.warn(chunk.toString());
      });
    }
  }
}

export interface MultiBranchConfigInterface {
  repoDir: string;
  portENV: string;

  instancesPortStart: number;

  interfacePort: number;
}
