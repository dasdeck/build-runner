import * as Runner from '../src/Runner';
import * as path from 'path';
import { doesNotReject } from 'assert';

describe('basic', () => {

    it('pure-entry-task', done => {


        const config = {
            tasks: {
                task1: [
                    {
                        src: 'test1.txt'
                    }
                ],
                task2: (runner: Runner.Runner) => [
                    {
                        src: 'test2.txt',
                        runner
                    }
                ]


            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.tasks.task1.length).toBe(1);
                expect(runner.tasks.task1[0].src).toBe('test1.txt');
                expect(runner.tasks.task2.length).toBe(1);
                expect(runner.tasks.task2[0].src).toBe('test2.txt');
                expect(runner.tasks.task2[0].runner).toBe(runner);
            }

        };
        const runner = new Runner.Runner(config)
        Runner.run(config, config, runner).then(runner => {


            done();

        });

    });

    it('dynamic-task', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {
                task1: (runner: Runner.Runner) => ({
                    input: {
                        base,
                        src: '**/*',
                    }
                })
            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.tasks.task1.length).toBe(3)
                expect(runner.tasks.task1[2].src).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });

    it('function-task-promise', done => {

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
                expect(runner.tasks.task1.length).toBe(3)
                expect(runner.tasks.task1[2].src).toBe('test2.txt')
            }

        }).then(runner => {

            done();

        });

    });

    it('load-content', done => {

        const base = path.join(__dirname, 'content');
        Promise.all(Runner.getEntries({
                base,
                src: '**/*'
        })).then(entries => {

            expect(entries[0].loadContent()).toBe('');
            done();
        });

    });

});

