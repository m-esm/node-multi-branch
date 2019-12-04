import { MultiBranch } from ".";
import wrapLogs from "./utils/wrap-logs";

wrapLogs();

MultiBranch.bootstrap({
  portENV: "MULTIBRANCH_UI_PORT"
})
  .then(() => {})
  .catch(e => {
    console.error("Error in MultiBranch bootstrap process !", e);
  });
