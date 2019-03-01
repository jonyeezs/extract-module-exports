import subject from "./index";

const fixtureDir = process.cwd() + "/fixtures";

it("should have a promise function", () => {
    return expect(subject(`${fixtureDir}/exports-literal.js`)).toHaveProperty(
        "then"
    );
});

describe("modules without exports or literals", () => {
    it("should return [] for exports = ", () => {
        return expect(
            subject(`${fixtureDir}/exports-literal.js`)
        ).resolves.toHaveLength(0);
    });
});

describe("default module", () => {
    it("should return [default] for module.exports = literal", () => {
        return subject(`${fixtureDir}/module-literal.js`).then(result => {
            expect(result).toHaveLength(1);
            expect(result).toContainEqual({
                default: false,
                name: ""
            });
        });
    });
});

describe("commonjs exports", () => {
    test.each([
        ["module.exports = ", "module-exports.js"],
        ["module.exports.* =", "module-property.js"],
        ["module.exports = variable", "module-variable.js"],
        ["module export with extensions", "module-extend.js"],
        ["overriden module exports object", "module-override.js"]
    ])(`should work on %s (using file ${fixtureDir}/%s)`, (_, filename) => {
        const file = `${fixtureDir}/${filename}`;
        const assertObj = require(file);
        const assertObjKeys = Object.keys(assertObj);
        return subject(file).then((result: any) => {
            expect(result).toHaveLength(assertObjKeys.length);
            assertObjKeys.forEach(key => {
                expect(result).toContainEqual(
                    expect.objectContaining({
                        name: key
                    })
                );
            });
        });
    });
});

// es6 testcases
import * as es6Alias from "../fixtures/es6-alias";
import * as es6Default from "../fixtures/es6-default";
import * as e6DefaultPlus from "../fixtures/es6-default-plus";
import * as es6Export from "../fixtures/es6-export";
import * as es6SelectiveReexport from "../fixtures/es6-selective-reexport";

describe("es6 exports", () => {
    test.each([
        ["export { alias as ... }", "es6-alias.ts", es6Alias],
        ["export default ", "es6-default.ts", es6Default],
        [
            "export default with additional exports",
            "es6-default-plus.ts",
            e6DefaultPlus
        ],
        ["multiple exports", "es6-export.ts", es6Export],
        ["export { a, b }", "es6-selective-reexport.ts", es6SelectiveReexport]
    ])(
        `should work on %s (using file ${fixtureDir}/%s)`,
        async (_, filename, assertObj) => {
            const file = `${fixtureDir}/${filename}`;
            const assertObjKeys = Object.keys(assertObj);
            const result = await subject(file);
            expect(result).toHaveLength(assertObjKeys.length);
            assertObjKeys.forEach(key => {
                expect(result).toContainEqual(
                    expect.objectContaining({
                        name: key
                    })
                );
            });
        }
    );
});

it("should not work on invalid exports", () => {
    return subject(`${fixtureDir}/exports-invalid.js`).then(result => {
        expect(result).toHaveLength(0);
    });
});

it("should not execute code when traversing files", () => {
    return subject(`${fixtureDir}/module-execute-code.js`).then(() => {
        const globalAny: any = global;
        expect(globalAny.outsideTestCase).toBeUndefined();
        expect(globalAny.insideTestCase).toBeUndefined();
    });
});
