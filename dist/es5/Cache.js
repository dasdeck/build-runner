"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var Cache = /** @class */ (function () {
    function Cache(config) {
        if (config === void 0) { config = { dir: path.join(process.cwd(), '.cache') }; }
        this.data = {};
        this.config = config;
    }
    Cache.prototype.persistResult = function (key, getter) {
        var _this = this;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var cachedValue = this.get(key);
        if (typeof cachedValue === 'undefined') {
            return Promise.resolve(getter.apply(void 0, args)).then(function (val) { return _this.set(key, val); });
        }
        else {
            return Promise.resolve(cachedValue);
        }
    };
    Cache.prototype.get = function (key, value) {
        var cachedValue = this.data[key];
        return typeof cachedValue === 'undefined' ? value : cachedValue;
    };
    Cache.prototype.set = function (key, value) {
        this.data[key] = value;
        return value;
    };
    Cache.prototype.store = function () {
    };
    Cache.prototype.restore = function () {
        if (fs.existsSync(this.config.dir)) {
        }
    };
    return Cache;
}());
exports.default = Cache;
