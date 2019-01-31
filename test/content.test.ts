import * as Runner from '../src/index';
import * as path from 'path';

describe('content', () => {

    /**
     * lazy load a file's content
     */
    it('load-content', done => {

        const base = path.join(__dirname, 'content');
        Runner.run({
            input: {
                base,
                src: '**/*'
        }}).then(({entries: {_root: entries}}) => {

            expect(entries[0].content).toBeUndefined();
            expect(entries[0].loadContent()).toBe('');
            done();
        });

    });

});