

import {TaskInterface, Filter, OneOrMore, InputLike, Output, TaskList, EntrySet, ResolvedEntrySet} from './interface';
import { Runner } from '.';
export default class Task implements TaskInterface {

    config?:any
    dest?:string
    base?:string //shared base
    filter?:Filter
    input?:OneOrMore<InputLike>
    output?:Output
    tasks?:TaskList
    name:string
    parent?:Task
    parallel?:boolean
    runner: Runner

    constructor(runner: Runner, data: any, name: string = '_root', parent?: Task) {

        this.runner = runner;
        this.name = name;
        this.parent = parent;
        Object.assign(this, data);

    }

    get currentConfig(): any {
        return Object.assign(this.parent && this.parent.currentConfig || Object.assign({}), this.config);
    }

    get entries(): ResolvedEntrySet {
        return this.runner.entries[this.name];
    }

    get subEntries(): ResolvedEntrySet {
        if (this.tasks) {
            return Object.keys(this.tasks).reduce((res: ResolvedEntrySet, name) => res.concat(this.runner.entries[name]), [])
        } else {
            return [];
        }
    }
}
