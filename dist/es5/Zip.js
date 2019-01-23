"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AdmZip = require("adm-zip");
var Zip = /** @class */ (function () {
    function Zip(entries) {
        this.entries = {};
        if (entries) {
            this.setEntries(entries);
        }
    }
    Zip.prototype.setEntry = function (entry) {
        if (!entry.target) {
            throw 'entries need a target!';
        }
        this.entries[entry.target] = entry;
    };
    Zip.prototype.setEntries = function (entries) {
        var _this = this;
        entries.forEach(function (entry) { return _this.setEntry(entry); });
    };
    Zip.prototype.toAdm = function () {
        var _this = this;
        var zip = new AdmZip();
        Object.keys(this.entries).forEach(function (target) {
            var entry = _this.entries[target];
            if (entry.content) {
                zip.addFile(entry.target, entry.content instanceof Buffer ? entry.content : Buffer.from(entry.content));
            }
            else if (entry.path) {
                zip.addLocalFile(entry.path, entry.target);
            }
        });
        return zip;
    };
    return Zip;
}());
exports.default = Zip;
