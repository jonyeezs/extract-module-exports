import { Identifier, VariableDeclaration } from "cherow/dist/types/estree";
import { IExportable, Types } from "./exportable.model";

export function extract(
    node: any,
    nonExports: VariableDeclaration[]
): IExportable[] {
    switch (node.type) {
        case "ObjectExpression":
            return extractObject(node);
        case "MemberExpression":
        case "AssignmentExpression":
            return [extractProperty(node)];
        case "Identifier":
            return extractFromNonExports(node, nonExports);
        default:
            return [{ name: "", default: false, type: "literal" }];
    }
}

export function extractObject(objectExpression: any): IExportable[] {
    return objectExpression.properties.map((prop: any) => ({
        default: false,
        name: prop.key.name,
        type: getType(prop.value.type)
    }));
}

export function extractProperty(assignmentExpression: any): IExportable {
    return {
        default: false,
        name: assignmentExpression.left.property.name,
        type: getType(assignmentExpression.right.type)
    };
}

export function extractFromNonExports(
    identifier: Identifier,
    statements: VariableDeclaration[]
): IExportable[] {
    let extractedExport = [
        { name: "", default: false, type: "literal" as Types }
    ];
    for (const statement of statements) {
        const actualExport = statement.declarations.find(
            d => (d.id as Identifier).name === identifier.name
        );

        if (actualExport) {
            const exportValue = (actualExport as any).init;

            extractedExport =
                exportValue.type === "ObjectExpression"
                    ? extractObject(exportValue)
                    : [
                          {
                              default: false,
                              name: identifier.name,
                              type: getType(exportValue.type)
                          }
                      ];
            break;
        }
    }

    return extractedExport;
}

export function getType(type: string): Types {
    const typeConverts: { [t: string]: Types } = {
        FunctionExpression: "function",
        Literal: "literal",
        ObjectExpression: "object"
    };
    return typeConverts[type] || "literal";
}
