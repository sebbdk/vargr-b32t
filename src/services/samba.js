import SambaClient from 'samba-client';

const state = {};

export function getSambaState() {
    return state;
}

export function setSambaState(newState) {
    state = {
        state,
        ...newState
    }
}

// https://www.npmjs.com/package/samba-client


// nodejs implementation of client
// https://github.com/Node-SMB/marsaud-smb2

export async function transferFileWithSamba(address, username, password) {
    const client = new SambaClient({
        address, // required
        username, // not required, defaults to guest
        password, // not required
        domain: 'WORKGROUP', // not required
        maxProtocol: 'SMB3' // not required
    })

    // Gets list of files in folder
    const res = await client.dir('');

    const res2 = await client.sendFile('./0jzp5kf9d8v41.jpg', '0jzp5kf9d8v41.jpg');
 

    console.log(res)
    console.log(res2)

    return client
}