import fs from 'fs';

export function createInitialConfig() {
    return {
        samba: {
            address: '//192.168.1.2/j',
            username: 'sebb', // not required, defaults to guest
            password: ';awesome', // not required
            domain: 'WORKGROUP', // not required
            maxProtocol: 'SMB3' // not required
        },
        compression: {
            level: 9, // Sets the compression level.
            status: 'inactive',
            logs: [
                {
                    type: 'info',
                    msg: 'Configuration Initialized...',
                    time: Math.round((new Date()).getTime() / 1000)
                }
            ]
        },
        backup: {
            status: 'inactive',
            from: './data/from',
            to: './data/to',
            intervals: 24 * 60 * 60, // 24 hours
            time: 0, // seconds since the day starts
            lastBackupTime: 0, // Timestamp
            count: 0,
            backupCount: 3,
            type: 'full', // will support sync and combi later
        },
        remote: {
            archives: []
        }
    };
}

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

export function writeConfigToDisk() {
    if (fs.existsSync(configFilePath)) fs.unlinkSync(configFilePath);
    fs.writeFileSync(configFilePath, JSON.stringify(getConfigState()), 'utf8');
}

export function initConfig() {
    if (fs.existsSync(configFilePath)) {
        const rawdata = fs.readFileSync(configFilePath);
        return JSON.parse(rawdata);
    }

    return createInitialConfig();
}

export function resetConfig() {
    setConfigState(createInitialConfig());
}

const configFilePath = './data/config.json';
let state = initConfig();