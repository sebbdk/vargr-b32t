import SambaClient from "samba-client";
import { spawn } from "child_process";
import { getConfigState, setConfigState } from "./config.js";
import { log } from "./archive.js";

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const state = {
  queue: [],
  current: "",
};

export function getSambaState() {
  return state;
}

export function setSambaState(newState) {
  state = {
    state,
    ...newState,
  };
}

export function parseDirString(data) {
  return data
    .split("\n")
    .filter((i) => i.match(/\w*.zip/gm))
    .map((i) => {
      return {
        name: i.match(/\w*.zip/gm).shift(),
        changed: i
          .match(/\w{3}\s*\w{3}\s*\d{1,2}\s\d{1,2}\:\d{1,2}\:\d{1,2}\s\d{4}/gm)
          .shift(),
        size: parseInt(
          /(\d*)\s*\w{3}\s*\w{3}\s*\d{1,2}\s\d{1,2}\:\d{1,2}\:\d{1,2}\s\d{4}/gm.exec(
            i
          )[1],
          10
        ),
      };
    });
}

export async function pollRemoteDir() {
  try {
    const remoteDir = await getRemoteDir();

    setConfigState({
      remote: {
        ...getConfigState().remote,
        archives: parseDirString(remoteDir),
        error: false,
      },
    });
  } catch (err) {
    console.error(err);
    setConfigState({
      remote: {
        ...getConfigState().remote,
        error: err.toString(),
      },
    });
  }

  await sleep(5000);
  pollRemoteDir();
}

export async function getRemoteDir() {
  // @TODO, consider using something else
  const client = new SambaClient({
    address: getConfigState().samba.address,
    username: getConfigState().samba.username, // not required, defaults to guest
    password: getConfigState().samba.password, // not required
    domain: "WORKGROUP", // not required
    maxProtocol: "SMB3", // not required
  });

  // Gets list of files in folder
  return await client.dir("");
}

export async function transfer(filePath) {
  const fileName = filePath.split("/").pop();

  return new Promise((resolve) => {
    log('info', 'Started transfering archive to remote');
    const cmdString = `curl`;
    const cmd = spawn(cmdString, [
      "--upload-file",
      filePath,
      "-u",
      "WORKGROUP/sebb:;awesome",
      `smb://192.168.1.2/j/${fileName}`,
    ]);

    cmd.stdout.on("data", (data) => {
      console.log(`!!-----stdout`);
      console.log(`${data}`);
    });

    let stderbuffer = Buffer.from("");
    cmd.stderr.on("data", (data) => {
      stderbuffer = Buffer.concat([stderbuffer, data]);

      // Gives progress data, but also contains the rewrite characters
      // Meanning all' stderr are in the buffer, but the terminal
      // will only render the last three lines, because of the pointer characters
      // To get progress data we need only the actual "rendered" part of the stream.
      console.log(stderbuffer.toString());
    });

    cmd.on("close", (code) => {
      if (code === 0) {
        log('success', 'Finished transfering archive to remote');
        resolve();
        return;
      }

      reject(new Error(`Transfer exited with code ${code}`));
    });
  });
}

// https://www.npmjs.com/package/samba-client
// nodejs implementation of client
// https://github.com/Node-SMB/marsaud-smb2
