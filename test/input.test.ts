import {Runner} from '../src/Runner';

describe('input', () => {

    it('http-input', done => {

        const config = {
            input: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'
        }
        const runner = new Runner(config);

        runner.run().then(runner => {
            expect(runner.tasks._root[0].content).toBeInstanceOf(Buffer);
            done();
        })


    });

});