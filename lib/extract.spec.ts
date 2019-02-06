import subject from "./index";

const fixtureDir = "../fixtures";

it("should have a promise function", () => {
    return expect(subject("./fakepath")).toHaveProperty("then");
});

describe("modules without exports or literals", () => {
    it("should return [] for exports = ", () => {
        return expect(
            subject(`${fixtureDir}/export-literal`)
        ).resolves.toHaveLength(0);
    });

    it("should return no results if the file does not exist", () => {
        return expect(
            subject(`${fixtureDir}/export-literal`)
        ).resolves.toHaveLength(0);
    });
});

describe("modules with object exports", () => {
    describe.each([
        ["exports = ", "exports"],
        ["module.exports = ", "module-exports"],
        ["module.exports.* =", "module-property"],
        ["module.export = variable", "module-variable"],
        ["module export with extensions", "module-extend"],
        ["overriden module exports object", "module-override"]
    ])(`should work on %s (using file ${fixtureDir}/%s)`, ([, filename]) => {
        const file = `${fixtureDir}/${filename}`;
        const assert = Object.keys(require(file));
        return subject(file).then(result => {
            expect(result).toHaveLength(assert.length);
            assert.forEach(expectedExport => {
                expect(result).toContain(expectedExport);
            });
        });
    });
});

it("should not execute code when traversing files", () => {
    return subject(`${fixtureDir}/module-execute-code`).then(() => {
        const globalAny: any = global;
        expect(globalAny.outsideTestCase).toBeUndefined();
        expect(globalAny.insideTestCase).toBeUndefined();
    });
});
