"use strict";
exports.__esModule = true;
var _1 = require(".");
var wrap_logs_1 = require("./utils/wrap-logs");
wrap_logs_1["default"]();
_1.MultiBranch.bootstrap()
    .then(function () {
    console.info("Multi branch started !");
})["catch"](function (e) {
    console.error("Error in MultiBranch bootstrap process !", e);
});
//# sourceMappingURL=start.js.map