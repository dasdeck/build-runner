import * as glob from 'glob';
import * as path from 'path';
import { Resolver } from 'dns';

interface Entry {
    path?: string,
    src?: string,
    content?: string|Buffer
}

class Runner {
    tasks: any = {}
    config: Task

    constructor(task: Task = {}) {
        this.config = task || {};
    }
}

interface Filter {(entry: Entry, runner: Runner):Entry|boolean|undefined|Promise<Entry|boolean|void>}
interface Output {(entries: Entry[], runner: Runner):Entry[]|Promise<Entry[]>|void}

interface Input {
    src?:string|string[],
    ignore?:string|string[],
    content?:string|Buffer,
    dest?:string,
    base?:string,
    filter?:Filter
}

interface Task {
    input?:Input|Input[],
    output?:Output,
    tasks?:any,
    name?:string,
    parallel?:boolean
}

function getEntries(input: Input):Entry[] {

        const base = input.base || '';
        const src = input.src instanceof Array ? input.src : [input.src];
        const ignore = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
        const files = src.reduce((res: string[], src: any) => res.concat(glob.sync(src, {ignore, cwd: input.base, nodir: true})), []);
        return files.map(src => {

            return {src, path: path.join(base, src)}
        });

}

function filterInput(input: Input, runner: Runner = new Runner):Promise<Entry[]> {
    const entries = getEntries(input);
    return filterEntries(entries, input, runner);

}

function resolver(promises: Promise<any>[], parallel?:boolean) {

    if (parallel) {
        return Promise.all(promises);
    } else {
        return promises.reduce((current, next) => current.then(() => next), Promise.resolve())
    }
}

function resolveTasks(tasks?: any, runner?: Runner, name?:string, parallel:boolean = false) {
    if (tasks) {
        return resolver(Object.keys(tasks).map(name => evaluateTask(tasks[name], runner, name)), parallel)
    } else {
        return Promise.resolve();
    }
}

function logEntries(entries: Entry[], runner: Runner, name?: string) {
    name = name || `task${Object.keys(runner.tasks).length}`;
    runner.tasks[name] = entries;
}

function processEntries(entries: Entry[], task: Task, runner: Runner): Entry[]|Promise<Entry[]> {
    if (task.output) {
        const res = task.output(entries, runner);
        if (typeof res === 'undefined') {
            return entries;
        } else {
            return res;
        }
    } else {
        return entries
    }
}

function filterEntries(entries: Entry[], input:Input, runner:Runner):Promise<Entry[]> {

    return <Promise<Entry[]>>Promise.all(entries.map(entry => {

        if (input.filter) {
            const res = input.filter(entry, runner);

            if(typeof res === 'undefined') {
                return entry;
            } else {
                return res;
            }

        } else {
            return entry;
        }

    }).filter(v => v));

}

function evaluateEntries(entries: Entry[], task:Task, runner:Runner, name?: string) {
    return Promise.resolve(processEntries(entries, task, runner)).then(entries => {
        logEntries(entries, runner, name);
        return entries;
    });
}

function evaluateTask(task: Task, runner: Runner = new Runner, name?:string):Promise<Entry[]> {

    if (task instanceof Array) {
        return evaluateEntries(task, task, runner, name);

    } else if (task instanceof Function) {
        return Promise.resolve(task(runner)).then(res => evaluateTask(res, runner, name));
    }


    return resolveTasks(task.tasks, runner, name, task.parallel).then(() => {

        let inputs = task.input instanceof Array ? task.input : task.input && [task.input] || [];

        return Promise.all(inputs.map(input => filterInput(input, runner)))
        .then(inputsSets => inputsSets.reduce((res, set) => res.concat(set), []))
        .then(entries => evaluateEntries(entries, task, runner, name))


    });

}

function run(task:Task, config?:object):Promise<Runner> {
    const runner = new Runner(config || task);
    return evaluateTask(task, runner, '_root').then(() => runner);
}

export {
    run,
    Runner,
    getEntries,
    filterInput,
    evaluateTask,
    Entry
}