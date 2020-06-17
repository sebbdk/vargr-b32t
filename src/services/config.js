import fs from 'fs';

export function createInitialConfig() {
    let samba = {
        address: '//1.1.1.1/j',
        username: 'guest', // not required, defaults to guest
        password: '', // not required
        domain: 'WORKGROUP', // not required
        maxProtocol: 'SMB3' // not required
    };

    const sambaConfigPath = './data/config/samba.json';
    if (fs.existsSync(sambaConfigPath)) {
        const rawdata = fs.readFileSync(sambaConfigPath);
        samba = JSON.parse(rawdata);
    }

    return {
        samba,
        compression: {
            level: 2, // Sets the compression level.
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
        },
        local: {
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

const configFilePath = './data/config/config.json';
let state = initConfig();
