import {run, Runner, Task} from '../src';
import { GenericObject, EntrySet } from '../src/interface';

describe('config', () => {

    /**
     * ensure that the runner carries the config
     */
    it('access-global-config-in-task-callback', done => {

        const config = {
            tasks: {
                test: (_: any, runner: Runner) => ({output: () => [{content: 'config', data: runner._config}]})
            }
        }

        run(config).then((runner:Runner) => {
            expect((<any>runner.entries.test[0]).data).toBe(runner._config);
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

    it('overridden-config', done => {

        Runner.prototype.loadConfig = () => test;

        const test = (config:GenericObject) => {

            expect(config.val).toBe(3);

            return {

                tasks: [
                    (config:GenericObject) => {
                        expect(config.val).toBe(3)
                    }
                ],
                config: {
                    val: 2
                },
                output: (e: EntrySet, r: Runner, t: Task) => {
                    expect(t.config.val).toBe(2);
                    done()
                }

            };
        };

        run({
            config: {
                val: 5
            },
            tasks: [
                ['test', {val: 3}]
            ]
        })

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
                        task2(conf, runner: Runner, parent) {
                            if (parent) {
                                expect(parent.config.test).toBe(2);
                            }

                            return {
                                name: 'p1',
                                tasks: {
                                    task4(conf, runner: Runner, parent) {
                                        if (parent) {
                                            expect(parent.name).toBe('p1');
                                            expect(conf.test).toBe(2);
                                        }
                                    }
                                }
                            }
                        }
                    },
                    output(entries: EntrySet, runner: Runner, {config}: {config: GenericObject}) {
                        expect(config.test).toBe(2);
                        return [{src: 'test1'}]
                    }
                }),

                task3(conf, runner: Runner, parent) {
                    if (parent) {
                        expect(parent.config.test).toBe(1);
                    }
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