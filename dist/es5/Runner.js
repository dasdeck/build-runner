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
Object.defineProperty(exports, "__esModule", { value: true });
var glob = require("glob");
var path = require("path");
var request = require("request-promise-native");
var util_1 = require("./util");
exports.resolver = util_1.resolver;
var Entry_1 = require("./Entry");
exports.Entry = Entry_1.default;
var Runner = /** @class */ (function () {
    function Runner(task) {
        if (task === void 0) { task = {}; }
        this.tasks = {};
        this.config = task || {};
    }
    Runner.prototype.run = function () {
        return run(this.config, this.config, this);
    };
    return Runner;
}());
exports.Runner = Runner;
exports.default = Runner;
var pathResolvers = [
    function (src, input, task) {
        if (src.indexOf('http') === 0) {
            return [request(src, { encoding: null }).then(function (content) {
                    return { content: content };
                })];
        }
    },
    function (src, input, task) {
        var base = input.base || task.base || '';
        var ignore = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
        return glob.sync(src, { ignore: ignore, nodir: true, cwd: base }).map(function (src) { return ({ src: src, path: path.join(base, src) }); });
    }
];
function resolvePath(src, input, task) {
    var _loop_1 = function (i) {
        var resolver_1 = pathResolvers[i];
        var res = resolver_1(src, input, task);
        if (res) {
            var base_1 = input.base || task.base;
            var dest_1 = input.dest || task.dest;
            return { value: Promise.resolve(res).then(function (res) { return Promise.all(res); }).then(function (res) { return res.map(function (data) { return new Entry_1.default(__assign({ src: src, base: base_1, dest: dest_1 }, data)); }); }) };
        }
    };
    for (var i in pathResolvers) {
        var state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return Promise.resolve([]);
}
function getEntries(input, task) {
    if (task === void 0) { task = {}; }
    if (typeof input === 'string') {
        return resolvePath(input, {}, task);
    }
    else if (input instanceof Array) {
        return Promise.all(input.map(function (input) { return getEntries(input, task); })).then(function (sets) { return sets.reduce(function (res, set) { return res.concat(set); }); });
    }
    else {
        var src = input.src ? (input.src instanceof Array ? input.src : [input.src]) : [];
        return Promise.all(src.map(function (src) { return resolvePath(src, input, task); })).then(function (sets) { return sets.reduce(function (res, set) { return res.concat(set); }); });
    }
}
exports.getEntries = getEntries;
function filterInput(input, task, runner) {
    if (task === void 0) { task = {}; }
    if (runner === void 0) { runner = new Runner; }
    var entries = getEntries(input, task);
    return filterEntries(entries, input, task, runner);
}
exports.filterInput = filterInput;
function resolveTasks(tasks, runner, name, parallel) {
    if (parallel === void 0) { parallel = false; }
    if (tasks) {
        return util_1.resolver(Object.keys(tasks).map(function (name) { return function () { return evaluateTask(tasks[name], runner, name); }; }), parallel);
    }
    else {
        return Promise.resolve([]);
    }
}
function logEntries(entries, runner, name) {
    name = name || "task" + Object.keys(runner.tasks).length;
    runner.tasks[name] = entries;
}
function processEntries(entries, task, runner) {
    if (task.output) {
        var res = task.output(entries, runner, task);
        if (res === true || typeof res === 'undefined') {
            return Promise.resolve(entries);
        }
        else if (res) {
            return Promise.resolve(res).then(function (res) { return res.map(Entry_1.default.forceEntry).filter(function (v) { return v; }); });
        }
        else {
            return Promise.resolve([]);
        }
    }
    else {
        return Promise.resolve(entries);
    }
}
function filterEntries(entries, input, task, runner) {
    var filter = typeof input !== 'string' && input.filter || task.filter;
    if (filter) {
        return Promise.resolve(entries).then(function (entries) { return Promise.all(entries.map(function (entry) {
            var res = filter(entry, runner);
            if (res === true || typeof res === 'undefined') {
                return entry;
            }
            else if (res) {
                return Promise.resolve(res).then(Entry_1.default.forceEntry);
            }
        })).then(function (res) { return res.filter(function (v) { return v; }); }); });
    }
    else {
        return entries;
    }
}
function evaluateEntries(entries, task, runner, name) {
    return Promise.all(entries).then(function (entries) { return processEntries(entries, task, runner); }).then(function (entries) {
        if (entries.find(function (entry) { return entry instanceof Promise; })) {
            throw 'entry should be resolved before logging';
        }
        logEntries(entries, runner, name);
        return entries;
    });
}
function evaluateTask(task, runner, name) {
    if (runner === void 0) { runner = new Runner; }
    if (task instanceof Array) {
        return evaluateEntries(task.map(function (data) { return new Entry_1.default(data); }), {}, runner, name);
    }
    else if (task instanceof Function) {
        return Promise.resolve(task(runner)).then(function (res) { return res && evaluateTask(res, runner, name); });
    }
    return resolveTasks(task.tasks, runner, name, task.parallel).then(function () {
        var inputs = task.input instanceof Array ? task.input : task.input && [task.input] || [];
        return Promise.all(inputs.map(function (input) { return filterInput(input, task, runner); }))
            .then(function (inputsSets) { return inputsSets.reduce(function (res, set) { return res.concat(set); }, []); })
            .then(function (entries) { return evaluateEntries(entries, task, runner, name); });
    });
}
exports.evaluateTask = evaluateTask;
function run(task, config, runner) {
    if (runner === void 0) { runner = new Runner(config || task); }
    return evaluateTask(task, runner, '_root').then(function () { return runner; });
}
exports.run = run;
