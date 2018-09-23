import { Database } from '../classes/Database';
export declare class Seeder {
    protected db: Database;
    protected records: number;
    constructor(db: Database, records: number);
    seed(): Promise<void>;
}
