import extract from "./index";

it("should have a promise function", () => {
    return expect(extract("./fakepath")).toHaveProperty("then");
});
