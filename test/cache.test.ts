import Cache from '../src/Cache';
import * as path from 'path';

describe('cache', () => {

    /**
     * lazy load a file's content
     */
    it('persist-result', done => {


        const cache = new Cache;

        const source = jest.fn(() => Promise.resolve('res'));

        cache.persistResult('test', source).then(res => {

            expect(res).toBe('res');
            cache.persistResult('test', source).then(res => {

                expect(res).toBe('res');
                expect(source).toBeCalledTimes(1);
                done();

            });

        });




    });

});