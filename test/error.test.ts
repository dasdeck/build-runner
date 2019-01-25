import {Runner} from '../src/Runner';


describe('error', () => {

    it('input error', done => {

        const r = new Runner({

            input: 'http::::///'

        });

        r.run().catch(err => {

            expect(err).toContain('_root.input');
            done();

        });


    })

    it('filter error', done => {

        const r = new Runner({

            input: '**/*',
            filter: () => {throw 'err'}

        });

        r.run().catch(err => {

            expect(err).toContain('_root.filter');
            done();

        });

    });

    it('filter error in promise', done => {

        const r = new Runner({

            input: '**/*',
            filter: () => new Promise((res,rej) => rej('err'))

        });

        r.run().catch(err => {

            expect(err).toContain('_root.filter');
            done();

        });

    });

    it('output error', done => {

        const r = new Runner({

            input: '**/*',
            output: () => {throw 'err'}

        });

        r.run().catch(err => {

            expect(err).toContain('_root.output');
            done();

        });

    });


});