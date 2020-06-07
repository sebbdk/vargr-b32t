import Koa from 'koa';
import KoaRouter from 'koa-router';
import { getCompressionState, archive, getLocalArchives } from '../services/archive.js';
import { getConfigState, resetConfig } from '../services/config.js';

export function startAPIServer({ port = 3001 } = {}) {
    const app = new Koa();
    const router = new KoaRouter();

    router.get('/archive/run', (ctx, next) => {
        const d = new Date('2010-08-05')
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
        const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d)
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
        const timestamp = Math.round((new Date()).getTime() / 1000);

        const from = getConfigState().backup.from;
        const to = getConfigState().backup.to + `/full_${da}_${mo}_${ye}_${timestamp}.zip`

        try {
            archive(from, to);
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
