#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var _1 = require(".");
var wrap_logs_1 = require("./utils/wrap-logs");
wrap_logs_1["default"]();
if (process.env["NODE_ENV"] === "staging") {
    _1.MultiBranch.bootstrap({
        portENV: "PORT"
    })
        .then(function () { })["catch"](function (e) {
        console.error("Error in MultiBranch bootstrap process !", e);
    });
}
else
    process.exit();
//# sourceMappingURL=bin.js.map