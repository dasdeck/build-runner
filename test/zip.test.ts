import {run, Runner, Zip, Entry} from '../src';
import * as path from 'path';
import { ZipEntry } from '../src/Zip';
import { debug } from 'util';

describe('zip', () => {

    it('auto-create-zip', done => {


        const tasks = {
            name: 'zip',
            input: path.join(__dirname, 'assets', '*.zip')
        };

        run(tasks).then((runner: Runner) => {

            expect(runner.entries.zip[0]).toBeInstanceOf(ZipEntry);
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

    // it('with-mapping', () => {

    //     const map = [
    //         {
    //             base: 'test/orig/dir',
    //             src: '*',
    //             dest: 'dest'
    //         }
    //     ];
    //     const zip = new Zip;
    //     zip.setEntry(new Entry({
    //         content: 'test',
    //         dest: 'test/orig/dir/myFile.txt'
    //     }));

    //     expect(zip.withInputMapping(map).entries[0].dest).toBe('dest/myFile.txt');

    // });

    // it('zip-caching', done => {

    //     const task = {
    //         input: path.join(__dirname, 'assets', '*.zip')
    //     };

    //     run({
    //         tasks: [
    //             task,
    //             task
    //         ]
    //     }).then((runner: Runner) => {

    //         debugger
    //         expect(runner.entries.task1[0]).toBeInstanceOf(ZipEntry);
    //         done();
    //     })

    // });

    it('with-match-mapping', () => {

        const map = {

            'test/orig/dir/(*)': 'dest'
        }
        const zip = new Zip;
        zip.setEntry(new Entry({
            content: 'test',
            dest: 'test/orig/dir/myFile.txt'
        }));

        expect(zip.withMatchMapping(map).entries[0].dest).toBe('dest/myFile.txt');

    });

    it('zips-get-extracted', done => {

        run({
            name: 'task1',
            base: path.join(__dirname, 'assets'),
            input: '2items.zip'
        }).then((runner:Runner) => {

            expect(runner.entries.task1.length).toBe(2);
            done();
        });


    });


});