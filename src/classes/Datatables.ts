import { Database } from './Database';
import { Paginator } from './Paginator';
import { Options } from '../interfaces/Options';
import { Column } from '../classes/Column';
import { IColumn } from '../interfaces/IColumn';
import { Row } from '../classes/Row';
import { IRow } from '../interfaces/IRow';
import { ModifiedRow } from '../interfaces/ModifiedRow';

export class Datatables
{
    private db: Database;

    private paginator: Paginator;

    private columns: IColumn[];

    private rows: IRow[];

    private fetchableColumns: string[];

    private hiddenColumns: string[];

    private modifiedRows: ModifiedRow[];

    private table: string;

    private inputs: Options;

    constructor(db: Database, paginator: Paginator)
    {
        this.paginator = paginator;
        this.db = db;
        this.inputs = {};
        this.columns = [];
        this.fetchableColumns = [];
        this.hiddenColumns = [];
        this.modifiedRows = [];
        this.table = '';
    }

    public of(tableName: string): Datatables
    {
        this.table = tableName;

        return this;
    }

    public only(columns: string[]): void
    {
        this.fetchableColumns = columns;
    }

    public hide(columns: string[]): void
    {
        this.hiddenColumns = columns;
    }

    public async make(): Promise<object>
    {
        if (typeof this.table === 'undefined') {
            throw new Error(`
                Please use datatables.of(tablename) to indicate 
                from which table the records should be fetched`
            );
        }

        if (Object.keys(this.inputs).length <= 0) {
            throw new Error(`
                Please use datatables.setInputs(inputs) so datatables will know
                what fields needed to be fetched
            `);
        }

        this.columns = await this.getColumnNames(this.table);
        this.columns = await this.filter(this.columns);
        const count: number = await this.getRecordsCount(this.table);

        const column = this.columns[this.inputs.columnIndex || 0].name;
        const columns = this.columns.map(column => column.name).join(',');

        if (this.inputs.search) {
            const sql = `
                SELECT ${columns} FROM ${this.table}
                WHERE ${column} LIKE '%${this.inputs.search}%'
            `;

            const items = await this.db.query(sql);

            return {
                columns: this.columns,
                data: items
            };
        }

        const sql = `
            SELECT ${columns} FROM ${this.table}
            ORDER BY ${column} ${this.inputs.direction}
            LIMIT ${this.inputs.offset}, ${this.inputs.limit}
        `;
        
        this.rows = await this.db.query(sql);
        this.rows = await this.pipeThroughModify(this.rows);
        this.paginator.paginate(this.rows, count, this.inputs.limit || 10, this.inputs.page);

        return {
            columns: this.columns,
            data: this.rows,
            pagination: this.paginator.getPagination()
        };
    }

    public async edit(columnName: string, callback: Function): Promise<void>
    {
        this.columns = await this.getColumnNames(this.table);
        
        let exist: boolean = false;

        for (let column of this.columns) {
            if (column.name === columnName) {
                exist = true;
            }
        }

        if (exist) {
            const modifiedRow: ModifiedRow = { name: columnName, callback: callback };
            this.modifiedRows.push(modifiedRow);
        } else {
            throw new Error('the specified column name does not exists!');
        }
    }

    public async setInputs(inputs: any): Promise<void>
    {
        this.inputs.direction = (inputs.direction === 'desc') ? 'desc' : 'asc';
        this.inputs.search = escape(inputs.search || '');
        this.inputs.columnIndex = parseInt(inputs.column, 10) || 0;
        this.inputs.page = parseInt(inputs.page, 10) || 1;
        this.inputs.limit = parseInt(inputs.limit, 10) || 10;
        this.inputs.offset = this.inputs.limit * (this.inputs.page - 1);
    }

    protected async getColumnNames(tableName: string): Promise<IColumn[]>
    {
        if (this.columns.length > 0) {
            return this.columns;
        }

        const config = this.db.getConnectionConfig();
        let database = config.database;

        const sql = "SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='"+database+"' AND `TABLE_NAME`='"+tableName+"'";
        
        const columns: IRow[] = await this.db.query(sql);

        return columns.map((dbcolumn: any) => {
            let column: IColumn = new Column;
            column.name = dbcolumn.COLUMN_NAME;
            column.label = dbcolumn.COLUMN_NAME.charAt(0).toUpperCase() + dbcolumn.COLUMN_NAME.substr(1);
            column.width = '';

            return column;
        });
    }

    protected async getRecordsCount(tableName: string): Promise<number>
    {
        const count: IRow[] = await this.db.query('SELECT COUNT(*) as `total` FROM ' + tableName);

        return parseInt(count[0].total, 10);
    }

    protected async filter(columns: IColumn[]): Promise<IColumn[]>
    {
        if (this.fetchableColumns && this.fetchableColumns.length > 0) {
            columns = columns.filter((column: Column) => {
                return this.fetchableColumns.indexOf(column.name) !== -1
            });
        }

        if (this.hiddenColumns && this.hiddenColumns.length > 0) {
            columns = columns.filter((column: Column) => {
                return this.hiddenColumns.indexOf(column.name) === -1
            });
        }

        return columns;
    }

    protected async pipeThroughModify(rows: IRow[]): Promise<IRow[]>
    {
        this.modifiedRows.forEach((column: ModifiedRow) => {
            rows = rows.map((row: IRow) => {
                row[column.name] = column.callback(row);
                return row;
            });
        });

        return rows;
    }
}

export default Datatables;
