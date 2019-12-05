#!/usr/bin/env node
"use strict";
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
var _1 = require(".");
var wrap_logs_1 = require("./utils/wrap-logs");
var argv = require("argv");
var chalk = require("chalk");
var figlet = require("figlet");
var fs = require("fs-extra");
var path = require("path");
figlet.parseFont("isometric2", fs.readFileSync(path.join(__dirname, "..", "isometric2.flf")).toString());
wrap_logs_1["default"]();
var args = argv
    .option([
    {
        name: "port",
        short: "p",
        type: "string"
    },
    {
        name: "dir",
        short: "d",
        type: "string"
    },
    {
        name: "port-env",
        type: "string"
    },
    {
        name: "default-branch",
        type: "string"
    },
    {
        name: "help",
        short: "h",
        type: "boolean"
    },
    {
        name: "branches",
        short: "b",
        type: "string"
    },
    {
        name: "only",
        type: "string",
        short: "o"
    }
])
    .run().options;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (args.help) {
            console.log(chalk.bold("\nArguments:"));
            console.log(chalk.green("\t -p,--port to specify port MultiBranch will listen to"));
            console.log(chalk.green("\t --port-env to specify project port env name"));
            console.log(chalk.green("\t --default-branch to specify default branch for reverse proxy"));
            console.log(chalk.green("\t --only to specify multi branch run env"));
            console.log(chalk.green("\t -b,--branch comma separated branch names to run"));
            console.log(chalk.green("\t -h,--help to view help"));
            return [2 /*return*/];
        }
        if (process.env["NODE_ENV"] === (args.only || "staging")) {
            console.log("\n");
            console.log(chalk.yellow(figlet.textSync("MB", { font: "isometric2" })));
            console.log("\n");
            process.on("exit", function () {
                Object.values(_1.MultiBranch.instances).forEach(function (p) {
                    p.process.kill("SIGKILL");
                    console.warn("Killed " + p.branch);
                });
            });
            _1.MultiBranch.bootstrap({
                portENV: args["port-env"],
                defaultBranch: args["default-branch"],
                port: parseInt(args.port),
                branches: args.branches
                    ? args.branches
                        .trim()
                        .split(",")
                        .filter(function (p) { return p; })
                    : undefined,
                repoDir: args.dir ? path.join(__dirname, args.dir) : undefined
            })
                .then(function () { })["catch"](function (e) {
                console.error("Error in MultiBranch bootstrap process !", e);
            });
        }
        else
            process.exit();
        return [2 /*return*/];
    });
}); })();
//# sourceMappingURL=bin.js.map