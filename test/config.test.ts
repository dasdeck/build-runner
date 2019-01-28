import {Runner} from '../src/Runner';

describe('config', () => {

    /**
     * ensure that the runner carries the config
     */
    it('access-config-in-task-callback', done => {

        const config = {
            tasks: {
                test: (runner: Runner) => [{content: runner.config}]
            }
        }
        const runner = new Runner(config);

        runner.run().then(runner => {
            expect((<any>runner.entries.test[0]).content).toBe(runner.config);
            done();
        })


    });

});