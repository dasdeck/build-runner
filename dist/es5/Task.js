"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("util");
var perf_hooks_1 = require("perf_hooks");
var Task = /** @class */ (function () {
    function Task(runner, data, name, parent) {
        if (name === void 0) { name = '_root'; }
        this.tasks = {};
        this.entries = [];
        this.subTasks = {};
        this.startTime = 0;
        this.runner = runner;
        this.name = typeof name === "number" ? "task" + (name + 1) : name;
        this.parent = parent;
        Object.assign(this, data);
    }
    Task.prototype.start = function (runner) {
        this.runner = runner;
        this.runner.startTask(this);
        this.startTime = perf_hooks_1.performance.now();
        this.runner.logger.log('starting task:', this.fullName);
    };
    Task.prototype.end = function () {
        var time = Math.round(perf_hooks_1.performance.now() - this.startTime) / 1000;
        this.runner.logger.log('ending task:', this.fullName, ": " + time + " sec.");
        return this.entries;
    };
    Object.defineProperty(Task.prototype, "fullName", {
        get: function () {
            return (this.parent && (this.parent.fullName + '.') || '') + this.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "base", {
        get: function () {
            return this._base || this.config.base;
        },
        set: function (base) {
            this._base = base;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "config", {
        get: function () {
            var parentConfig = this.parent && this.parent.config || this.runner._config || {};
            var config = this._config;
            if (typeof config === 'function') {
                var res = config(this.parent);
                if (res) {
                    config = res;
                }
            }
            return Object.assign({}, parentConfig, config);
        },
        set: function (conf) {
            this._config = conf;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "cacheKey", {
        get: function () {
            return this.cache && (this.fullName + (util_1.isString(this.cache) ? "." + this.cache : '')) || '';
        },
        enumerable: true,
        configurable: true
    });
    Task.prototype.storeCache = function () {
        if (this.cache) {
            this.runner.cache.set(this.cacheKey, this.entries);
        }
    };
    Task.prototype.restoreCache = function () {
        var _this = this;
        var entries = this.runner.cache.get(this.cacheKey);
        if (entries) {
            this.runner.logger.log('restored from cache:', this.fullName);
            this.entries = entries;
            Object.keys(this.subTasks).forEach(function (name) { return _this.subTasks[name].restoreCache(); });
            return true;
        }
    };
    Object.defineProperty(Task.prototype, "subEntries", {
        get: function () {
            var _this = this;
            return Object.keys(this.subTasks).reduce(function (res, name) { return res.concat(_this.subTasks[name].entries); }, []);
        },
        enumerable: true,
        configurable: true
    });
    return Task;
}());
exports.default = Task;
