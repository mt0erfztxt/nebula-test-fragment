import { asArray, testCafeAssertion } from "../../main/utils";

describe("asArray()", function() {
  it("returns passed in value as-is when it is already an array", () => {
    const v = ["foo", "bar"];
    expect(asArray(v)).toBe(v);
  });

  it("returns passed in value wrapped in an array when it's not an array", () => {
    const v = 42;
    expect(asArray(v)).toEqual([v]);
  });
});

describe("testCafeAssertion()", () => {
  it("returns correct value when isNot option is false", () => {
    expect(testCafeAssertion("eql")).toEqual("eql");
    expect(testCafeAssertion("gte")).toEqual("gte");
  });

  it("returns correct value when isNot option is true", () => {
    expect(testCafeAssertion("eql", { isNot: true })).toEqual("notEql");
    expect(testCafeAssertion("gte", { isNot: true })).toEqual("lt");
  });
});
