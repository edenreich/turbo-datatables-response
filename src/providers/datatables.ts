import { Database } from '../classes/Database';
import { Paginator } from '../classes/Paginator';
import { Datatables as DT } from '../classes/Datatables';
import { Pool } from 'mysql';

export async function Datatables(connection?: Pool): Promise<DT> {
    
    if (connection) {
        connection = connection
    } else {
        connection = await Database.connect();
    }

    return new DT(new Database(connection), new Paginator);
}
