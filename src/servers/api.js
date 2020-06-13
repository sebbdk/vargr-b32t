import fs from 'fs';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { getCompressionState, archive, getLocalArchives } from '../services/archive.js';
import { getConfigState, resetConfig } from '../services/config.js';
import { transfer } from '../services/samba.js';

export function startAPIServer({ port = 3001 } = {}) {
    const app = new Koa();
    const router = new KoaRouter();

    router.get('/archive/run', (ctx, next) => {
        try {
            archive();
        } catch(err) {
            console.error(err);
            ctx.body = JSON.stringify({ error: err.toString() });
            return;
        }

        ctx.body = JSON.stringify(getCompressionState());
    });

    router.get('/archive/info', (ctx, next) => {
        ctx.set('Content-Type', 'application/json');

        ctx.body = JSON.stringify({
            ...getConfigState(),
            local: {
                archives: getLocalArchives()
            }
        });
    });

    router.get('/config/reset', (ctx, next) => {
        ctx.set('Content-Type', 'application/json');
        resetConfig();
        ctx.body = JSON.stringify(getConfigState());
    });

    router.post('/archive/remove', (ctx, next) => {
        if (!ctx.request.body.fileName) return;

        fs.unlinkSync(`./data/to/${ctx.request.body.fileName}`);
    });

    router.get('/archive/configure', (ctx, next) => {
        ctx.request.body
    });

    router.get('/archive/index', (ctx, next) => {
        ctx.body = 'Nothing here yet. Should show list of completed archives and their transfer status.';
    });

    router.post('/archive/transfer', (ctx, next) => {
        transfer(ctx.request.body.fileName)
    });

    app
        .use(bodyParser())
        .use(async (ctx, next) => {
            ctx.set('Access-Control-Allow-Origin', '*');
            ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
            await next();
        })
        .use(router.routes())

        .use(router.allowedMethods());

    app.listen(port);
};
