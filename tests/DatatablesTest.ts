import { assert, should } from 'chai';
import axios from 'axios';
import { app } from './server';

describe('DatatablesTest', () => {
    const host = 'http://localhost:3000/';
    let server;

    const client = axios.create({
        baseURL: host,
    });

    before(async () => {
        server = app.listen(3000);
        console.log('server is running on http://localhost:3000');
    });

    after(async () => {
        server.close();
    });

    it('getting json as response back.', async () => {
        const response = await client.get('/users');

        console.log(response);
    });
})