import * as minimist from 'minimist';
import { TaskLike } from './interface';
import {run} from './index';
import Runner from './Runner';
import * as path from 'path';
import  * as fs from 'fs';





export default function runCli(args:string[] = process.argv.slice(2), config?: TaskLike):Promise<Runner> {

    const a = minimist(args);
    let inputFile:string = '';

    if (a._) {
        let possibleInputFile = a._[0];
        if (!path.isAbsolute(possibleInputFile)) {
            possibleInputFile = path.join(process.cwd(), possibleInputFile);
        }
        if (['', '.js', '.ts'].some(extension => fs.existsSync(possibleInputFile + extension))) {
            inputFile = possibleInputFile;
        }
    }

    if (!inputFile) {
        inputFile = path.join(process.cwd(), 'config.build.js');
    }

    return import(inputFile).then(config => {
        a._.shift();
        a._inputFile = inputFile;
        return config;
    }).catch(() => config).then(config => {

        a._taskFilter = a._;
        delete a._;

        if (config) {
            return run(config, a);
        } else {
            throw new Error('no config found')
        }

    });

}

