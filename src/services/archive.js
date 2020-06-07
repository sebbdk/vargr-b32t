import fs from 'fs';
import archiver from 'archiver'
import { getConfigState, setConfigState } from './config.js';

export function getCompressionState() {
    return getConfigState().compression;
}

export function setCompressionState(newState) {
    setConfigState({
        compression: {
            ...getCompressionState(),
            ...newState
        }
    });
}

export function log(type, msg) {
    setCompressionState({
        logs: [
            {
                type,
                msg,
                time: Math.round((new Date()).getTime() / 1000)
            },
            ...getCompressionState().logs
        ]
    })
}

const backupsLocation = './data/to';
export function getLocalArchives() {
    return fs.readdirSync(backupsLocation);
}

export function archive(from, to) {
    if (getCompressionState().status !== 'inactive') {
        log('error', 'Can only run once archiving process at a time!');
        throw(new Error('Can only run one compression at a time.'));
    }

    log('info', 'Started compression: "' + from + '" to "' + to + '"');

    // create a file to stream archive data to.
    var output = fs.createWriteStream(to);
    var archive = archiver('zip', {
        zlib: {
            level: getConfigState().compression.level // Sets the compression level.
        }
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
        const fileName = to.split('/').pop()
        log('success', `Completed archiving ${fileName} with ${getCompressionState().last.total} files for a total of ${archive.pointer()} bytes.` );
        setCompressionState({ status: 'inactive' });
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
        console.log('Data has been drained');
    });

    archive.pipe(output);

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(error) {
        if (error.code === 'ENOENT') {
            // log warning
            log('warning', error.toString());
        } else {
            // throw error
            log('error', error.toString());
            throw error;
        }
    });

    archive.on('progress', function(entry) {
        setCompressionState({
            last: {
                ...entry.entries,
                ...entry.fs
            }
        })
    });

    // good practice to catch this error explicitly
    archive.on('error', function(error) {
        log('error', error.toString());
        throw error;
    });

    archive.directory(from, false);

    archive.finalize();

    setCompressionState({ status: 'archiving' });
}
