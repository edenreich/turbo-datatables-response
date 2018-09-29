
export interface ModifiedRow
{
    [name: string]: string|Function;
    name: string;
    callback: Function;
}