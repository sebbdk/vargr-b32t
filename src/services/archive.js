import fs from "fs";
import path from "path";
import archiver from "archiver";
import { getConfigState, setConfigState } from "./config.js";

const tmpDir = "./data/to/.tmp/";
const backupsDir = "./data/to/";

export function getCompressionState() {
  return getConfigState().compression;
}

export function setCompressionState(newState) {
  setConfigState({
    compression: {
      ...getCompressionState(),
      ...newState,
    },
  });
}

export function log(type, msg) {
  setCompressionState({
    logs: [
      {
        type,
        msg,
        time: Math.round(new Date().getTime() / 1000),
      },
      ...getCompressionState().logs,
    ],
  });
}

export function getLocalArchives(dir = backupsDir) {
  return fs.readdirSync(dir)
            .map((i) => ({ name: i, size: fs.statSync(dir + i).size })) // Add more info
            .filter(i => i.name[0] !== '.');// Hide items starting with `.`
  }

export function prepareTmpDir(dir = tmpDir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    return;
  }

  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(dir, file), (err) => {
        if (err) throw err;
      });
    }
  });
}

export function createArchiveName(dir = tmpDir) {
  const d = new Date("2010-08-05");
  const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  const mo = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(d);
  const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
  const timestamp = Math.round(new Date().getTime() / 1000);

  return `full_${da}_${mo}_${ye}_${timestamp}.zip`;
}

export function archive() {
  return new Promise((resolve) => {
    const archiveName = createArchiveName();
    const from = getConfigState().backup.from;
    const to = getConfigState().backup.to + archiveName;
    const tmpTo = tmpDir + archiveName;

    log("info", `Started compression of ${archiveName}`);

    prepareTmpDir(tmpDir);

    // create a file to stream archive data to.
    const output = fs.createWriteStream(tmpTo);
    const archive = archiver("zip", {
      zlib: {
        level: getConfigState().compression.level, // Sets the compression level.
      }
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on("close", () => {
      const fileName = to.split("/").pop();
      const msg = `Completed archiving ${fileName} with ${getCompressionState().last.total} files for a total of ${archive.pointer()} bytes.`;

      fs.rename(tmpDir, to, (err) => {
        if (err) {
          log("error", err.toString());
          throw(err);
        }

        log("success", msg);
        resolve(to);
      });
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on("end", function () {});

    archive.pipe(output);

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on("warning", (error) => {
      if (error.code === "ENOENT") {
        log("warning", error.toString());
        return;
      }

      log("error", error.toString());
      throw error;
    });

    archive.on("progress", (entry) => {
      const fileName = to.split("/").pop();

      setCompressionState({
        last: {
          fileName,
          ...entry.entries,
          ...entry.fs,
        },
      });
    });

    // good practice to catch this error explicitly
    archive.on("error", (error) => {
      log("error", error.toString());
      throw error;
    });

    archive.directory(from, false);

    archive.finalize();
  });
}
