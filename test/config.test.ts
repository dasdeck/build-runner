import {Runner, run} from '../src/Runner';

describe('config', () => {

    it('access-config-in-task-callback', done => {

        const config = {
            tasks: {
                test: (runner: Runner) => [{config: runner.config}]
            }
        }
        const runner = new Runner(config);

        runner.run().then(runner => {
            expect((<any>runner.tasks.test[0]).config).toBe(runner.config);
            done();
        })


    });

});