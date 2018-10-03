import { Database } from '../classes/Database';
import { Paginator } from '../classes/Paginator';
import { Datatables as DT } from '../classes/Datatables';
import { Pool } from 'mysql';
import { IRow as Row } from '../interfaces/IRow';
import { IColumn as Column } from '../interfaces/IColumn';
import { Options } from '../interfaces/Options';

export { Row, Column, Options };

export async function Datatables(connection?: Pool): Promise<DT> {
    
    if (typeof connection == 'undefined') {
        connection = await Database.connect();
    }

    return new DT(new Database(connection), new Paginator);
}
