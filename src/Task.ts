

import {TaskInterface, Filter, OneOrMore, InputLike, Output, TaskList, EntrySet, ResolvedEntrySet} from './interface';
import { Runner } from '.';
export default class Task implements TaskInterface {

    _config?:any
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
    entries: ResolvedEntrySet = []

    constructor(runner: Runner, data: any, name: string = '_root', parent?: Task) {

        data._task = this;
        this.runner = runner;
        this.name = name;
        this.parent = parent;

        Object.assign(this, data);

    }

    set config(conf) {
        this._config = conf;
    }

    get fullName(): string {
        return (this.parent && (this.parent.fullName + '.') || '')  + this.name;
    }

    get config(): any {

        const parentConfig = this.parent && this.parent.config || this.runner._config || {};

        let config = this._config;
        if (typeof this._config === 'function') {
            config = config(this.parent);
        }

        return Object.assign(parentConfig, config);

    }

    get subEntries(): ResolvedEntrySet {
        if (this.tasks) {
            debugger
            return Object.keys(this.tasks).reduce((res: ResolvedEntrySet, name) => res.concat((<Task>(<TaskInterface>(<TaskList>this.tasks)[name])._task).entries), [])
        } else {
            return [];
        }
    }
}
