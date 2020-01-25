import is from "@sindresorhus/is";

import {
  validateBemModifier,
  validateBemName,
  validateBemObject,
  validateBemString,
  validateBemStructure,
  validateBemValue,
  validateBemVector
} from "../bem";
import { ValidationResult } from "../utils";

function expectIsValid(v: ValidationResult): void {
  expect(v).toBeNull();
}

function expectIsNotValid(v: ValidationResult): void {
  expect(is.string(v)).toBe(true);
}

describe("validateBemName()", () => {
  test("returns false when value is a string that starts not with a letter", () => {
    expectIsNotValid(validateBemName("1"));
  });

  test("returns false when value is a string that ends with not a letter or a digit", () => {
    expectIsNotValid(validateBemName("a1-"));
  });

  test("returns false when value is a string but not an alpha-numeric-dashed string", () => {
    expectIsNotValid(validateBemName("a__1"));
    expectIsNotValid(validateBemName("a@1"));
  });

  test("returns false when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    expectIsNotValid(validateBemName("some--thing"));
  });

  test("returns true when value meet all criteria of valid BEM name", () => {
    expectIsValid(validateBemName("name"));
    expectIsValid(validateBemName("name-with-dashes"));
    expectIsValid(validateBemName("name-that-ends-with-digit-1"));
  });
});

describe("validateBemValue()", () => {
  test("returns false when value is a string that ends with not a letter or a digit", () => {
    expectIsNotValid(validateBemValue("a1-"));
  });

  test("returns false when value is a string but not an alpha-numeric-dashed string", () => {
    expectIsNotValid(validateBemValue("a__1"));
    expectIsNotValid(validateBemValue("a@1"));
  });

  test("returns false when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    expectIsNotValid(validateBemValue("some--thing"));
  });

  test("returns true when value meet all criteria of valid BEM name", () => {
    expectIsValid(validateBemValue("1"));
    expectIsValid(validateBemValue("value"));
    expectIsValid(validateBemValue("value-with-dashes"));
    expectIsValid(validateBemValue("value-that-ends-with-digit-1"));
    expectIsValid(validateBemValue("2-value-that-ends-with-digit"));
  });
});

describe("validateBemModifier()", () => {
  test("returns false when value is an array but its first element is not valid BEM name", () => {
    expectIsNotValid(validateBemModifier(["1"]));
  });

  test("returns false when value is an array but its second element is not a nil or valid BEM value", () => {
    expectIsNotValid(validateBemModifier(["fiz", ""]));
    expectIsNotValid(validateBemModifier(["fiz", " "]));
    expectIsNotValid(validateBemModifier(["fiz", "\t"]));
    expectIsNotValid(validateBemModifier(["fiz", "-buz"]));
    expectIsNotValid(validateBemModifier(["fiz", "buz-"]));
    expectIsNotValid(validateBemModifier(["fiz", "biz--buz"]));
  });

  test("returns true when value is a BEM modifier", () => {
    expectIsValid(validateBemModifier(["fiz"]));
    expectIsValid(validateBemModifier(["fiz", undefined]));
    expectIsValid(validateBemModifier(["fiz", "1"]));
    expectIsValid(validateBemModifier(["fiz", "buz"]));
    expectIsValid(validateBemModifier(["fiz", "biz-buz"]));
  });
});

describe("validateBemObject()", () => {
  describe("returns false when", () => {
    test("'blk' property is not valid BEM block", () => {
      expectIsNotValid(validateBemObject({ blk: "1" }));
    });

    test("'elt' property is not valid BEM element", () => {
      expectIsNotValid(validateBemObject({ blk: "blk", elt: "1" }));
    });

    test("'mod' property is not valid BEM modifier", () => {
      expectIsNotValid(validateBemObject({ blk: "blk", mod: ["1"] }));
      expectIsNotValid(
        validateBemObject({ blk: "blk", mod: ["mod", "foo--bar"] })
      );
    });
  });

  describe("returns true when", () => {
    test("'blk' is valid BEM block and no 'elt' and 'mod' provided", () => {
      expectIsValid(validateBemObject({ blk: "blk" }));
    });

    test("'blk' is valid BEM block, 'elt' is valid BEM element and no 'mod' is provided", () => {
      expectIsValid(validateBemObject({ blk: "blk", elt: "elt" }));
    });

    test("'blk' is valid BEM block, 'elt' is valid BEM element and 'mod' is valid BEM modifier", () => {
      expectIsValid(
        validateBemObject({ blk: "blk", elt: "elt", mod: ["modNam"] })
      );
      expectIsValid(
        validateBemObject({ blk: "blk", elt: "elt", mod: ["modNam", "modVal"] })
      );
    });
  });
});

