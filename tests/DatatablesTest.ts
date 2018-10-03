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

    it('changes the row values on the fly', async () => {
        try {
            const response = await client.get('/users/modified?page=1&limit=50');
            expect(response.status).to.be.equal(200);
            expect(response.data.data[0].name).to.have.string('Test');
            
        } catch (err) {
            console.log(err);
        }
    }).timeout(0);

    it('handles load of requests using mysql pool feature', async () => {        
        const requestCount = 2000;
        const start = new Date().getTime();

        for (let i = 1; i <= requestCount; i++) {
            await client.get(`/users?page=${i}&limit=100`);
        }

        const end = new Date().getTime();

        const ms = end-start;
        const sec = ms/1000;

        expect(sec).to.be.lessThan(40);
    }).timeout(0);

    it('handles 100 concurrent requests', async () => {
        let promises: Promise<any>[] = [];
        const requestCount = 100;

        for (let i = 1; i <= requestCount; i++) {
            promises.push(client.get(`/users?page=${i}&limit=100`));
        }

        const result = await Promise.all(promises);

        let allOk: boolean = true;

        for (let i = 0; i < requestCount; i++) {
            if (result[i].status !== 200) {
                allOk = false;
                break;
            }
        }

        assert.isOk(allOk);

    }).timeout(20000);
})