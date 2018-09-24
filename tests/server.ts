import * as Koa from 'koa';
import * as Router from 'koa-router';
import { Datatables } from '../src/providers/datatables';

const app: Koa = new Koa;
const router: Router = new Router;

router.get('/users', async (ctx: any, next: any): Promise<any> => {    
    const inputs = ctx.request.query;
    const dt = await Datatables();

    dt.of('test_users').only(['id', 'email']);
    dt.setInputs(inputs);

    ctx.body = await dt.make();
});

app.use(router.routes());

export { app };