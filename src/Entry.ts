import * as path from 'path';
import * as fs from 'fs';
import {capture} from 'extglob';

import {Content, EntryLike, GenericObject, Class, Input} from './interface';
import {isFunction, isUndefined} from './util';
import { isString } from 'util';

interface StringFilter {(input:string): string};

export default class Entry implements EntryLike {

    src?: string
    content?: Content
    dest:string = ''

    constructor(data: EntryLike) {

        // if (data instanceof Entry) {
        //     throw new Error('do not create entry from entry (yet)');
        // }

        if (!data.src && isUndefined(data.content)) {
            throw new Error('who needs entries without source nor content?');
        }

        if (!data.dest && data.src) {
            this.dest = data.src;
            // throw 'entry needs a dest';
        }
        Object.assign(this, data);

    }

    static forceEntry(data?: any, prototype: Class = Entry): Entry | void {

        if (data instanceof Entry) {
            return data;
        } else if (typeof data === 'object') {
            return new prototype(data);
        }
    }

    getData(): GenericObject {
        return {
            src: this.src,
            dest: this.dest,
            content: this.content
        }
    }

    match(pattern: string, callback?: Function): any {

        const res = capture(pattern, this.src || this.dest);
        if (res && res.length) {

            if (isFunction(callback)) {
                return callback(res[0])
            }
            return res[0];
        }
        return false;
    }

    withDest(dest:string | StringFilter | Input, ...args: string[]) {


        if (isFunction(dest)) {
            dest = dest(this.dest);
        }


        if (isString(dest)) {

            dest = path.join(dest, ...args);
            return this.with({dest: dest})
        }

        if(dest.dest) {
            const map = dest.dest as GenericObject<string>;
            const base = dest.base || '';
            const srcs = Object.keys(map);
            return srcs.reduce((result: any, src: string) => {
                return result || this.match(path.join(base as string, src), (match:string) => {
                    return this.withDest(path.join(map[src], match));
                });
            }, null) || this;
        }

        return this;

    }



    with(data: Function | GenericObject = {}):Entry {

        if (isFunction(data)) {
            data = data(this);
        }

        return new (this.constructor as any)({...this, ...data});

    }

    withContent(content: Function | Content): Entry {
        return this.with({content: isFunction(content) ? content(this.loadContent()) : content})
    }

    inDest(dest?: string): Entry {
        if (dest) {
            return this.withDest(dest, this.dest);
        } else {
            return this;
        }
    }


    loadContent(encoding: string | null = 'utf8', override: boolean = false): Content | void {
        if ((!this.content || override) && this.src && fs.existsSync(this.src)) {
            this.content = fs.readFileSync(this.src, encoding);
        }
        return this.content
    }
}