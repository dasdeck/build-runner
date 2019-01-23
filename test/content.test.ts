import * as Runner from '../src/Runner';
import * as path from 'path';

describe('content', () => {

    /**
     * lazy load a file's content
     */
    it('load-content', done => {

        const base = path.join(__dirname, 'content');
        Runner.getEntries({
                base,
                src: '**/*'
        }).then(entries => {

            expect(entries[0].loadContent()).toBe('');
            done();
        });

    });

});