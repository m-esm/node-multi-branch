"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var chalk = require("chalk");
function wrapLogs() {
    var LogSavingLimit = 1000;
    var colors = { log: "green", warn: "orange", error: "red", info: "cyan" };
    var _loop_1 = function (type) {
        console["_" + type] = console[type];
        console[type] = function () {
            var _a;
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            var msg = "[" + type.toUpperCase() + "] " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
            exports.logHistory.unshift(msg +
                " | " +
                params
                    .map(function (p) {
                    if (typeof p !== "string")
                        p = JSON.stringify(p, null, 2);
                    return p;
                })
                    .join(" "));
            if (exports.logHistory.length === LogSavingLimit)
                exports.logHistory.pop();
            (_a = console)["_" + type].apply(_a, __spreadArrays([chalk[colors[type]](msg)], params));
        };
    };
    for (var _i = 0, _a = ["log", "warn", "error", "info"]; _i < _a.length; _i++) {
        var type = _a[_i];
        _loop_1(type);
    }
}
exports["default"] = wrapLogs;
exports.logHistory = [];
//# sourceMappingURL=wrap-logs.js.map