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

    it('cache-task-results', done => {

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

            expect(task1.output).toBeCalledTimes(2);
            expect(runner.entries.task1[0].content).toBe('test');
            done();

        });


    });

});