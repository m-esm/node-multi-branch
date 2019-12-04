import * as processes from "child_process";
import * as _ from "lodash";
import * as path from "path";
import * as fs from "fs-extra";
import { UI } from "./UI";
export class MultiBranch {
  static object: MultiBranch;
  package: any;
  instances: { [key: string]: processes.ChildProcess } = {};
  static async bootstrap(config: MultiBranchConfigInterface) {
    config = {
      ...{
        repoDir: process.cwd(),
        portENV: "PORT",
        instancesPortStart: 7000,
        interfacePort: parseInt(process.env["MULTIBRANCH_UI_PORT"]) || 6000
      },
      ...config
    };

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

    await UI.bootstrap(this.config);
  }
}

export interface MultiBranchConfigInterface {
  repoDir?: string;
  portENV?: string;

  instancesPortStart?: number;

  interfacePort?: number;
}
