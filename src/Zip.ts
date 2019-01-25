import Entry from './Entry';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs';

export default class Zip {

    constructor(entries?: Entry[]) {

        if (entries) {
            this.setEntries(entries);
        }
    }

    entries: {[s: string]: Entry} = {}

    setEntry(entry: Entry, replace = true) {
        if (!entry.target) {
            throw 'entries need a target!';
        }

        if (!replace && this.entries[entry.target]) {
            throw "entry already assigned";
        }
        this.entries[entry.target] = entry;
    }

    setEntries(entries: Entry[]) {
        entries.forEach(entry => this.setEntry(entry));
    }

    toAdm(): AdmZip {

        const zip = new AdmZip();

        Object.keys(this.entries).forEach(target => {

            const entry = this.entries[target];

            if (entry.content) {

                if (entry.content instanceof Buffer) {
                    zip.addFile(entry.target, entry.content);
                } else if (entry.content instanceof Zip) {
                    zip.addFile(entry.target, entry.content.toAdm().toBuffer());
                } else if (typeof entry.content === 'string') {
                    zip.addFile(entry.target, Buffer.from(entry.content));
                }

            } else if (entry.path) {

                if (path.basename(entry.path) !== path.basename(entry.target)) {
                    // write content manually to account for renamed entry
                    zip.addFile(entry.target, fs.readFileSync(entry.path));
                } else {
                    zip.addLocalFile(entry.path, path.dirname(entry.target));
                }

            }

        });

        return zip;
    }


}