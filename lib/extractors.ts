import {
    ExportNamedDeclaration,
    Identifier,
    VariableDeclaration,
    VariableDeclarator
} from "cherow/dist/types/estree";
import { IExportable } from "./exportable.model";

export function extract(
    node: any,
    nonExports: VariableDeclaration[]
): IExportable[] {
    switch (node.type) {
        case "ObjectExpression":
            return extractObject(node);
        case "FunctionDeclaration":
            return [extractFunctionIdentifier(node)];
        case "ClassDeclaration":
            return [extractIdentifier(node)];
        case "MemberExpression":
        case "AssignmentExpression":
            return [extractProperty(node)];
        case "VariableDeclaration":
            return extractVariables(node.declarations);
        case "Identifier":
            return extractFromNonExports(node, nonExports);
        case "ExportNamedDeclaration":
            return extractSpecifiedExports(node, nonExports);
        case "ExportDefaultDeclaration":
            return [
                {
                    default: true,
                    name: "default"
                }
            ];
        default:
            return [{ name: "", default: false }];
    }
}

export function extractObject(objectExpression: any): IExportable[] {
    return objectExpression.properties.map((prop: any) => ({
        default: false,
        name: prop.key.name
    }));
}

export function extractProperty(assignmentExpression: any): IExportable {
    return {
        default: false,
        name: assignmentExpression.left.property.name
    };
}

export function extractIdentifier(node) {
    return {
        default: false,
        name: node.id.name
    };
}

export function extractFunctionIdentifier(node) {
    return {
        default: false,
        name: node.id.name
    };
}

export function extractFromNonExports(
    identifier: Identifier,
    statements: VariableDeclaration[]
): IExportable[] {
    let extractedExport = [{ name: "", default: false }];
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
                              name: identifier.name
                          }
                      ];
            break;
        }
    }

    return extractedExport;
}

export function extractVariables(declarations): IExportable[] {
    return declarations.map((d: VariableDeclarator) => ({
        default: false,
        name: (d.id as Identifier).name
    }));
}

export function extractSpecifiedExports(
    declaration: ExportNamedDeclaration,
    statements
): IExportable[] {
    return declaration.specifiers.map(d => ({
        default: false,
        name: (d.exported as Identifier).name
    }));
}
