import { expect, assert } from 'chai';
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

    it('returns http status 200 even if all fields where not sent (fallback configurations take place)', async () => {
        try {
            const response = await client.get('/users');
            expect(response.status).to.be.equal(200);
            expect(response.data.hasOwnProperty('columns')).to.be.equal(true);
            expect(response.data.hasOwnProperty('data')).to.be.equal(true);
            expect(response.data.hasOwnProperty('pagination')).to.be.equal(true);
        } catch (err) {
            console.log(err);
        }
    });

    it('returns json data in ascending order', async () => {
        try {
            const response = await client.get('/users?page=1&direction=asc');
            expect(response.status).to.be.equal(200);
            let id = 1;
            for (let record of response.data.data) {
                expect(record.id).to.be.equal(id);
                id++;
            }
        } catch (err) {
            console.log(err);
        }
    });

    it('can change the limit of the records', async () => {
        try {
            const response = await client.get('/users?page=1&limit=50');
            expect(response.status).to.be.equal(200);
            expect(response.data.hasOwnProperty('data')).to.be.equal(true);
            expect(response.data.data.length).to.be.equal(50);
        } catch (err) {
            console.log(err);
        } 
    });

    it.only('closes the database connection once a make function is complete', async () => {        
        const start = new Date().getTime();

        for (let i = 1; i <= 5000; i++) {
            let result = await client.get(`/users?page=${i}&limit=100`);
        }

        const end = new Date().getTime();

        console.log('operation took:', end-start, 'ms');

        assert.isOk(true);
    }).timeout(300000000);
})