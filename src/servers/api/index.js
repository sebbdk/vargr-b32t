import Koa from 'koa';
import KoaRouter from 'koa-router';
import { getCompressionState } from '../../services/compress.js';

export function startAPIServer({ port = 3000, archive } = {}) {
    const app = new Koa();
    const router = new KoaRouter();

    router.get('/archive/run', (ctx, next) => {
        if (getCompressionState().status === 'inactive') {
            archive();
            ctx.body = JSON.stringify(getCompressionState());
            return;
        }

        ctx.body = JSON.stringify({
            error: 'Only one archive can be made at a time.'
        });
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
