import * as express from "express";
import { MultiBranchConfigInterface } from "./MultiBranch";
export class UI {
  static server: express.Application;
  static async bootstrap(config: MultiBranchConfigInterface) {
    this.server = express();

    this.server.get("/", (req, res) => {
      res.end(process.env["BRANCH"]);
    });
    this.server.listen(config.interfacePort, "0.0.0.0", () => {
      console.info(
        `MultiBranch UI is available at http://0.0.0.0:${config.interfacePort} `
      );
    });
  }
}
