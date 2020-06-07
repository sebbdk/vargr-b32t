import SambaClient from 'samba-client';
import { getConfigState, setConfigState } from './config.js';

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

const state = {
    queue: [],
    current: ''
};

export function getSambaState() {
    return state;
}

export function setSambaState(newState) {
    state = {
        state,
        ...newState
    }
}

export function parseDirString(data) {
    return data.split('\n').filter(i => i.match(/\w*.zip/gm)).map(i => {
        return {
            name: i.match(/\w*.zip/gm).shift(),
            changed: i.match(/\w{3}\s\w{3}\s*\d{1,2}\s*\d{1,2}:\d{1,2}:\d{1,2}\s\d{4}/gm)
        }
    });
}

export async function pollRemoteDir() {
    console.log('POLL!');

    try {
        const remoteDir = await getRemoteDir();

        setConfigState({
            remote: {
                ...getConfigState().remote,
                archives: parseDirString(remoteDir),
                error: false
            }
        });
    } catch(err) {
        console.error(err);
        setConfigState({
            remote: {
                ...getConfigState().remote,
                error: err.toString()
            }
        });
    }

    await sleep(5000)
    pollRemoteDir();
}

export async function getRemoteDir() {
    console.log(getConfigState().samba)

    const client = new SambaClient({
        address: getConfigState().samba.address,
        username: getConfigState().samba.username, // not required, defaults to guest
        password: getConfigState().samba.password, // not required
        domain: 'WORKGROUP', // not required
        maxProtocol: 'SMB3' // not required
    })

    // Gets list of files in folder
    return await client.dir('');
}

export async function transfer(file) {
    const client = new SambaClient({
        address, // required
        username, // not required, defaults to guest
        password, // not required
        domain: 'WORKGROUP', // not required
        maxProtocol: 'SMB3' // not required
    })

    // Gets list of files in folder
    return await client.sendFile('./0jzp5kf9d8v41.jpg', '0jzp5kf9d8v41.jpg');
}

// https://www.npmjs.com/package/samba-client
// nodejs implementation of client
// https://github.com/Node-SMB/marsaud-smb2