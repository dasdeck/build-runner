"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var minimist = require("minimist");
var index_1 = require("./index");
var path = require("path");
var fs = require("fs");
function runCli(args, config) {
    if (args === void 0) { args = process.argv.slice(2); }
    var a = minimist(args);
    var inputFile = '';
    if (a._) {
        var possibleInputFile_1 = a._[0];
        if (!path.isAbsolute(possibleInputFile_1)) {
            possibleInputFile_1 = path.join(process.cwd(), possibleInputFile_1);
        }
        if (['', '.js', '.ts'].some(function (extension) { return fs.existsSync(possibleInputFile_1 + extension); })) {
            inputFile = possibleInputFile_1;
        }
    }
    if (!inputFile) {
        inputFile = path.join(process.cwd(), 'config.build.js');
    }
    return Promise.resolve().then(function () { return require(inputFile); }).then(function (config) {
        a._.shift();
        a._inputFile = inputFile;
        return config;
    }).catch(function () { return config; }).then(function (config) {
        a._taskFilter = a._;
        delete a._;
        if (config) {
            return index_1.run(config, a);
        }
        else {
            throw 'no config found';
        }
    });
}
exports.default = runCli;
