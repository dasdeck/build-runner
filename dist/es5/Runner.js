"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob_1 = require("glob");
var path = require("path");
var request = require("request-promise-native");
var util_1 = require("./util");
var Entry_1 = require("./Entry");
var Task_1 = require("./Task");
var Cache_1 = require("./Cache");
var Logger_1 = require("./Logger");
var util_2 = require("util");
var Runner = /** @class */ (function () {
    function Runner(config) {
        if (config === void 0) { config = { home: process.cwd() }; }
        this.entries = {};
        this.tasks = {};
        this.taskTree = {};
        this._config = {};
        this.cache = new Cache_1.default;
        this._config = config;
        this.logger = new Logger_1.default(config.log);
    }
    Runner.prototype.startTask = function (task, resuse) {
        if (resuse === void 0) { resuse = true; }
        if (!resuse && this.tasks[task.name]) {
            this.logger.warn("taskname '" + task.name + "' (" + task.fullName + ") already exists, named access (runner.tasks[" + task.name + "]) will be ambigus");
        }
        this.taskTree[task.fullName] = task;
        this.tasks[task.name] = task;
    };
    Runner.prototype.loadConfig = function (p) {
        if (p[0] === '~') {
            p = p.replace('~', this.config.home || process.cwd());
        }
        return require(p);
    };
    Object.defineProperty(Runner.prototype, "config", {
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    return Runner;
}());
exports.Runner = Runner;
exports.default = Runner;
var extGlob = function (src, input, task) {
    var base = input.base || task.base || '';
    var dest = input.dest || task.dest || '';
    var ignore = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
    return new Promise(function (res) {
        var results = [];
        var glob = new glob_1.Glob(src, { ignore: ignore, nodir: true, cwd: base });
        glob.on('match', function (p) {
            var src = path.join(base, p);
            var entry = new Entry_1.default({ src: src, dest: p });
            if (dest) {
                entry = util_2.isString(dest) ? entry.inDest(dest) : entry.withDest({ dest: dest, base: base });
            }
            results.push(entry);
        })
            .on('end', function () {
            res(results.sort(function (a, b) { return a.src < b.src ? -1 : 1; }));
        });
    });
};
function resolvePath(src, input, task) {
    if (task) {
        var p = void 0;
        if (src.startsWith('http')) {
            p = task.runner.cache.persistSource(src, function () { return request(src, { encoding: null }); }).then(function (cachePath) { return resolvePath(cachePath, input, task); });
        }
        else {
            p = extGlob(src, input, task);
        }
        return p.catch(function (err) {
            throw new Error("Error in task " + task.fullName + ".input : " + err + " \n " + err.stack);
        });
    }
    return Promise.resolve([]);
}
function getEntries(input, task) {
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
function filterInput(input, task, runner) {
    var entries = getEntries(input, task);
    return filterEntries(entries, input, task, runner);
}
function resolveTasks(parent, runner, config) {
    if (parent.tasks) {
        return util_1.resolver(util_1.map(parent.tasks, function (task, name) { return function () { return evaluateTask(task, runner, parent, config, name); }; }), parent.parallel);
    }
    else {
        return Promise.resolve([]);
    }
}
function logEntries(entries, runner, name) {
    name = name || "task" + Object.keys(runner.entries).length;
    runner.entries[name] = entries;
}
function outputEntries(entries, task, runner) {
    return Promise.resolve(entries).then(function (entries) {
        if (task.output) {
            var res = task.output.bind(task)(entries, runner, task);
            if (res === true || typeof res === 'undefined') {
                return entries;
            }
            else if (res) {
                return Promise.resolve(res).then(function (res) { return (res instanceof Array && res.map(function (o) { return Entry_1.default.forceEntry(o); }) || []).filter(function (v) { return v; }); });
            }
            else {
                return [];
            }
        }
        else {
            return entries;
        }
    }).catch(function (err) {
        throw new Error("Error in task " + task.fullName + ".output : " + err + " \n " + err.stack);
    });
}
function filterEntries(entries, input, task, runner) {
    var filter = typeof input !== 'string' && input.filter || task.filter;
    if (filter) {
        return Promise.resolve(entries).then(function (entries) { return Promise.all(entries.map(function (entry) {
            var res = filter.bind(task)(entry, runner);
            if (res === true || typeof res === 'undefined') {
                return entry;
            }
            else if (res) {
                return Promise.resolve(res).then(Entry_1.default.forceEntry);
            }
        })).then(function (res) { return res.filter(function (v) { return v; }); }); }).catch(function (err) {
            throw new Error("Error in task " + task.fullName + ".filter : " + err + " \n " + err.stack);
        });
    }
    else {
        return entries;
    }
}
function evaluateEntries(entries, task, runner) {
    return Promise.all(entries).then(function (entries) { return outputEntries(entries, task, runner); }).then(function (entries) {
        if (entries.find(function (entry) { return entry instanceof Promise; })) {
            throw new Error('entry should be resolved before logging');
        }
        task.entries = entries;
        logEntries(entries, runner, task.name);
        return entries;
    });
}
function evaluateTask(taskl, runner, parent, config, name) {
    if (config === void 0) { config = {}; }
    if (name === void 0) { name = '_root'; }
    if (typeof taskl === 'string') {
        taskl = [taskl];
    }
    if (taskl instanceof Array) {
        var src = taskl[0], conf = taskl[1];
        var task = runner.loadConfig(src);
        if (typeof name !== 'string') {
            name = path.basename(src);
        }
        return evaluateTask(task, runner, parent, Object.assign({}, config, conf), name);
    }
    else if (typeof taskl === 'function') {
        var evaluatedConfig = Object.assign({}, parent && parent.config || {}, config);
        var res = taskl(evaluatedConfig, runner, parent);
        return Promise.resolve(res).then(function (res) { return res && evaluateTask(res, runner, parent, config, name); });
    }
    else if (taskl) {
        var task_1 = taskl instanceof Task_1.default ? taskl : new Task_1.default(runner, taskl, name, parent);
        if (parent) {
            parent.subTasks[task_1.name] = task_1;
        }
        if (task_1.cache && task_1.restoreCache()) {
            return Promise.resolve(task_1.entries);
        }
        task_1.start(runner);
        return resolveTasks(task_1, runner, config).then(function () {
            if (config._taskFilter && !config._taskFilter.some(function (name) { return task_1.matches(name); })) {
                return Promise.resolve([]);
            }
            var inputs = task_1.input instanceof Array ? task_1.input : task_1.input && [task_1.input] || [];
            return Promise.all(inputs.map(function (input) { return filterInput(input, task_1, runner); }))
                .then(function (inputsSets) { return inputsSets.reduce(function (res, set) { return res.concat(set); }, []); })
                .then(function (entries) { return evaluateEntries(entries, task_1, runner); });
        }).then(function () { return task_1.end(); });
    }
    else {
        return Promise.resolve([]);
    }
}
function run(task, config, runner) {
    if (config === void 0) { config = {}; }
    if (runner === void 0) { runner = new Runner(config); }
    return evaluateTask(task, runner, undefined, config).then(function () { return runner; });
}
exports.run = run;
