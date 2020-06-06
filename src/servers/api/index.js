import Koa from 'koa';
import KoaRouter from 'koa-router';
import { getCompressionState, archive } from '../../services/archive.js';

export function startAPIServer({ port = 3000 } = {}) {
    const app = new Koa();
    const router = new KoaRouter();

    router.get('/archive/run', (ctx, next) => {
        const from = getConfigState().backup.from;
        const to = getConfigState().backup.to + '/test.zip'

        try {
            archive(from, to);
        } catch(err) {
            ctx.body = JSON.stringify({ error: err.toString() });
        }

        ctx.body = JSON.stringify(getCompressionState());
    });

    router.get('/archive/info', (ctx, next) => {
        ctx.body = JSON.stringify(getCompressionState());
    });

    router.get('/archive/configure', (ctx, next) => {
        ctx.request.body
    });

    router.get('/archive/index', (ctx, next) => {
        ctx.body = 'Nothing here yet. Should show list of completed archives and their transfer status.';
    });

    router.get('/archive/move', (ctx, next) => {
        ctx.body = 'Nothing here yet. Should recieve a archive name and transfer settings';
    });

    app
        .use(router.routes())
        .use(router.allowedMethods());

    app.listen(port);
};
