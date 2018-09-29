
import { IColumn } from '../interfaces/IColumn';

export class Column implements IColumn
{
    name: string;
    label: string;
    width?: string | undefined;
}