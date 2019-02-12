"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs-extra");
var util_1 = require("./util");
var _1 = require(".");
var util_2 = require("util");
var Cache = /** @class */ (function () {
    function Cache(config) {
        if (config === void 0) { config = {}; }
        this.data = {};
        this.config = config;
    }
    Cache.prototype.clear = function () {
        fs.removeSync(this.dir);
    };
    Cache.prototype.persistSource = function (src, getter) {
        var _this = this;
        var cachedValue = this.get(src);
        if (typeof cachedValue === 'undefined') {
            return Promise.resolve(getter && getter()).then(function (content) { return _this.write(src, content); }).then(function () { return _this.get(src) || []; });
        }
        else {
            return Promise.resolve(cachedValue);
        }
    };
    Cache.prototype.persistResult = function (src, getter) {
        var _this = this;
        var cachedValue = this.get(src);
        if (typeof cachedValue === 'undefined') {
            return Promise.resolve(getter()).then(function (val) { return _this.set(src, val); });
        }
        else {
            return Promise.resolve(cachedValue);
        }
    };
    Object.defineProperty(Cache.prototype, "defaultDir", {
        get: function () {
            return path.join(process.cwd(), '.cache');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cache.prototype, "dir", {
        get: function () {
            return this.config.dir || this.defaultDir;
        },
        enumerable: true,
        configurable: true
    });
    Cache.prototype.get = function (src, value) {
        var cachedValue = this.data[src];
        if (util_2.isUndefined(cachedValue)) {
            cachedValue = this.load(src);
        }
        return util_2.isUndefined(cachedValue) ? value : cachedValue;
    };
    Cache.prototype.set = function (src, value) {
        this.data[src] = value;
        return this.get(src);
    };
    Cache.prototype.getCachePathFor = function (src) {
        return path.join(this.dir, util_1.md5(src));
    };
    Cache.prototype.write = function (src, content) {
        var cache = this.getCachePathFor(src);
        if (util_2.isUndefined(content)) {
            content = fs.readFileSync(src);
        }
        if (src.endsWith('.zip')) {
            new _1.Zip({ content: content }).extractAllTo(cache);
        }
        else {
            fs.ensureFileSync(cache);
            fs.writeFileSync(cache, content);
        }
    };
    Cache.prototype.load = function (src) {
        var p = this.getCachePathFor(src);
        if (fs.existsSync(p)) {
            this.data[src] = p;
            return this.get(src);
        }
    };
    return Cache;
}());
exports.default = Cache;
