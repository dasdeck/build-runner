"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob = require("glob");
var path = require("path");
var request = require("request-promise-native");
var util_1 = require("./util");
var Entry_1 = require("./Entry");
var Task_1 = require("./Task");
var Runner = /** @class */ (function () {
    function Runner(config) {
        if (config === void 0) { config = {}; }
        this.entries = {};
        this.tasks = {};
        this.taskTree = {};
        this._config = {};
        this._config = config;
    }
    Runner.prototype.startTask = function (task) {
        if (this.tasks[task.name]) {
            console.warn("task '" + task.name + "' already exists, named access (runner.tasks[name]) will be overwritten");
        }
        this.taskTree[task.fullName] = task;
        this.tasks[task.name] = task;
        this.log('starting task:', task.name);
    };
    Runner.prototype.endTask = function (task) {
        this.log('ending task:', task.name);
    };
    Object.defineProperty(Runner.prototype, "config", {
        get: function () {
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    Runner.prototype.log = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var logger = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (_this.config.verbose === 3) {
                console.log.apply(console, args);
            }
        };
        if (args.length) {
            logger.apply(void 0, args);
        }
        logger.log = logger;
        if (this.config.verbose === 2) {
            logger.warn = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (_this.config.verbose === 3) {
                    console.log.apply(console, args);
                }
            };
        }
        return logger;
    };
    return Runner;
}());
exports.Runner = Runner;
exports.default = Runner;
var pathResolvers = [
    function (src, input, task) {
        if (src.indexOf('http') === 0) {
            return [request(src, { encoding: null }).then(function (content) {
                    return { content: content, src: src };
                })];
        }
    },
    function (src, input, task) {
        var base = input.base || task.base || '';
        var ignore = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
        return glob.sync(src, { ignore: ignore, nodir: true, cwd: base }).map(function (dest) { return ({ dest: dest, src: path.join(base, dest) }); });
    }
];
function resolvePath(src, input, task) {
    if (task === void 0) { task = new Task_1.default(new Runner(), {}); }
    var _loop_1 = function (i) {
        var resolver_1 = pathResolvers[i];
        var res = resolver_1(src, input, task);
        if (res) {
            var dest_1 = input.dest || task.dest;
            return { value: Promise.resolve(res).then(function (res) { return Promise.all(res); }).then(function (res) { return res.map(function (data) { return new Entry_1.default(data).inDest(dest_1); }); }).catch(function (err) {
                    throw "Error in task " + task.fullName + ".input : " + err + " \n " + err.stack;
                }) };
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
    if (runner === void 0) { runner = new Runner(task); }
    var entries = getEntries(input, task);
    return filterEntries(entries, input, task, runner);
}
function resolveTasks(parent, runner) {
    if (parent.tasks) {
        return util_1.resolver(Object.keys(parent.tasks).map(function (name) { return function () { return evaluateTask(parent.tasks ? parent.tasks[name] : {}, runner, parent, name); }; }), parent.parallel);
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
            var res = task.output(entries, runner, task);
            if (res === true || typeof res === 'undefined') {
                return entries;
            }
            else if (res) {
                return Promise.resolve(res).then(function (res) { return res.map(Entry_1.default.forceEntry).filter(function (v) { return v; }); });
            }
            else {
                return [];
            }
        }
        else {
            return entries;
        }
    }).catch(function (err) {
        throw "Error in task " + task.fullName + ".output : " + err + " \n " + err.stack;
    });
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
        })).then(function (res) { return res.filter(function (v) { return v; }); }); }).catch(function (err) {
            throw "Error in task " + task.fullName + ".filter : " + err + " \n " + err.stack;
        });
    }
    else {
        return entries;
    }
}
function evaluateEntries(entries, task, runner) {
    return Promise.all(entries).then(function (entries) { return outputEntries(entries, task, runner); }).then(function (entries) {
        if (entries.find(function (entry) { return entry instanceof Promise; })) {
            throw 'entry should be resolved before logging';
        }
        task.entries = entries;
        logEntries(entries, runner, task.name);
        return entries;
    });
}
function evaluateTask(taskl, runner, parent, name) {
    if (name === void 0) { name = '_root'; }
    if (taskl instanceof Array) {
        runner.log('starting task:' + name);
        var task = new Task_1.default(runner, {}, name, parent);
        if (parent) {
            parent.tasks[name] = task;
        }
        return evaluateEntries(taskl.map(function (data) { return new Entry_1.default(data); }), task, runner);
    }
    else if (taskl instanceof Function) {
        var res = taskl(runner, parent);
        return Promise.resolve(res).then(function (res) { return res && evaluateTask(res, runner, parent, name); });
    }
    else if (taskl) {
        var task_1 = taskl instanceof Task_1.default ? taskl : new Task_1.default(runner, taskl, name, parent);
        if (parent) {
            parent.tasks[name] = task_1;
        }
        runner.startTask(task_1);
        return resolveTasks(task_1, runner).then(function () {
            var inputs = task_1.input instanceof Array ? task_1.input : task_1.input && [task_1.input] || [];
            return Promise.all(inputs.map(function (input) { return filterInput(input, task_1, runner); }))
                .then(function (inputsSets) { return inputsSets.reduce(function (res, set) { return res.concat(set); }, []); })
                .then(function (entries) { return evaluateEntries(entries, task_1, runner); });
        }).then(function (entries) {
            runner.endTask(task_1);
            return entries;
        });
    }
    return Promise.resolve([]);
}
function run(task, config, runner) {
    if (config === void 0) { config = {}; }
    if (runner === void 0) { runner = new Runner(config); }
    return evaluateTask(task, runner, undefined).then(function () { return runner; });
}
exports.run = run;
