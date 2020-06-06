import { startAPIServer } from './servers/api/index.js';
import { startGUIServer } from './servers/gui/index.js';

import { transferFileWithSamba } from './services/samba.js';
import { compress } from './services/compress.js';



// Mount network drive
    // handle fail gracefully
// Do thing
// Disconnect


// @TODO, remember to set a docker CPU limit
// So zip does not hog al lthe CPU while doing backup

export function run() {
    startAPIServer();
    //const samba = sambaConnect(sharePath, username, password);
    //console.log(samba);

    //transferFileWithSamba('//potato-sala/J', 'sebb', ';awesome')

    //compress('./test_files', 'test.zip')
}





// mount -t cifs -o username=sebb,password=\;awesome //192.168.1.2/J testmount/
// sudo umount testmount_2