import is from "@sindresorhus/is";

import {
  isValidBemModifier,
  isValidBemName,
  isValidBemObject,
  isValidBemValue,
  validateBemString
} from "../bem";

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

describe("isValidBemObject()", () => {
  describe("returns false when", () => {
    test("'blk' property is not valid BEM block", () => {
      expect(isValidBemObject({ blk: "1" })).toBe(false);
    });

    test("'elt' property is not valid BEM element", () => {
      expect(isValidBemObject({ blk: "blk", elt: "1" }));
    });

    test("'mod' property is not valid BEM modifier", () => {
      expect(isValidBemObject({ blk: "blk", mod: ["1"] })).toBe(false);
      expect(isValidBemObject({ blk: "blk", mod: ["mod", "foo--bar"] })).toBe(
        false
      );
    });
  });

  describe("returns true when", () => {
    test("'blk' is valid BEM block and no 'elt' and 'mod' provided", () => {
      expect(isValidBemObject({ blk: "blk" })).toBe(true);
    });

    test("'blk' is valid BEM block, 'elt' is valid BEM element and no 'mod' is provided", () => {
      expect(isValidBemObject({ blk: "blk", elt: "elt" })).toBe(true);
    });

    test("'blk' is valid BEM block, 'elt' is valid BEM element and 'mod' is valid BEM modifier", () => {
      expect(
        isValidBemObject({ blk: "blk", elt: "elt", mod: ["modNam"] })
      ).toBe(true);
      expect(
        isValidBemObject({ blk: "blk", elt: "elt", mod: ["modNam", "modVal"] })
      ).toBe(true);
    });
  });
});

describe("validateBemString()", () => {
  test("returns error message when value is an empty string", () => {
    expect(is(validateBemString(""))).toBe("string");
  });

  test("returns error message when value is a blank string", () => {
    expect(is(validateBemString(" "))).toBe("string");
    expect(is(validateBemString("\t"))).toBe("string");
  });

  test("returns error message when value have more than one BEM modifier parts", () => {
    expect(is(validateBemString("blk--mod1--mod2_2"))).toBe("string");
  });

  test("returns error message when value's BEM modifier part have more than one BEM modifier values", () => {
    expect(is(validateBemString("blk--mod_a_b"))).toBe("string");
  });

  test("returns error message when value's BEM modifier part have not valid BEM modifier name", () => {
    expect(is(validateBemString("blk--mod@name_val"))).toBe("string");
  });

  test("returns error message when value's BEM modifier part have not valid BEM modifier value", () => {
    expect(is(validateBemString("blk--mod-name_val-"))).toBe("string");
  });

  test("returns error message when value have more than one BEM element parts", () => {
    expect(is(validateBemString("blk__elt1__elt2__elt3"))).toBe("string");
  });

  test("returns error message when value's BEM element part is not valid BEM element", () => {
    expect(is(validateBemString("blk__elt2-"))).toBe("string");
  });

  test("returns error message when value's BEM block part is not valid BEM block", () => {
    expect(is(validateBemString("blk-"))).toBe("string");
    expect(is(validateBemString("1blk"))).toBe("string");
    expect(is(validateBemString("blk_1"))).toBe("string");
  });

  test("returns null when value is valid BEM string", () => {
    expect(validateBemString("blk")).toBeNull();
    expect(validateBemString("blk__elt")).toBeNull();
    expect(validateBemString("blk--mod")).toBeNull();
    expect(validateBemString("blk__elt--mod")).toBeNull();
    expect(validateBemString("blk--mod-name_mod-value")).toBeNull();
    expect(validateBemString("blk__elt--mod-name_mod-value")).toBeNull();
  });
});
