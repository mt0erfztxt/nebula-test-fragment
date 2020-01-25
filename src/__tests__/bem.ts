import { isBemModifier, isBemName, isBemValue } from "../bem";

describe("isBemName()", () => {
  test("returns false when value is not a string", () => {
    expect(isBemName(42)).toBe(false);
  });

  test("returns false when value is not a string that starts with a letter", () => {
    expect(isBemName("1")).toBe(false);
  });

  test("returns false when value is not a string that ends with a letter or a digit", () => {
    expect(isBemName("a1-")).toBe(false);
  });

  test("returns false when value is a string but not an alpha-numeric-dashed string", () => {
    expect(isBemName("a__1")).toBe(false);
    expect(isBemName("a@1")).toBe(false);
  });

  test("returns false when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    expect(isBemName("some--thing")).toBe(false);
  });

  test("returns true when value meet all criteria of valid BEM name", () => {
    expect(isBemName("name")).toBe(true);
    expect(isBemName("name-with-dashes")).toBe(true);
    expect(isBemName("name-that-ends-with-digit-1")).toBe(true);
  });
});

describe("isBemValue()", () => {
  test("returns false when value is not a string", () => {
    expect(isBemValue(42)).toBe(false);
  });

  test("returns false when value is not a string that ends with a letter or a digit", () => {
    expect(isBemValue("a1-")).toBe(false);
  });

  test("returns false when value is a string but not an alpha-numeric-dashed string", () => {
    expect(isBemValue("a__1")).toBe(false);
    expect(isBemValue("a@1")).toBe(false);
  });

  test("returns false when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    expect(isBemValue("some--thing")).toBe(false);
  });

  test("returns true when value meet all criteria of valid BEM name", () => {
    expect(isBemValue("1")).toBe(true);
    expect(isBemValue("value")).toBe(true);
    expect(isBemValue("value-with-dashes")).toBe(true);
    expect(isBemValue("value-that-ends-with-digit-1")).toBe(true);
    expect(isBemValue("2-value-that-ends-with-digit")).toBe(true);
  });
});

describe("isBemModifier()", () => {
  test("returns false when value is not an array", () => {
    expect(isBemModifier("fiz")).toBe(false);
  });

  test("returns false when value is an array but its first element is not a BEM name", () => {
    expect(isBemModifier([1])).toBe(false);
  });

  test("returns false when value is an array but its second element is not a nil or a BEM value", () => {
    expect(isBemModifier(["fiz", 1])).toBe(false);
    expect(isBemModifier(["fiz", ""])).toBe(false);
    expect(isBemModifier(["fiz", "-buz"])).toBe(false);
    expect(isBemModifier(["fiz", "buz-"])).toBe(false);
  });

  test("returns true when value is a BEM modifier", () => {
    expect(isBemModifier(["fiz"])).toBe(true);
    expect(isBemModifier(["fiz", undefined])).toBe(true);
    expect(isBemModifier(["fiz", null])).toBe(true);
    expect(isBemModifier(["fiz", "1"])).toBe(true);
    expect(isBemModifier(["fiz", "buz"])).toBe(true);
  });
});
