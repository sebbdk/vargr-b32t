let state = {
    samba: {
        address: undefined,
        username: 'guest', // not required, defaults to guest
        password: '', // not required
        domain: 'WORKGROUP', // not required
        maxProtocol: 'SMB3' // not required
    },
    compression: {
        level: 9 // Sets the compression level.
    },
    backup: {
        from: './data/from',
        to: './data/to',
        intervals: 24 * 60 * 60, // 24 hours
        time: 0, // seconds since the day starts
        lastBackupTime: 0, // Timestamp
        count: 0,
        backupCount: 3,
        type: 'full', // will support sync and combi later
    }
};

export function getConfigState() {
    return state;
}

export function setConfigState(newState) {
    state = {
        ...state,
        ...newState
    }

    writeConfigToDisk();
}

export function writeConfigToDisk() {}

export function writeConfigFromDisk() {}