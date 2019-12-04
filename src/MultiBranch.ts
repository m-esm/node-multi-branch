import * as processes from "child_process";
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
export class MultiBranch {
  static instance: MultiBranch;
  package: any;
  static async bootstrap(
    config: MultiBranchConfigInterface = {
      repoDir: process.cwd(),
      portENV: "PORT",
      instancesPortStart: 7000,
      interfacePort: 6000
    }
  ) {
    this.instance = new MultiBranch(config);
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

      processes.execSync(`git checkout ${branch}`, {
        cwd: branchDir
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
