import {Runner, run} from '../src/Runner';


describe('error', () => {

    it('input error', done => {

        run({

            input: 'http::::///'

        }).catch(err => {

            expect(err.message).toContain('_root.input');
            done();

        });


    })

    it('filter error', done => {

        run({

            input: '**/*',
            filter: () => {throw new Error('err')}

        }).catch(err => {

            expect(err.message).toContain('_root.filter');
            expect(err.message).toContain(': err');
            done();

        });

    });

    it('filter error in promise', done => {

        run({

            input: '**/*',
            filter: () => new Promise((res,rej) => rej('err'))

        }).catch(err => {

            expect(err.message).toContain('_root.filter');
            done();

        });

    });

    it('output error', done => {

        run({

            input: '**/*',
            output: () => {throw new Error('err')}

        }).catch(err => {

            expect(err.message).toContain('_root.output');
            expect(err.message).toContain(': err');
            done();

        });

    });

    it('output error', done => {

        run({

            input: '**/*',
            tasks: {
                test: {
                    output: () => {throw new Error('err')}
                }
            }

        }).catch(err => {

            expect(err.message).toContain('_root.test.output');
            expect(err.message).toContain(': err');
            done();

        });

    });


});