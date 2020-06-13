import { startAPIServer } from "./servers/api.js";
import { pollRemoteDir } from "./services/samba.js";
import { setCompressionState, log } from "./services/archive.js";

export function run() {
  startAPIServer();
  pollRemoteDir();
  setCompressionState({ status: "inactive", last: undefined });
  log("info", "Started process...");
}
