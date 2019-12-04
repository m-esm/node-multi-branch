import { MultiBranch } from ".";
import wrapLogs from "./utils/wrap-logs";

wrapLogs();

MultiBranch.bootstrap()
  .then(() => {
    console.info("Multi branch started !");
  })
  .catch(e => {
    console.error("Error in MultiBranch bootstrap process !", e);
  });
