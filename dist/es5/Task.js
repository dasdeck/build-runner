"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Task = /** @class */ (function () {
    function Task(runner, data, name, parent) {
        if (name === void 0) { name = '_root'; }
        this.tasks = {};
        this.entries = [];
        this.subTasks = {};
        this.runner = runner;
        this.name = typeof name === "number" ? "task" + (name + 1) : name;
        this.parent = parent;
        Object.assign(this, data);
    }
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
            if (typeof this._config === 'function') {
                config = config(this.parent);
            }
            return Object.assign(parentConfig, config);
        },
        set: function (conf) {
            this._config = conf;
        },
        enumerable: true,
        configurable: true
    });
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
