import { asArray, toTestCafeAssertionName, TestCafeAssertion } from "../utils";

describe("asArray()", function() {
  test("returns passed in value as-is when it is already an array", () => {
    const v = ["foo", "bar"];
    expect(asArray(v)).toBe(v);
  });

  test("returns passed in value wrapped in an array when it's not an array", () => {
    const v = 42;
    expect(asArray(v)).toEqual([v]);
  });
});

describe("toTestCafeAssertionName()", () => {
  describe("when options.isNot is false", () => {
    test("returns correct assertion name", function() {
      expect(toTestCafeAssertionName(TestCafeAssertion.Eql)).toBe("eql");
      expect(toTestCafeAssertionName(TestCafeAssertion.NotEql)).toBe("notEql");
      expect(toTestCafeAssertionName(TestCafeAssertion.Match)).toBe("match");
      expect(toTestCafeAssertionName(TestCafeAssertion.NotMatch)).toBe(
        "notMatch"
      );
    });
  });

  describe("when options.isNot is true", () => {
    const options = { isNot: true };

    test("returns correct assertion name", function() {
      expect(toTestCafeAssertionName(TestCafeAssertion.Eql, options)).toBe(
        "notEql"
      );
      expect(toTestCafeAssertionName(TestCafeAssertion.NotEql, options)).toBe(
        "eql"
      );
      expect(toTestCafeAssertionName(TestCafeAssertion.Match, options)).toBe(
        "notMatch"
      );
      expect(toTestCafeAssertionName(TestCafeAssertion.NotMatch, options)).toBe(
        "match"
      );
    });
  });
});
