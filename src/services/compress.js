import fs from 'fs';
import archiver from 'archiver'

let state = {
    status: 'inactive',
    logs: []
};

export function getCompressionState() {
    return state;
}

export function setCompressionState(newState) {
    state = {
        ...state,
        ...newState
    }
}

export function log(type, msg) {
    setCompressionState({
        logs: [
            { type, msg },
            ...getCompressionState().logs
        ]
    })
}

export function compress(from, to, state) {
    // create a file to stream archive data to.
    var output = fs.createWriteStream(to);
    var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
        log('info', 'completed writing file');
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
        //const pct = Math.round(entry.entries.processed / entry.entries.total * 100);
        //const count = `${entry.entries.processed} / ${entry.entries.total}`;
        console.log(entry)
    });

    // good practice to catch this error explicitly
    archive.on('error', function(error) {
        log('error', error.toString());
        throw error;
    });

    archive.directory(from, false);

    archive.finalize();

    setCompressionState({ status: 'started' });
}
