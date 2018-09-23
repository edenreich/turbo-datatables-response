import { Database } from '../classes/Database';
import { Paginator } from '../classes/Paginator';
import { Datatables as DT } from '../classes/Datatables';
import { Connection } from 'mysql';

export async function Datatables(connection?: Connection): Promise<DT> {
    
    connection = connection || await Database.connect();
    
    return new DT(new Database(connection), new Paginator);
}
