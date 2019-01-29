"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Task = /** @class */ (function () {
    function Task(data, name, parent) {
        if (name === void 0) { name = '_root'; }
        Object.assign(this, data);
        this.name = data.name || name;
        this.parent = data.parent || parent;
    }
    Object.defineProperty(Task.prototype, "currentConfig", {
        get: function () {
            return Object.assign(this.parent && this.parent.currentConfig || Object.assign({}), this.config);
        },
        enumerable: true,
        configurable: true
    });
    return Task;
}());
exports.default = Task;
