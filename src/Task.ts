

import {TaskInterface, Filter, OneOrMore, InputLike, Output, TaskList, EntrySet, GenericObject} from './interface';
import {Runner} from '.';
export default class Task implements TaskInterface {

    _config?:any
    dest?:string
    _base?:string //shared base
    filter?:Filter
    input?:OneOrMore<InputLike>
    output?:Output
    tasks:TaskList = {}
    name:string
    parent?:Task
    parallel?:boolean
    runner: Runner
    entries: EntrySet = []
    subTasks: GenericObject<Task> = {}

    constructor(runner: Runner, data: TaskInterface, name: string|number = '_root', parent?: Task) {

        this.runner = runner;
        this.name = typeof name === "number" ? `task${name + 1}` : name;
        this.parent = parent;

        Object.assign(this, data);

    }



    get fullName(): string {
        return (this.parent && (this.parent.fullName + '.') || '')  + this.name;
    }

    set base(base: string) {
        this._base = base;
    }

    get base(): string {
        return this._base || this.config.base;
    }

    set config(conf) {
        this._config = conf;
    }

    get config(): GenericObject {

        const parentConfig = this.parent && this.parent.config || this.runner._config || {};

        let config = this._config;
        if (typeof this._config === 'function') {
            config = config(this.parent);
        }

        return Object.assign(parentConfig, config);

    }

    get subEntries(): EntrySet {
        return Object.keys(this.subTasks).reduce((res: EntrySet, name) => res.concat(this.subTasks[name].entries), [])
    }
}
