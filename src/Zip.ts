import {EntrySet} from './interface';
import Entry from './Entry';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs';

export default class Zip {

    base?: Buffer

    constructor(entries?: EntrySet | Buffer) {

        if (entries instanceof Buffer) {
            this.base = entries;
        } else if (entries instanceof Array) {
            this.setEntries(entries);
        }
    }

    entries: {[s: string]: Entry} = {}

    setEntry(entry: Entry, replace = true) {
        if (!entry.dest) {
            throw 'entries need a target!';
        }

        if (!replace && this.entries[entry.dest]) {
            throw "entry already assigned";
        }
        this.entries[entry.dest] = entry;
    }

    setEntries(entries: EntrySet) {
        entries.forEach(entry => this.setEntry(entry));
    }

    toAdm(zip = new AdmZip(this.base as Buffer)): AdmZip {

        Object.keys(this.entries).forEach(target => {

            const entry = this.entries[target];

            if (entry.content) {

                if (entry.content instanceof Buffer) {
                    zip.addFile(entry.dest, entry.content);
                } else if (entry.content instanceof Zip) {
                    zip.addFile(entry.dest, entry.content.toAdm().toBuffer());
                } else if (typeof entry.content === 'string') {
                    zip.addFile(entry.dest, Buffer.from(entry.content));
                }

            } else if (entry.src) {

                if (path.basename(entry.src) !== path.basename(entry.dest)) {
                    // write content manually to account for renamed entry
                    zip.addFile(entry.dest, fs.readFileSync(entry.src));
                } else {
                    zip.addLocalFile(entry.src, path.dirname(entry.dest));
                }

            }

        });

        return zip;
    }


}