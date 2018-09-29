import { Pool, createPool, PoolConfig, MysqlError, PoolConnection } from 'mysql';
import { Row } from '../interfaces/Row';

export class Database
{
    private static pool: Pool;

    private static config: PoolConfig;

    public constructor(pool: Pool)
    {
        Database.pool = pool;        
    }

    public static async connect(): Promise<Pool>
    {
        return new Promise<Pool>((resolve, reject) => {
            if (Database.pool) {
                return resolve(Database.pool);
            }

            Database.config = {
                connectTimeout: 15,
                connectionLimit: 10,
                host: process.env.TEST_DB_HOST || 'localhost',
                user: process.env.TEST_DB_USER || 'root',
                password: process.env.TEST_DB_PASSWORD || '',
                database: process.env.TEST_DB_DATABASE || 'test_datatables'
            }

            let config: PoolConfig = Database.config;

            const pool: Pool = createPool(config);

            pool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }

                connection.release();

                return resolve(pool);
            });
        });
    }

    public async disconnect(): Promise<any>
    {
        return Promise.resolve(Database.pool.end());
    }

    public query(sql: string, binds?: any): Promise<Row[]>
    {
        return new Promise<Row[]>((resolve, reject) => {
            Database.pool.getConnection((err: MysqlError, connection: PoolConnection) => {        
                if (err) {
                    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                        reject('Database connection was closed.');
                    }

                    if (err.code === 'ER_CON_COUNT_ERROR') {
                        reject('Database has too many connections.');
                    }

                    if (err.code === 'ECONNREFUSED') {
                        reject('Database connection was refused.');
                    }
                }

                connection.query(sql, binds, (err, result: Row[]) => {    
                    // Once we have the result
                    // Release the connection back to the pool.
                    connection.release();

                    if (err) {
                        return reject(err);
                    }

                    return resolve(result);
                });
            });
        });
    }

    public getConnectionConfig(): PoolConfig
    {
        return Database.config;
    }
}
