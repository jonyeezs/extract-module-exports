import { parse } from "cherow";
import {
    Program,
    Statement,
    VariableDeclaration
} from "cherow/dist/types/estree";
import { readFile } from "fs";
import { promisify } from "util";
import { ExportableRuleSet } from "./exportable-rules";
import { IExportable } from "./exportable.model";

export default function(path: string) {
    const cachedExpressions: VariableDeclaration[] = [];
    return promisify(readFile)(path, { encoding: "utf8" })
        .then(context => {
            return parse(context, { module: true });
        })
        .then((program: Program) => {
            let hasEnabledExportExtension = false;
            const result = program.body.reduce<IExportable[]>((acc, node) => {
                let ruleSet;
                try {
                    ruleSet = ExportableRuleSet.find(r => r.condition(node));
                } catch {
                    ruleSet = null;
                }
                if (!ruleSet) {
                    cachedExpressions.push(node as any);
                    return acc;
                } else {
                    if (ruleSet.rules.enablesExportExtension) {
                        hasEnabledExportExtension = true;
                    }
                    if (
                        !hasEnabledExportExtension &&
                        ruleSet.rules.isExportExtension
                    ) {
                        return acc;
                    }

                    if (ruleSet.rules.override) {
                        return ruleSet.extract(node, cachedExpressions);
                    }
                }
                return [...acc, ...ruleSet.extract(node, cachedExpressions)];
            }, []);
            return result;
        })
        .catch(err => {
            // tslint:disable-next-line: no-console
            console.error(err);
            return Promise.resolve([]);
        });
}
