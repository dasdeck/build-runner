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


    it('deep-filter', done => {

        const task1 = {name: 'task1', output: jest.fn()};
        const task2 = {
            name: 'task2',
            output: jest.fn(),
            tasks: [
                {
                    name: 'subTask',
                    output: jest.fn()
                }
            ]
        };

        runCli(() => {

            return {
                tasks: [
                    task1,
                    task2
                ]
            }

        }, ['task2.subTask']).then(() => {

            expect(task1.output).not.toBeCalled();
            expect(task2.output).not.toBeCalled();
            expect(task2.tasks[0].output).toBeCalled();
            done();
        });


    });
});