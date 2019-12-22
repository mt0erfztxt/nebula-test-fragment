import { testCafeAssertion } from "../../main/utils";

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
