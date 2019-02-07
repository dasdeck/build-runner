import Cache from '../src/Cache';
import {run, Runner} from '../src';


describe('cache', () => {

    /**
     * lazy load a file's content
     */
    it('persist-result', done => {

        const cache = new Cache;

        const source = jest.fn(() => Promise.resolve('res'));

        cache.persistResult('test', source).then(res => {

            expect(res).toBe('res');
            cache.persistResult('test', source).then(res => {

                expect(res).toBe('res');
                expect(source).toBeCalledTimes(1);
                done();

            });

        });

    });

    it('cache-result', done => {

        const task1 = {
            cache: true,
            output: jest.fn(() => [{content: 'test'}])
        }

        run({
            tasks: [
                task1,
                {...task1, cache: 'anotherKey'},
                task1
            ]
        }).then((runner: Runner) => {

            expect(task1.output).toBeCalledTimes(3);
            expect(runner.entries.task1[0].content).toBe('test');
            done();

        });

    });

    it('cache-results-overide-named-tasks', done => {

        const task1 = {
            cache: true,
            name: 'task1',
            output: jest.fn(() => [{content: 'test'}])
        }

        run({
            tasks: [
                task1,
                {...task1, cache: 'anotherKey'},
                task1
            ]
        }).then((runner: Runner) => {

            expect(task1.output).toBeCalledTimes(2);
            expect(runner.entries.task1[0].content).toBe('test');
            done();

        });

    });

    it('unique-cache-key', done => {

        const task = {
            cache: true,
            output: jest.fn(() => [{content: 'test'}])
        }

        run({
            tasks: [
                {...task, cache: 'key'},
                {...task, cache: 'key'}
            ]
        }).then((runner: Runner) => {

            expect(task.output).toBeCalledTimes(2);
            expect(runner.entries.task1[0].content).toBe('test');
            done();

        });

    });

    it('dynamic-cache-key', done => {

        const task = (key:string) => ({
            name: 'task1',
            cache: key,
            output: jest.fn(() => [{content: key}])
        })

        run({
            tasks: [
                task('a'),
                {
                    output: (e, runner) => {
                        expect(runner.entries.task1[0].content).toBe('a')
                    }
                },
                task('b')
            ]
        }).then((runner: Runner) => {

            // expect(tasCk1.output).toBeCalledTimes(2);
            expect(runner.entries.task1[0].content).toBe('b');
            done();

        });


    });

});