export type Types = "object" | "function" | "literal";

export interface IExportable {
    name: string;
    default: boolean;
    type: Types;
}
