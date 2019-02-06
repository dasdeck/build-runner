"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var minimist = require("minimist");
var index_1 = require("./index");
function runCli(config, args) {
    if (args === void 0) { args = process.argv.slice(2); }
    var a = minimist(args);
    if (a._) {
        a._taskFilter = a._;
        delete a._;
    }
    return index_1.run(config, a);
}
exports.default = runCli;
