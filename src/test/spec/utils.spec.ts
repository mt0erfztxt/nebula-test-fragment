import { asArray, testCafeAssertion, validationResult } from "../../main/utils";

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

// describe("toTestCafeAssertion()", () => {
//   it("returns correct assertion name when options.isNot is false", () => {
//     expect(toTestCafeAssertion(TestCafeAssertion.Eql)).toBe("eql");
//     expect(toTestCafeAssertion(TestCafeAssertion.NotEql)).toBe("notEql");
//     expect(toTestCafeAssertion(TestCafeAssertion.Match)).toBe("match");
//     expect(
//       toTestCafeAssertion(TestCafeAssertion.NotMatch, { isNot: false })
//     ).toBe("notMatch");
//   });
//
//   it("returns correct assertion name when options.isNot is true", () => {
//     for (const [value, result] of [
//       [TestCafeAssertion.NotEql, "eql"],
//       [TestCafeAssertion.Eql, "notEql"],
//       [TestCafeAssertion.Match, "notMatch"],
//       [TestCafeAssertion.NotMatch, "match"]
//     ]) {
//       expect(
//         toTestCafeAssertion(value as TestCafeAssertion, {
//           isNot: true
//         })
//       ).toBe(result as string);
//     }
//   });
// });

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

describe("validationResult()", () => {
  describe("when valid parameter is boolean", () => {
    it("returns ValidationResult", () => {
      expect(validationResult(false)).toEqual({
        valid: false,
        error: "Validation error"
      });

      expect(validationResult(true)).toEqual({
        valid: true
      });
    });

    it("allows error to be overridden", () => {
      expect(validationResult(false, "Some error")).toEqual({
        valid: false,
        error: "Some error"
      });

      expect(validationResult(true, "Some error")).toEqual({
        valid: true
      });
    });
  });

  describe("when valid parameter is ValidationResult", () => {
    it("returns ValidationResult", () => {
      expect(validationResult({ valid: false })).toEqual({
        valid: false,
        error: "Validation error"
      });

      expect(validationResult({ valid: true })).toEqual({
        valid: true
      });
    });

    it("allows error to be overridden", () => {
      expect(
        validationResult({ valid: false, error: "Prev error" }, "Next error")
      ).toEqual({
        valid: false,
        error: "Next error"
      });

      expect(
        validationResult({ valid: true, error: "Prev error" }, "Next error")
      ).toEqual({
        valid: true
      });
    });
  });
});
