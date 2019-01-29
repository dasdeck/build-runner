

import {TaskInterface, Filter, OneOrMore, InputLike, Output, TaskList} from './interface';
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

    constructor(data: any, name: string = '_root', parent?: Task) {

        Object.assign(this, data);

        this.name = data.name || name;
        this.parent = data.parent || parent;

    }

    get currentConfig(): any {
        return Object.assign(this.parent && this.parent.currentConfig || Object.assign({}), this.config);
    }
}
