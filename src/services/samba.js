import SambaClient from 'samba-client';
import { exec, spawn } from 'child_process';
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
            changed: i.match(/\w{3}\s*\w{3}\s*\d{1,2}\s\d{1,2}\:\d{1,2}\:\d{1,2}\s\d{4}/gm).shift(),
            size: parseInt((/(\d*)\s*\w{3}\s*\w{3}\s*\d{1,2}\s\d{1,2}\:\d{1,2}\:\d{1,2}\s\d{4}/gm).exec(i)[1], 10)
        }
    });
}

export async function pollRemoteDir() {
    //console.log('POLL!');

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
    //console.log(getConfigState().samba)

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

export async function transfer(fileName) {
    const client = new SambaClient({
        address: getConfigState().samba.address,
        username: getConfigState().samba.username, // not required, defaults to guest
        password: getConfigState().samba.password, // not required
        domain: 'WORKGROUP', // not required
        maxProtocol: 'SMB3' // not required
    });

    return new Promise((resolve) => {
        const cmdString = `curl`;


        const cmd = spawn(cmdString, ['--upload-file', `./data/to/${fileName}`, '-u', 'WORKGROUP/sebb:;awesome', `smb://192.168.1.2/j/${fileName}`]);

        cmd.stdout.on('data', (data) => {
          console.log(`!!-----stdout`);
          console.log(`${data}`);
        });
        
        let stderbuffer = Buffer.from('');
        cmd.stderr.on('data', (data) => {
            
            stderbuffer = Buffer.concat([stderbuffer, data]);
            console.log('----')
            console.log(stderbuffer.toString())
            let r = stderbuffer.toString().split('\n').pop().replace(/\s+/gm, '_').split('_').slice(1, -1)
            console.log("pct", r);
/*
            stderbuffer += data.toString();
            console.log(`${stderbuffer.replace(/\s+/gm, '_').split('_')}`);
            console.log(`${stderbuffer}`, stderbuffer.indexOf('\n'));
            if ( stderbuffer.indexOf('\n') > -1) {
          
                stderbuffer = '';
                return;
            }
*/
            
        });
        
        cmd.on('close', (code) => {
          console.log(`child process exited with code ${code}`);
        });

        /*
        exec(cmd, async (error, stdout, stderr) => {
            console.log('!')

            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }

            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }

            console.log(`stdout: ${stdout}`);
        });
        */
    })
}

// https://www.npmjs.com/package/samba-client
// nodejs implementation of client
// https://github.com/Node-SMB/marsaud-smb2