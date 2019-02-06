import runCli from '../src/Cli';

describe('cli', () => {
    it('has-args', done => {

        const task1 = {name: 'task1', output: jest.fn()};
        const task2 = {name: 'task2', output: jest.fn()};

        runCli(({test}) => {

            expect(test).toBe('test');
            return {
                tasks: [
                    task1,
                    task2
                ]
            }

        }, ['task1', '--test', 'test']).then(() => {

            expect(task1.output).toBeCalledTimes(1);
            expect(task2.output).not.toBeCalled();
            done();
        });


    })
});