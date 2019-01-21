"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var glob = require("glob");
var path = require("path");
var fs = require("fs");
var request = require("request-promise-native");
var Entry = /** @class */ (function () {
    function Entry(data) {
        Object.assign(this, data);
    }
    Entry.prototype.loadContent = function (encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        if (this.path && fs.existsSync(this.path)) {
            this.content = fs.readFileSync(this.path, encoding);
            return this.content;
        }
    };
    return Entry;
}());
exports.Entry = Entry;
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
function globSources(src, config, base) {
    if (base === void 0) { base = ''; }
    if (src.indexOf('http') === 0) {
        return [request(src, { encoding: null }).then(function (content) { return new Entry({ content: content }); })];
    }
    else {
        return glob.sync(src, __assign({}, config, { nodir: true, cwd: base })).map(function (src) { return new Entry({ src: src, path: path.join(base, src) }); });
    }
}
function getEntries(input, task) {
    if (task === void 0) { task = {}; }
    if (typeof input === 'string') {
        return globSources(input, {}, task.base);
    }
    else if (input instanceof Array) {
        return input.reduce(function (res, input) { return res.concat(getEntries(input, task)); }, []);
    }
    else {
        var base_1 = input.base || task.base || '';
        var src = input.src instanceof Array ? input.src : [input.src];
        var ignore_1 = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
        return src.reduce(function (res, src) { return res.concat(globSources(src, { ignore: ignore_1 }, base_1)); }, []);
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
function resolver(promises, parallel) {
    if (parallel) {
        return Promise.all(promises.map(function (f) { return f(); }));
    }
    else {
        return promises.reduce(function (current, next) { return current.then(next); }, Promise.resolve());
    }
}
exports.resolver = resolver;
function resolveTasks(tasks, runner, name, parallel) {
    if (parallel === void 0) { parallel = false; }
    if (tasks) {
        return resolver(Object.keys(tasks).map(function (name) { return function () { return evaluateTask(tasks[name], runner, name); }; }), parallel);
    }
    else {
        return Promise.resolve();
    }
}
function logEntries(entries, runner, name) {
    name = name || "task" + Object.keys(runner.tasks).length;
    runner.tasks[name] = entries;
}
function processEntries(entries, task, runner) {
    if (task.output) {
        var res = task.output(entries, runner);
        if (typeof res === 'undefined') {
            return entries;
        }
        else {
            return res;
        }
    }
    else {
        return entries;
    }
}
function filterEntries(entries, input, task, runner) {
    if (typeof input === 'string') {
        return Promise.all(entries);
    }
    return Promise.all(entries).then(function (entries) { return Promise.all(entries.map(function (entry) {
        var filter = input.filter || task.filter;
        if (filter) {
            var res = filter(entry, runner);
            if (typeof res === 'undefined') {
                return entry;
            }
            else {
                return res;
            }
        }
        else {
            return entry;
        }
    }).filter(function (v) { return v; })); });
}
function evaluateEntries(entries, task, runner, name) {
    return Promise.all(entries).then(function (entries) { return processEntries(entries, task, runner); }).then(function (entries) {
        logEntries(entries, runner, name);
        return entries;
    });
}
function evaluateTask(task, runner, name) {
    if (runner === void 0) { runner = new Runner; }
    if (task instanceof Array) {
        return evaluateEntries(task, task, runner, name);
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