describe("validateBemObject()", () => {
  test("returns error message when value's block part is not valid BEM block", () => {
    expectIsNotValid(validateBemObject({ blk: "1" }));
  });

  test("returns error message when value's element part is provided but not valid BEM element", () => {
    expectIsNotValid(validateBemObject({ blk: "block", elt: "1" }));
  });

  test("returns error message when value's modifier part is provided but not valid BEM modifier", () => {
    expectIsNotValid(
      validateBemObject({ blk: "block", elt: "elt", mod: ["1"] })
    );
    expectIsNotValid(
      validateBemObject({
        blk: "block",
        elt: "elt",
        mod: ["modName", "foo--bar"]
      })
    );
  });

  test("returns null when value is valid BEM string", () => {
    expectIsValid(validateBemObject({ blk: "blk" }));
    expectIsValid(validateBemObject({ blk: "blk", elt: "elt" }));
    expectIsValid(validateBemObject({ blk: "blk", mod: ["mod"] }));
    expectIsValid(validateBemObject({ blk: "blk", elt: "elt", mod: ["mod"] }));
    expectIsValid(
      validateBemObject({ blk: "blk", mod: ["modName", "modValue"] })
    );
    expectIsValid(
      validateBemObject({
        blk: "blk",
        elt: "elt",
        mod: ["modName", "modValue"]
      })
    );
  });
});

describe("validateBemString()", () => {
  test("returns error message when value is an empty string", () => {
    expectIsNotValid(validateBemString(""));
  });

  test("returns error message when value is a blank string", () => {
    expectIsNotValid(validateBemString(" "));
    expectIsNotValid(validateBemString("\t"));
  });

  test("returns error message when value have more than one BEM modifier parts", () => {
    expectIsNotValid(validateBemString("blk--mod1--mod2_2"));
  });

  test("returns error message when value's BEM modifier part have more than one BEM modifier values", () => {
    expectIsNotValid(validateBemString("blk--mod_a_b"));
  });

  test("returns error message when value's BEM modifier part have not valid BEM modifier name", () => {
    expectIsNotValid(validateBemString("blk--mod@name_val"));
  });

  test("returns error message when value's BEM modifier part have not valid BEM modifier value", () => {
    expectIsNotValid(validateBemString("blk--mod-name_val-"));
  });

  test("returns error message when value have more than one BEM element parts", () => {
    expectIsNotValid(validateBemString("blk__elt1__elt2__elt3"));
  });

  test("returns error message when value's BEM element part is not valid BEM element", () => {
    expectIsNotValid(validateBemString("blk__elt2-"));
  });

  test("returns error message when value's BEM block part is not valid BEM block", () => {
    expectIsNotValid(validateBemString("blk-"));
    expectIsNotValid(validateBemString("1blk"));
    expectIsNotValid(validateBemString("blk_1"));
  });

  test("returns null when value is valid BEM string", () => {
    expectIsValid(validateBemString("blk"));
    expectIsValid(validateBemString("blk__elt"));
    expectIsValid(validateBemString("blk--mod"));
    expectIsValid(validateBemString("blk__elt--mod"));
    expectIsValid(validateBemString("blk--mod-name_mod-value"));
    expectIsValid(validateBemString("blk__elt--mod-name_mod-value"));
  });
});

describe("validateBemVector()", () => {
  test("returns error message when value's block part is not valid BEM block", () => {
    expectIsNotValid(validateBemVector(["1"]));
  });

  test("returns error message when value's element part is provided but not valid BEM element", () => {
    expectIsNotValid(validateBemVector(["block", "1"]));
  });

  test("returns error message when value's modifier part is provided but not valid BEM modifier", () => {
    expectIsNotValid(validateBemVector(["block", "elt", ["1"]]));
    expectIsNotValid(
      validateBemVector(["block", "elt", ["modName", "foo--bar"]])
    );
  });

  test("returns null when value is valid BEM string", () => {
    expectIsValid(validateBemVector(["blk"]));
    expectIsValid(validateBemVector(["blk", "elt"]));
    expectIsValid(validateBemVector(["blk", undefined, ["mod"]]));
    expectIsValid(validateBemVector(["blk", "elt", ["mod"]]));
    expectIsValid(
      validateBemVector(["blk", undefined, ["modName", "modValue"]])
    );
    expectIsValid(validateBemVector(["blk", "elt", ["modName", "modValue"]]));
  });
});

describe("validateBemStructure()", () => {
  test("validates BEM string", () => {
    expectIsNotValid(validateBemStructure("1"));
    expectIsValid(validateBemStructure("block__elt--mod"));
  });

  test("validates BEM vector", () => {
    expectIsNotValid(validateBemStructure(["block", "1"]));
    expectIsValid(validateBemStructure(["block", "elt", ["mod"]]));
  });

  test("validates BEM object", () => {
    expectIsNotValid(
      validateBemStructure({ blk: "blk", elt: "1", mod: ["mod"] })
    );
    expectIsValid(
      validateBemStructure({ blk: "blk", elt: "elt", mod: ["mod"] })
    );
  });
});
