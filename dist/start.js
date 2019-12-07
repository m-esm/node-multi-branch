"use strict";
exports.__esModule = true;
var _1 = require(".");
var wrap_logs_1 = require("./utils/wrap-logs");
var path_1 = require("path");
wrap_logs_1["default"]();
_1.MultiBranch.bootstrap({
    portENV: "PORT" || "MULTIBRANCH_UI_PORT",
    repoDir: path_1.join(process.cwd(), "..", "example")
})
    .then(function () { })["catch"](function (e) {
    console.error("Error in MultiBranch bootstrap process !", e);
});
//# sourceMappingURL=start.js.map