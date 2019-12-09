import { MultiBranch } from ".";
import wrapLogs from "./utils/wrap-logs";
import { join } from "path";

wrapLogs();

MultiBranch.bootstrap({
  portENV: "PORT" || "MULTIBRANCH_UI_PORT",
  repoDir: join(process.cwd(), "..", "example"),
  restartWait: 1000,
  reserveStartDelay: 1000
})
  .then(() => {})
  .catch(e => {
    console.error("Error in MultiBranch bootstrap process !", e);
  });
