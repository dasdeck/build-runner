
declare class Zip {};
import Entry from './Entry';
import Runner from './Runner';
import Task from './Task';

type OneOrMore<T> = T | T[];
type GenericObject<T=any> = { [key: string]: T };
type MaybePromise<T> = Promise<T|void> | T | void;

type Content = string|Buffer|Zip;
interface EntryLike {
    src?: string
    content?: Content
    dest?:string
}

type EntrySet = Entry[];
type PromisedEntries = Promise<EntrySet>

type EntryResult = EntryLike | boolean | void;
type PromisedEntryResult = Promise<EntryResult>;

type TaskReference = string | [string] | [string, GenericObject]
type TaskLike = TaskInterface | TaskReference | TaskFactory;
type TaskList = { [s: string]: TaskLike ; } | TaskLike[] ;

interface TaskFactory {(config: GenericObject, runner: Runner, parent?: Task):MaybePromise<TaskLike | EntrySet>}

interface Filter {(entry: Entry, runner: Runner):EntryResult|PromisedEntryResult}

interface Input {
    src?:OneOrMore<string>,
    ignore?:OneOrMore<string>,
    content?:string|Buffer,
    dest?:string,
    base?:string,
    filter?:Filter
}
type InputLike = Input|string;

interface Output {(entries: EntrySet, runner: Runner, task: Task):EntryLike[] | Promise<EntryLike[]> | void | boolean}
interface DynamicConfig {(parent: Task): GenericObject | void}

interface TaskInterface {
    config?:GenericObject | DynamicConfig,
    dest?:string,
    base?:string, //shared base
    filter?:Filter,
    input?:OneOrMore<InputLike>,
    output?:Output,
    tasks?:TaskList,
    name?:string,
    parent?:Task,
    parallel?:boolean
}


export {
    Content,
    EntryLike,
    PromisedEntries,
    Input,
    PromisedEntryResult,
    EntryResult,
    EntrySet,
    GenericObject,
    Filter,
    OneOrMore,
    InputLike,
    Output,
    TaskList,
    TaskLike,
    TaskInterface,
    TaskFactory
}