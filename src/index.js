import Koa from 'koa';
import parser from 'koa-bodyparser';
import router from './routes/routes';

const app = new Koa();
const port = process.env.PORT || 5000;

app
    .use(parser())
    .use(router.routes());

app.listen(port, () => console.log('Server is running on port:', port));
