import * as minimist from 'minimist';
import { TaskLike } from './interface';
import {run} from './index';
import Runner from './Runner';





export default function runCli(config: TaskLike, args:string[] = process.argv.slice(2)):Promise<Runner> {

    const a = minimist(args);
    if (a._) {
        a._taskFilter = a._;
        delete a._;
    }
    return run(config, a);


}

