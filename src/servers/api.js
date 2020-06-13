import fs from "fs";
import Koa from "koa";
import KoaRouter from "koa-router";
import bodyParser from "koa-bodyparser";
import koaStatic from "koa-static";
import {
  getCompressionState,
  setCompressionState,
  archive,
  getLocalArchives,
  log,
} from "../services/archive.js";
import {
  getConfigState,
  resetConfig,
  setConfigState,
} from "../services/config.js";
import { transfer } from "../services/samba.js";

async function startArchiving() {
  try {
    if (getCompressionState().status !== "inactive") {
      log("info", "Can only run once backup process at a time!");
      return;
    }

    setCompressionState({ status: "archiving" });
    await archive();
    setCompressionState({ status: "inactive", last: undefined });
  } catch (err) {
    console.error(err);
    log("error", err.toString());
    setCompressionState({ status: "inactive", last: undefined });
  }
}

async function startBackupAndTransfer() {
  try {
    if (getCompressionState().status !== "inactive") {
      log("info", "Can only run once backup process at a time!");
      return;
    }
    log("success", "Started backup!");

    setCompressionState({ status: "archiving" });
    const archivePath = await archive();

    setCompressionState({ status: "transfering" });
    await transfer(archivePath);

    log("success", "Completed backup!");
    setCompressionState({ status: "inactive", last: undefined });
  } catch (err) {
    console.error(err);
    log("error", err.toString());
    setCompressionState({ status: "inactive", last: undefined });
  }
}

export function startAPIServer({ port = 3000 } = {}) {
  const app = new Koa();
  const router = new KoaRouter();

  router.get("/archive/now", (ctx, next) => {
    startArchiving();
    ctx.body = JSON.stringify(getCompressionState());
  });

  router.get("/backup/now", (ctx, next) => {
    if (getCompressionState().status !== "inactive") {
      log("info", "Can only run once backup process at a time!");
      return;
    }
    startBackupAndTransfer();
    ctx.body = JSON.stringify(getCompressionState());
  });

  router.get("/archive/info", (ctx, next) => {
    ctx.set("Content-Type", "application/json");

    ctx.body = JSON.stringify({
      ...getConfigState(),
      local: {
        archives: getLocalArchives(),
      },
    });
  });

  router.get("/config/reset", (ctx, next) => {
    ctx.set("Content-Type", "application/json");
    resetConfig();
    ctx.body = JSON.stringify(getConfigState());
  });

  router.post("/archive/remove", (ctx, next) => {
    if (!ctx.request.body.fileName) return;

    fs.unlinkSync(`./data/to/${ctx.request.body.fileName}`);
  });

  router.post("/config/samba", (ctx, next) => {
    setConfigState({
      samba: ctx.request.body,
    });

    log("success", "Changed Samba credentials");
  });

  router.get("/archive/index", (ctx, next) => {
    ctx.body =
      "Nothing here yet. Should show list of completed archives and their transfer status.";
  });

  router.post("/archive/transfer", (ctx, next) => {
    transfer(ctx.request.body.fileName);
  });

  app
    .use(bodyParser())
    .use(async (ctx, next) => {
      ctx.set("Access-Control-Allow-Origin", "*");
      ctx.set(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      ctx.set(
        "Access-Control-Allow-Methods",
        "POST, GET, PUT, DELETE, OPTIONS"
      );
      await next();
    })
    .use(router.routes())
    .use(koaStatic("./dist"))

    .use(router.allowedMethods());

  app.listen(port);
  console.info("Listening on port: " + port);
}
