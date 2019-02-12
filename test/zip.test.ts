import {run, Runner, Zip, Entry} from '../src';
import * as path from 'path';

describe('zip', () => {

    it('auto-create-zip', done => {

        const res: string[] = [];
        function push(letter: string) {
            res.push(letter);
            return letter;
        }

        const tasks = {
            name: 'zip',
            input: path.join(__dirname, 'assets', '*.zip')
        };

        run(tasks).then((runner: Runner) => {

            expect(runner.entries.zip[0]).toBeInstanceOf(Zip);
            done();
        })
    });


    it('alter-zip', () => {

        const zip = new Zip({src: path.join(__dirname, 'assets', 'test.txt.zip')});

        expect(zip.entries.length).toBe(1);

        zip.setEntry(new Entry({dest: 'test2.txt', content: 'someText'}));

        expect(zip.entries.length).toBe(2);


    })

    it('alter-content-in-zip', () => {

        const zip = new Zip({src: path.join(__dirname, 'assets', 'test.txt.zip')});

        zip.entries[0] = zip.entries[0].withContent('tested');

        const reopenedZip = new Zip({content: zip.toBuffer()});

        expect(reopenedZip.entries[0].loadContent()).toBe('tested');


    });

    it('replace-entries', () => {

        const zip = new Zip({src: path.join(__dirname, 'assets', 'test.txt.zip')});

        zip.entries = zip.entries.map(entry => entry.withContent('tested'));

        const reopenedZip = new Zip({content: zip.toBuffer()});

        expect(reopenedZip.entries[0].loadContent()).toBe('tested');
    }),

    it('glob-entries', () => {

        const zip = new Zip({src: path.join(__dirname, 'assets', 'test.txt.zip')});
        zip.entries = zip.glob('*.txt.zip');
        expect(zip.entries.length).toBe(1);

    });

    it('with-mapping', () => {

        const map = [
            {
                base: 'test/orig/dir',
                src: '*',
                dest: 'dest'
            }
        ];
        const zip = new Zip;
        zip.setEntry(new Entry({
            content: 'test',
            dest: 'test/orig/dir/myFile.txt'
        }));

        expect(zip.withMapping(map).entries[0].dest).toBe('dest/myFile.txt');

    });

    it('zips-get-extracted', done => {

        run({

        }).then((runner:Runner) => {

            done();
        });


    });


});