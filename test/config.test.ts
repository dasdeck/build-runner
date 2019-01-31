import {run, Runner, Task} from '../src';

describe('config', () => {

    /**
     * ensure that the runner carries the config
     */
    it('access-global-config-in-task-callback', done => {

        const config = {
            tasks: {
                test: (runner: Runner) => [{content: runner._config}]
            }
        }

        run(config).then(runner => {
            expect((<any>runner.entries.test[0]).content).toBe(runner._config);
            done();
        })


    });

    it('dynamic-config', done => {

        run({
            config: (parent: Task) => {
                expect(parent).toBeFalsy();
                return {
                    test1: 1
                };
            },
            tasks: {
                sub1: {
                    config: (parent: Task) => {
                        expect(parent.name).toBe('_root');
                        expect(parent.config.test1).toBe(1);
                        return {

                        };
                    }
                }
            }
        }).then(() => done());
    });

    it('override-config-locally', done => {

        run({
            config: {
                test: 1
            },

            tasks: {
                task1: () => ({
                    config: {
                        test: 2
                    },

                    tasks: {
                        task2(runner: Runner, {config}: {config:any}) {
                            expect(config.test).toBe(2);

                            return {
                                name: 'p1',
                                tasks: {
                                    task4(runner: Runner, parent: Task) {
                                        expect(parent.name).toBe('p1');
                                        expect(parent.config.test).toBe(2);
                                    }
                                }
                            }
                        }
                    },
                    output(entries: [], runner: Runner, {config}: {config: any}) {
                        expect(config.test).toBe(2);
                        return [{src: 'test1'}]
                    }
                }),

                task3(runner: Runner, {config}: {config: any}) {
                    expect(config.test).toBe(1);
                }
            },

            output(entries, runner, {config}) {

                expect(config.test).toBe(1);
                done();
                return [{src: 'test2'}]
            }


        })

    });

});