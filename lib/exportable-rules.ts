import {
    AssignmentExpression,
    ExportDefaultDeclaration,
    ExpressionStatement,
    ModuleDeclaration,
    Statement,
    VariableDeclaration
} from "cherow/dist/types/estree";
import { IExportable } from "./exportable.model";
import { extract } from "./extractors";

export interface IExportableRule {
    condition: (node: Statement | ModuleDeclaration) => boolean;
    extract: (
        node: Statement | ModuleDeclaration,
        nonExportStatements: VariableDeclaration[]
    ) => IExportable[];
    rules: {
        // else extendable
        override: boolean;
        // this rule will allow following expressions check for export extensions
        enablesExportExtension: boolean;
        // extracted expression is part of export inheritance
        isExportExtension: boolean;
    };
}

export const ExportableRuleSet: IExportableRule[] = [
    // module.exports =
    {
        condition: (node: any) =>
            node.type === "ExpressionStatement" &&
            (node.expression.type === "AssignmentExpression" &&
                node.expression.operator === "=") &&
            (node.expression.left.type === "MemberExpression" &&
                node.expression.left.object &&
                node.expression.left.property) &&
            node.expression.left.object.name === "module" &&
            node.expression.left.property.name === "exports",
        extract: (node: any, nonExports) =>
            extract(
                (node.expression as AssignmentExpression).right,
                nonExports
            ),
        rules: {
            enablesExportExtension: false,
            isExportExtension: false,
            override: true
        }
    },
    // exports.* =
    {
        condition: (node: any) =>
            node.type === "ExpressionStatement" &&
            (node.expression.type === "AssignmentExpression" &&
                node.expression.operator === "=") &&
            (node.expression.left.type === "MemberExpression" &&
                node.expression.left.object &&
                node.expression.left.property) &&
            node.expression.left.object.name === "exports" &&
            node.expression.left.property.type === "Identifier",
        extract: (node: any, nonExports) =>
            extract(node.expression, nonExports),
        rules: {
            enablesExportExtension: false,
            isExportExtension: true,
            override: false
        }
    },
    // module.exports.* =
    {
        condition: (node: any) =>
            node.type === "ExpressionStatement" &&
            (node.expression.type === "AssignmentExpression" &&
                node.expression.operator === "=") &&
            (node.expression.left.type === "MemberExpression" &&
                node.expression.left.object &&
                node.expression.left.property) &&
            node.expression.left.object.object.name === "module" &&
            node.expression.left.object.property.name === "exports",
        extract: (node: any, nonExports) =>
            extract(node.expression as ExpressionStatement, nonExports),
        rules: {
            enablesExportExtension: false,
            isExportExtension: false,
            override: false
        }
    },
    // exports = module.exports =
    {
        condition: (node: any) =>
            node.type === "ExpressionStatement" &&
            (node.expression.type === "AssignmentExpression" &&
                node.expression.operator === "=") &&
            (node.expression.left.type === "Identifier" &&
                node.expression.left.name === "exports") &&
            (node.expression.right.type === "AssignmentExpression" &&
                node.expression.right.left.object.name === "module" &&
                node.expression.right.left.property.name === "exports"),
        extract: (node: any, nonExports) =>
            extract(node.expression.right.right, nonExports),
        rules: {
            enablesExportExtension: true,
            isExportExtension: false,
            override: false
        }
    },
    // export type
    {
        condition: node =>
            node.type === "ExportNamedDeclaration" &&
            node.specifiers.length === 0,
        extract: (node: any, nonExports) =>
            extract(node.declaration, nonExports),
        rules: {
            enablesExportExtension: true,
            isExportExtension: true,
            override: false
        }
    },
    // export {}
    {
        condition: node =>
            node.type === "ExportNamedDeclaration" &&
            node.specifiers.some(s => s.type === "ExportSpecifier"),
        extract: (node: any, nonExports) => extract(node, nonExports),
        rules: {
            enablesExportExtension: true,
            isExportExtension: true,
            override: false
        }
    },
    // export default
    {
        condition: node => node.type === "ExportDefaultDeclaration",
        extract: (node, nonExports) => extract(node, nonExports),
        rules: {
            enablesExportExtension: true,
            isExportExtension: true,
            override: false
        }
    }
];
