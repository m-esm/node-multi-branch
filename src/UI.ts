import * as express from "express";
import * as _ from "lodash";
import { MultiBranchConfigInterface, MultiBranch } from "./MultiBranch";
export class UI {
  static server: express.Application;
  static async bootstrap(config: MultiBranchConfigInterface) {
    this.server = express();

    this.server.get("/", (req, res) => {
      res.json({
        NODE_ENV: process.env["NODE_ENV"],
        BRANCH: process.env["BRANCH"],
        processes: _.pick(
          Object.values(MultiBranch.instances),
          "port",
          "branch"
        )
      });
    });
    this.server.listen(config.interfacePort, "0.0.0.0", () => {
      console.info(
        `MultiBranch UI is available at http://0.0.0.0:${config.interfacePort} `
      );
    });
  }
}
