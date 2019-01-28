"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AdmZip = require("adm-zip");
var path = require("path");
var fs = require("fs");
var Zip = /** @class */ (function () {
    function Zip(entries) {
        this.entries = {};
        if (entries) {
            this.setEntries(entries);
        }
    }
    Zip.prototype.setEntry = function (entry, replace) {
        if (replace === void 0) { replace = true; }
        if (!entry.dest) {
            throw 'entries need a target!';
        }
        if (!replace && this.entries[entry.dest]) {
            throw "entry already assigned";
        }
        this.entries[entry.dest] = entry;
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
                if (entry.content instanceof Buffer) {
                    zip.addFile(entry.dest, entry.content);
                }
                else if (entry.content instanceof Zip) {
                    zip.addFile(entry.dest, entry.content.toAdm().toBuffer());
                }
                else if (typeof entry.content === 'string') {
                    zip.addFile(entry.dest, Buffer.from(entry.content));
                }
            }
            else if (entry.src) {
                if (path.basename(entry.src) !== path.basename(entry.dest)) {
                    // write content manually to account for renamed entry
                    zip.addFile(entry.dest, fs.readFileSync(entry.src));
                }
                else {
                    zip.addLocalFile(entry.src, path.dirname(entry.dest));
                }
            }
        });
        return zip;
    };
    return Zip;
}());
exports.default = Zip;
