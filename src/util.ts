import { GenericObject, LazyPromise } from "./interface";
import * as crypto from 'crypto';
import * as fs from 'fs';

function resolver(promises: LazyPromise[], parallel?:boolean):Promise<any> {

    if (parallel) {
        const unwrapped = promises.map(f => f());
        return Promise.all(unwrapped);
    } else {
        return promises.reduce((current, next) => current.then(next), Promise.resolve())
    }
}

function map<T=any>(objOrArray: GenericObject | T[], cb: any): T[] {
    if (objOrArray instanceof Array) {
        return objOrArray.map(cb);
    } else {
        return Object.keys(objOrArray).map(key => cb(objOrArray[key], key));
    }
}

const isString = (val:any): val is String  => typeof val === 'string';
const isFunction = (val:any): val is Function => typeof val === 'function';
const isUndefined = (val:any): val is undefined => val === undefined;
const isArray = (val:any): val is [] => val instanceof Array;
const ensureArray = (val:any): any[] => isArray(val) ? val : [val];

function md5(data: any) {
    return crypto.createHash('md5').update(data).digest("hex");
}

const walkDirSync = (dir:string): string[] => {

    if (fs.statSync(dir).isDirectory()) {
        return fs.readdirSync(dir).reduce((res: string[], file:string) => res.concat(walkDirSync(file)), []);
    } else {
        return [dir];
    }


}

export {
    walkDirSync,
    md5,
    ensureArray,
    isArray,
    isFunction,
    isString,
    isUndefined,
    map,
    resolver
}