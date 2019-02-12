"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolver(promises, parallel) {
    if (parallel) {
        var unwrapped = promises.map(function (f) { return f(); });
        return Promise.all(unwrapped);
    }
    else {
        return promises.reduce(function (current, next) { return current.then(next); }, Promise.resolve());
    }
}
exports.resolver = resolver;
function map(objOrArray, cb) {
    if (objOrArray instanceof Array) {
        return objOrArray.map(cb);
    }
    else {
        return Object.keys(objOrArray).map(function (key) { return cb(objOrArray[key], key); });
    }
}
exports.map = map;
var isString = function (val) { return typeof val === 'string'; };
exports.isString = isString;
var isFunction = function (val) { return typeof val === 'function'; };
exports.isFunction = isFunction;
var isUndefined = function (val) { return val === undefined; };
exports.isUndefined = isUndefined;
var isArray = function (val) { return val instanceof Array; };
exports.isArray = isArray;
var ensureArray = function (val) { return isArray(val) ? val : [val]; };
exports.ensureArray = ensureArray;
