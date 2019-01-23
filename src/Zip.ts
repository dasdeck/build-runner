import Entry from './Entry';
import * as AdmZip from 'adm-zip';

export default class Zip {

    constructor(entries?: Entry[]) {

        if (entries) {
            this.setEntries(entries);
        }
    }

    entries: {[s: string]: Entry} = {}

    setEntry(entry: Entry) {
        if (!entry.target) {
            throw 'entries need a target!';
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
                zip.addFile(entry.target, entry.content instanceof Buffer ? entry.content : Buffer.from(entry.content));
            } else if (entry.path) {
                zip.addLocalFile(entry.path, entry.target);
            }
        });

        return zip;
    }


}