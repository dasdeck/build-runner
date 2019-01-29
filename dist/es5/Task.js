"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Task = /** @class */ (function () {
    function Task(runner, data, name, parent) {
        if (name === void 0) { name = '_root'; }
        this.runner = runner;
        this.name = name;
        this.parent = parent;
        Object.assign(this, data);
    }
    Object.defineProperty(Task.prototype, "currentConfig", {
        get: function () {
            return Object.assign(this.parent && this.parent.currentConfig || Object.assign({}), this.config);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "entries", {
        get: function () {
            return this.runner.entries[this.name];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "subEntries", {
        get: function () {
            var _this = this;
            if (this.tasks) {
                return Object.keys(this.tasks).reduce(function (res, name) { return res.concat(_this.runner.entries[name]); }, []);
            }
            else {
                return [];
            }
        },
        enumerable: true,
        configurable: true
    });
    return Task;
}());
exports.default = Task;
