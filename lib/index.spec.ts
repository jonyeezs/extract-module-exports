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
                name: "",
                type: "literal"
            });
        });
    });
});

describe("modules with object exports", () => {
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
                // unfortunately cherow doesn't provide the type for primitives
                const type = typeof assertObj[key];
                const assertType =
                    type !== "function" && type !== "object" ? "literal" : type;

                expect(result).toContainEqual({
                    default: false,
                    name: key,
                    type: assertType
                });
            });
        });
    });
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
