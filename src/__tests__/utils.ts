import { asArray, TestCafeAssertion, toTestCafeAssertionName } from "../utils";

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
  test("returns correct assertion name when options.isNot is false", function() {
    expect(toTestCafeAssertionName(TestCafeAssertion.Eql)).toBe("eql");
    expect(toTestCafeAssertionName(TestCafeAssertion.NotEql)).toBe("notEql");
    expect(toTestCafeAssertionName(TestCafeAssertion.Match)).toBe("match");
    expect(
      toTestCafeAssertionName(TestCafeAssertion.NotMatch, { isNot: false })
    ).toBe("notMatch");
  });

  test("returns correct assertion name when options.isNot is true", function() {
    for (const [value, result] of [
      [TestCafeAssertion.NotEql, "eql"],
      [TestCafeAssertion.Eql, "notEql"],
      [TestCafeAssertion.Match, "notMatch"],
      [TestCafeAssertion.NotMatch, "match"]
    ]) {
      expect(
        toTestCafeAssertionName(value as TestCafeAssertion, {
          isNot: true
        })
      ).toBe(result);
    }
  });
});
