import * as glob from 'glob';
import * as path from 'path';
import * as request from 'request-promise-native';
import {resolver, map} from './util';
import Entry from './Entry';
import Task from './Task';
import {GenericObject, TaskFactory, TaskLike, EntrySet, PromisedEntries, PromisedEntryResult, Input, InputLike, EntryResult, TaskInterface} from './interface';
import Cache from './Cache';
import Logger from './Logger';

export default class Runner {

    entries: { [s: string]: EntrySet; } = {}
    tasks: { [s: string]: Task; } = {}
    taskTree: { [s: string]: Task; } = {}
    _config: GenericObject = {}
    logger: Logger
    cache: Cache = new Cache

    constructor(config: GenericObject = {home: process.cwd()}) {
        this._config = config;
        this.logger = new Logger(config.log)
    }

    startTask(task: Task) {

        if (this.tasks[task.name]) {
            this.logger.warn(`taskname '${task.name}' (${task.fullName}) already exists, named access (runner.tasks[${task.name}]) will be ambigus`);
        }

        this.taskTree[task.fullName] = task;
        this.tasks[task.name] = task;

        this.logger.log('starting task:', task.fullName);
    }

    loadConfig(p: string):TaskInterface|TaskFactory {
        // return require(p);
        if (p[0] === '~') {
            p = p.replace('~', this.config.home || process.cwd())
        }
        return require(p);

    }

    endTask(task: Task) {

        this.logger.log('ending task:', task.fullName);
    }

    get config() {
        return this._config;
    }

}


const pathResolvers = [

    (src: string, input: Input, task: Task): PromisedEntryResult[]|void => {
        if (src.indexOf('http') === 0) {
            return [task.runner.cache.persistResult(src, () => request(src, {encoding: null}).then((content:string|Buffer) => {
                return {content, src};
            }))]
        }
    },

    (src: string, input: Input, task: Task): EntryResult[] => {
        const base = input.base || task.base || '';
        const ignore = input.ignore instanceof Array ? input.ignore : (input.ignore && [input.ignore]);
        return glob.sync(src, {ignore, nodir: true, cwd: base}).map(dest => ({dest, src: path.join(base, dest)}));
    }
]

function resolvePath(src: string, input: Input, task: Task = new Task(new Runner(), {})): PromisedEntries {

    for (const i in pathResolvers) {
        const resolver = pathResolvers[i];
        const res = resolver(src, input, task);

        if (res) {
            const dest = input.dest || task.dest;
            return Promise.resolve(res).then(res => Promise.all(res)).then(res => res.map((data: any) => new Entry(data).inDest(dest))).catch(err => {
                throw `Error in task ${task.fullName}.input : ${err} \n ${err.stack}`;
            });
        }
    }

    return Promise.resolve([]);

}

function getEntries(input: InputLike, task?: Task): PromisedEntries {

    if (typeof input === 'string') {

        return resolvePath(input, {}, task);

    } else if (input instanceof Array) {

            return Promise.all(input.map((input: InputLike) => getEntries(input, task))).then(sets => sets.reduce((res, set) => res.concat(set)));

    } else {

        const src: string[] = input.src ? (input.src instanceof Array ? input.src : [input.src]) : [];
        return Promise.all(src.map(src => resolvePath(src, input, task))).then(sets => sets.reduce((res, set) => res.concat(set)))

    }

}

function filterInput(input: InputLike, task: Task, runner: Runner = new Runner(task)):PromisedEntries {
    const entries = getEntries(input, task);
    return filterEntries(entries, input, task, runner);
}

function resolveTasks(parent: Task, runner: Runner): PromisedEntries {
    if (parent.tasks) {
        return resolver(<any>map(parent.tasks, (task: TaskLike, name:string|number) => () => evaluateTask(task, runner, parent, {}, name)), parent.parallel)
    } else {
        return Promise.resolve([]);
    }
}

function logEntries(entries: EntrySet, runner: Runner, name?: string): void {

    name = name || `task${Object.keys(runner.entries).length}`;
    runner.entries[name] = entries;

}

function outputEntries(entries: EntrySet, task: Task, runner: Runner): PromisedEntries {

    return Promise.resolve(entries).then(entries => {

        if (task.output) {

            const res = task.output(entries, runner, task);

            if (res === true || typeof res === 'undefined') {
                return entries;
            } else if(res) {
                return Promise.resolve(res).then(res => <Entry[]>res.map(Entry.forceEntry).filter(v => v));
            } else {
                return [];
            }
        } else {
            return entries;
        }

    }).catch(err => {

        throw `Error in task ${task.fullName}.output : ${err} \n ${err.stack}`;

    })

}

function filterEntries(entries: PromisedEntries, input:InputLike, task: Task, runner:Runner):PromisedEntries {

    const filter = typeof input !== 'string' && input.filter || task.filter;

    if (filter) {

        return <PromisedEntries>Promise.resolve(entries).then(entries => Promise.all(entries.map(entry => {

            const res = filter(entry, runner);

            if (res === true || typeof res === 'undefined') {
                return entry;
            } else if (res) {
                return Promise.resolve(res).then(Entry.forceEntry);
            }

        })).then(res => res.filter(v => v))).catch(err => {
            throw `Error in task ${task.fullName}.filter : ${err} \n ${err.stack}`
        });

    } else {
        return entries;
    }

}

function evaluateEntries(entries: EntrySet, task:Task, runner:Runner):PromisedEntries {

    return Promise.all(entries).then(entries => outputEntries(entries, task, runner)).then((entries: EntrySet) => {

        if(entries.find(entry => entry instanceof Promise)) {
            throw 'entry should be resolved before logging';
        }

        task.entries = entries;
        logEntries(entries, runner, task.name);
        return entries;
    });

}

function evaluateTask(taskl: TaskLike | TaskFactory, runner: Runner, parent?: Task, config: GenericObject= {}, name:string|number = '_root'):PromisedEntries {

    if (typeof taskl === 'string') {
        taskl = [taskl];
    }

    if (taskl instanceof Array) {

        const [src, conf] = taskl;
        const task = runner.loadConfig(src);

        if (typeof name !== 'string') {
            name = path.basename(src);
        }

        return evaluateTask(task, runner, parent, conf, name);

    } else if (typeof taskl === 'function') {

        const evaluatedConfig = Object.assign({}, parent && parent.config || {}, config);
        const res: any = taskl(evaluatedConfig, runner, parent);
        return Promise.resolve(res).then(res => res && evaluateTask(res, runner, parent, {}, name));

    } else if (taskl) {

        const task:Task = taskl instanceof Task ?  taskl : new Task(runner, taskl, name, parent);
        if (parent) {
            parent.subTasks[task.name] = task;
        }
        runner.startTask(task);

        return resolveTasks(task, runner).then(() => {

            const inputs = task.input instanceof Array ? task.input : task.input && [task.input] || [];

            return Promise.all(inputs.map(input => filterInput(input, task, runner)))
            .then(inputsSets => inputsSets.reduce((res, set) => res.concat(set), []))
            .then(entries => evaluateEntries(entries, task, runner));

        }).then(entries => {
            runner.endTask(task);
            return entries;
        });

    } else {

        return Promise.resolve([]);

    }


}

function run(task:TaskLike | TaskFactory, config:GenericObject = {}, runner: Runner = new Runner(config)):Promise<Runner> {

    return evaluateTask(task, runner).then(() => runner);
}



export {
    run,
    Runner

}