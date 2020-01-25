import { isValidBemModifier, isValidBemName, isValidBemValue } from "../bem";

describe("isValidBemName()", () => {
  test("returns false when value is a string that starts not with a letter", () => {
    expect(isValidBemName("1")).toBe(false);
  });

  test("returns false when value is a string that ends with not a letter or a digit", () => {
    expect(isValidBemName("a1-")).toBe(false);
  });

  test("returns false when value is a string but not an alpha-numeric-dashed string", () => {
    expect(isValidBemName("a__1")).toBe(false);
    expect(isValidBemName("a@1")).toBe(false);
  });

  test("returns false when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    expect(isValidBemName("some--thing")).toBe(false);
  });

  test("returns true when value meet all criteria of valid BEM name", () => {
    expect(isValidBemName("name")).toBe(true);
    expect(isValidBemName("name-with-dashes")).toBe(true);
    expect(isValidBemName("name-that-ends-with-digit-1")).toBe(true);
  });
});

describe("isValidBemValue()", () => {
  test("returns false when value is a string that ends with not a letter or a digit", () => {
    expect(isValidBemValue("a1-")).toBe(false);
  });

  test("returns false when value is a string but not an alpha-numeric-dashed string", () => {
    expect(isValidBemValue("a__1")).toBe(false);
    expect(isValidBemValue("a@1")).toBe(false);
  });

  test("returns false when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    expect(isValidBemValue("some--thing")).toBe(false);
  });

  test("returns true when value meet all criteria of valid BEM name", () => {
    expect(isValidBemValue("1")).toBe(true);
    expect(isValidBemValue("value")).toBe(true);
    expect(isValidBemValue("value-with-dashes")).toBe(true);
    expect(isValidBemValue("value-that-ends-with-digit-1")).toBe(true);
    expect(isValidBemValue("2-value-that-ends-with-digit")).toBe(true);
  });
});

describe("isValidBemModifier()", () => {
  test("returns false when value is an array but its first element is not valid BEM name", () => {
    expect(isValidBemModifier(["1"])).toBe(false);
  });

  test("returns false when value is an array but its second element is not a nil or valid BEM value", () => {
    expect(isValidBemModifier(["fiz", ""])).toBe(false);
    expect(isValidBemModifier(["fiz", " "])).toBe(false);
    expect(isValidBemModifier(["fiz", "\t"])).toBe(false);
    expect(isValidBemModifier(["fiz", "-buz"])).toBe(false);
    expect(isValidBemModifier(["fiz", "buz-"])).toBe(false);
    expect(isValidBemModifier(["fiz", "biz--buz"])).toBe(false);
  });

  test("returns true when value is a BEM modifier", () => {
    expect(isValidBemModifier(["fiz"])).toBe(true);
    expect(isValidBemModifier(["fiz", undefined])).toBe(true);
    expect(isValidBemModifier(["fiz", "1"])).toBe(true);
    expect(isValidBemModifier(["fiz", "buz"])).toBe(true);
    expect(isValidBemModifier(["fiz", "biz-buz"])).toBe(true);
  });
});
