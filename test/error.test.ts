import {Runner, run} from '../src/Runner';


describe('error', () => {

    it('input error', done => {

        run({

            input: 'http::::///'

        }).catch(err => {

            expect(err).toContain('_root.input');
            done();

        });


    })

    it('filter error', done => {

        run({

            input: '**/*',
            filter: () => {throw 'err'}

        }).catch(err => {

            expect(err).toContain('_root.filter');
            expect(err).toContain(': err');
            done();

        });

    });

    it('filter error in promise', done => {

        run({

            input: '**/*',
            filter: () => new Promise((res,rej) => rej('err'))

        }).catch(err => {

            expect(err).toContain('_root.filter');
            done();

        });

    });

    it('output error', done => {

        run({

            input: '**/*',
            output: () => {throw 'err'}

        }).catch(err => {

            expect(err).toContain('_root.output');
            expect(err).toContain(': err');
            done();

        });

    });

    it('output error', done => {

        run({

            input: '**/*',
            tasks: {
                test: {
                    output: () => {throw 'err'}
                }
            }

        }).catch(err => {

            expect(err).toContain('_root.test.output');
            expect(err).toContain(': err');
            done();

        });

    });


});