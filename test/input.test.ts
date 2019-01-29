import * as Runner from '../src/Runner';
import * as path from 'path';

describe('input', () => {

    it('http-input', done => {

        const config = {
            input: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'
        }

        Runner.run(config).then(runner => {
            expect(runner.entries._root[0].content).toBeInstanceOf(Buffer);
            done();
        });

    });

    it('string-input', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            base,
            input: 'test1.txt'
        }).then(runner => {

            expect(runner.entries._root[0].dest).toBe('test1.txt')
            done();

        });

    });

});