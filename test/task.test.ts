import * as Runner from '../src';
import * as path from 'path';
import { ResolvedEntrySet } from '../src/interface';

const base = path.join(__dirname, 'content');


describe('basic', () => {


    /**
     * directly return an array of file entries from task entry
     */
    it('pure-entry-task', done => {

        Runner.run( {
            tasks: {
                task1: [{src: 'test1.txt'}],
                task2: () => [{src: 'test2.txt'}],
                task3: () => Promise.resolve([{src: 'test3.txt'}])
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.entries.task1.length).toBe(1);
                expect(runner.entries.task1[0]).toBeInstanceOf(Runner.Entry);
                expect(runner.entries.task1[0].dest).toBe('test1.txt');
                expect(runner.entries.task2.length).toBe(1);
                expect(runner.entries.task2[0].dest).toBe('test2.txt');

                expect(runner.entries.task3.length).toBe(1);
                expect(runner.entries.task3[0].dest).toBe('test3.txt');

            }

        }).then(runner => {

            done();

        });

    });

    /**
     * return a dynamic task json from a function
     */
    it('dynamic-task', done => {

        Runner.run({
            tasks: {
                task1: (runner: Runner.Runner) => ({
                    input: {
                        base,
                        src: '**/*',
                    }
                });
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.entries.task1.length).toBe(3)
                expect(runner.entries.task1[2].dest).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });

    /**
     * return a task via a promise
     */
    it('return-promised-task', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {
                task1: (runner: Runner.Runner) => new Promise(res => res({
                    input: {
                        base,
                        src: '**/*'
                    }
                }))
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.entries.task1.length).toBe(3)
                expect(runner.entries.task1[2].dest).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });

    /**
     * return nothing in task promise
     */
    it ('no-return-task', done => {

        Runner.run({
            tasks: {
                test: () => Promise.resolve()
            }
        }).then(() => {
            done();
        });

    });

    it ('full-name', done => {

        Runner.run({
            name: 'parent',
            tasks: {
                test: () => Promise.resolve({}),
            },
            output(e: ResolvedEntrySet, r: Runner.Runner, t: Runner.Task) {
                expect(r.tasks.test.fullName).toBe('parent.test');
            }
        }).then(() => {
            done();
        });

    });

    it ('custom-name', done => {

        Runner.run({
            tasks: {
                t1: {
                    base,
                    name: 'task1',
                    input: '**/*'
                }
            }
        }).then(runner => {
            expect(runner.tasks.task1).not.toBeUndefined();
            expect(runner.entries.task1).not.toBeUndefined();
            done();
        });

    });



});

