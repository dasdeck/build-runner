import { GenericObject, LazyPromise } from "./interface";


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
const isFunction =(val:any): val is Function => typeof val === 'function';

export {
    isFunction,
    isString,
    map,
    resolver
}