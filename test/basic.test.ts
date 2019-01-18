import * as Runner from '../Runner';
import * as path from 'path';

describe('basic', () => {

    it('pure-entry-task', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            tasks: {
                task1: [
                    {
                        src: 'test1.txt'
                    }
                ],
                task2: (runner: Runner.Runner) => [
                    {
                        src: 'test2.txt'
                    }
                ]


            },
            output: (entries: Runner.Entry[], runner: Runner.Runner) => {

                expect(runner).toBeDefined();
                expect(runner.tasks.task1.length).toBe(1);
                expect(runner.tasks.task1[0].src).toBe('test1.txt');
                expect(runner.tasks.task2.length).toBe(1);
                expect(runner.tasks.task2[0].src).toBe('test2.txt');
            }

        }).then(runner => {

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
                        src: '**/*'
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

});

