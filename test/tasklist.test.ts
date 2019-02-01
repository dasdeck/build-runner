import * as Runner from '../src';
import * as path from 'path';
import { EntrySet, TaskFactory, TaskInterface, TaskLike } from '../src/interface';

describe('tasklist', () => {

    let tmp: any;
    let mockTask: TaskFactory;
    let mockRequire: Function;

    beforeAll(() => {
        tmp = Runner.Runner.prototype.loadConfig;
    });
    beforeEach(() => {

        mockTask = jest.fn();
        mockRequire = jest.fn((path:string):TaskLike => {
            return mockTask
        });

        Runner.Runner.prototype.loadConfig = mockRequire as any;
    });

    afterAll(() => {
        Runner.Runner.prototype.loadConfig = tmp;
    });

    it('tasklist-shorthand', done => {

        const anonTask = {

        };
        Runner.run({
            tasks: [
                anonTask,
                'test',
                {
                    name: 'test3'
                }
            ]
        }).then((runner: Runner.Runner) => {

            expect(runner.tasks.task1).not.toBeUndefined()
            expect(mockTask).toBeCalledWith({}, runner, runner.tasks._root);
            expect(mockRequire).toHaveBeenCalledWith('test');
            done();
        })
    });


    it('serial-processing-of-sub-tasks', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {
                task1: {
                    input: {
                        base,
                        src: 'test1.txt',
                    }
                },

                task2: {
                    input: {
                        base,
                        src: 'test2.txt',
                    }
                }
            },
            output: (entries: EntrySet, runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.entries.task1[0].dest).toBe('test1.txt')
                expect(runner.entries.task2[0].dest).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });


});

