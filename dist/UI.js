"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require("express");
var _ = require("lodash");
var MultiBranch_1 = require("./MultiBranch");
var process_monitor_1 = require("./utils/process-monitor");
var wrap_logs_1 = require("./utils/wrap-logs");
var UI = /** @class */ (function () {
    function UI() {
    }
    UI.bootstrap = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.server = express();
                        this.server.get("/stats", function (req, res) {
                            res.json(process_monitor_1.monitoringHistory);
                        });
                        this.server.get("/instance-not-found/:branch", function (req, res) {
                            res.writeHead(404, "branch not found");
                            res.end("\n      <!DOCTYPE html>\n      <html lang=\"en\">\n      <head>\n          <meta charset=\"UTF-8\">\n          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n          <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n          <title>Branch not found</title>\n          <style>\n          body{\n              font-family: monospace;\n              color:#fff;\n              background: #111;\n              padding:15px;\n              font-size: 17px;\n          }\n          </style>\n      </head>\n      <body>\n          Branch \"" + req.params.branch + "\" not found !\n      </body>\n      </html>\n      ");
                        });
                        this.server.get("/logs", function (req, res) {
                            res.end("\n      <!DOCTYPE html>\n      <html lang=\"en\">\n      <head>\n          <meta charset=\"UTF-8\">\n          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n          <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n          <title> " + (!MultiBranch_1.MultiBranch.ready
                                ? "Multi-Branch is loading ..."
                                : "Multi branch logs") + "</title>\n          <style>\n          body{\n              font-family: monospace;\n              color:#fff;\n              background: #111;\n              padding:10px 15px;\n              font-size: 11px;\n          }\n          button{\n            padding:4px 10px;\n            background: #333;\n            color:#ccc;\n            border:none;\n          }\n          </style>\n      </head>\n      <body>\n        " + (!MultiBranch_1.MultiBranch.ready ? "<h1>Multi-Branch is loading ... </h1>" : "") + "\n        <button onclick=\"localStorage.refresh = !(localStorage.refresh == 'true' ? true : false);location.reload()\" id=\"toggleRefresh\"></button> \n        <button onclick=\"localStorage.refreshInterval = 500\">interval: 500ms</button> \n        <button onclick=\"localStorage.refreshInterval = 1000\">interval: 1s</button> \n        <button onclick=\"localStorage.refreshInterval = 3000\">interval: 3s</button> \n        <button onclick=\"localStorage.refreshInterval = 10000\">interval: 10s</button> \n        <pre>\n" + wrap_logs_1.logHistory.join("\n") + "\n        </pre>\n\n        <script>\n          if(localStorage.refresh == 'true'){\n            document.querySelector('#toggleRefresh').innerText = 'Stop auto refresh';\n            setTimeout(()=>{\n              location.reload();\n             },parseInt(localStorage.refreshInterval) || 1000)\n          }\n          else\n           document.querySelector('#toggleRefresh').innerText = 'Start auto refresh';\n\n          \n\n        </script>\n      </body>\n      </html>\n      ");
                        });
                        this.server.get("/", function (req, res) {
                            res.json({
                                NODE_ENV: process.env["NODE_ENV"],
                                BRANCH: process.env["BRANCH"],
                                processes: Object.values(MultiBranch_1.MultiBranch.instances).map(function (p) {
                                    p = _.pick(p, "port", "branch", "process.pid");
                                    if (p.process && p.process.pid) {
                                        var stat = _.sortBy(process_monitor_1.monitoringHistory.filter(function (d) { return d && d.pid == p.process.pid; }), function (d) { return d.date * -1; })[0] || {};
                                        p.process.stats = __assign({ date: stat.date }, stat.result);
                                    }
                                    return p;
                                })
                            });
                        });
                        return [4 /*yield*/, UI.setupMonitoring()];
                    case 1:
                        _a.sent();
                        this.server.listen(config.interfacePort, "0.0.0.0", function () {
                            console.info("MultiBranch UI is available at http://0.0.0.0:" + config.interfacePort + " ");
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    UI.setupMonitoring = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.pids = Object.values(MultiBranch_1.MultiBranch.instances).map(function (p) { return p.process.pid; });
                if (this.pids.length)
                    console.info("Monitoring PID's:", this.pids.join(" , "));
                if (this.pids.length != 0) {
                    process_monitor_1.monitor({
                        pid: this.pids,
                        interval: 1000
                    });
                }
                setTimeout(function () {
                    _this.setupMonitoring();
                }, 10000);
                return [2 /*return*/];
            });
        });
    };
    return UI;
}());
exports.UI = UI;
//# sourceMappingURL=UI.js.map