import {
  BemObject,
  BemVector,
  toBemObject,
  toBemString,
  toBemVector,
  validateBemBlock,
  validateBemModifier,
  validateBemName,
  validateBemObject,
  validateBemString,
  validateBemStructure,
  validateBemValue,
  validateBemVector
} from "../bem";
import { ValidationResult } from "../utils";

function expectValidationFailure(v: ValidationResult, error?: string): void {
  expect(v.valid).toBe(false);

  if (error != undefined) {
    expect(v.error).toEqual(error);
  }
}

function expectValidationSuccess(v: ValidationResult): void {
  expect(v.valid).toBe(true);
}

describe("validateBemName()", () => {
  test("validation fails when value is a string that starts not with a letter", () => {
    expectValidationFailure(
      validateBemName("1"),
      "BEM name does not conform constraints"
    );
  });

  test("validation fails when value is a string that ends with not a letter or a digit", () => {
    expectValidationFailure(validateBemName("a1-"));
  });

  test("validation fails when value is a string but not an alpha-numeric-dashed string", () => {
    expectValidationFailure(validateBemName("a__1"));
    expectValidationFailure(validateBemName("a@1"));
  });

  test("validation fails when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    expectValidationFailure(validateBemName("some--thing"));
  });

  test("validation passes when value meet all criteria of valid BEM name", () => {
    expectValidationSuccess(validateBemName("name"));
    expectValidationSuccess(validateBemName("name-with-dashes"));
    expectValidationSuccess(validateBemName("name-that-ends-with-digit-1"));
  });
});

describe("validateBemValue()", () => {
  test("validation fails when value is a string that ends with not a letter or a digit", () => {
    expectValidationFailure(validateBemValue("a1-"));
  });

  test("validation fails when value is a string but not an alpha-numeric-dashed string", () => {
    expectValidationFailure(validateBemValue("a__1"));
    expectValidationFailure(validateBemValue("a@1"));
  });

  test("validation fails when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    expectValidationFailure(validateBemValue("some--thing"));
  });

  test("validation passes when value meet all criteria of valid BEM name", () => {
    expectValidationSuccess(validateBemValue("1"));
    expectValidationSuccess(validateBemValue("value"));
    expectValidationSuccess(validateBemValue("value-with-dashes"));
    expectValidationSuccess(validateBemValue("value-that-ends-with-digit-1"));
    expectValidationSuccess(validateBemValue("2-value-that-ends-with-digit"));
  });
});

describe("validateBemBlock()", () => {
  test("validation fails when value is not valid BEM name", () => {
    expectValidationFailure(
      validateBemBlock("1"),
      "BEM block does not conform constraints"
    );
  });
});

describe("validateBemModifier()", () => {
  test("validation fails when value is an array but its first element is not valid BEM name", () => {
    expectValidationFailure(validateBemModifier(["1"]));
  });

  test("validation fails when value is an array but its second element is not a nil or valid BEM value", () => {
    expectValidationFailure(validateBemModifier(["fiz", ""]));
    expectValidationFailure(validateBemModifier(["fiz", " "]));
    expectValidationFailure(validateBemModifier(["fiz", "\t"]));
    expectValidationFailure(validateBemModifier(["fiz", "-buz"]));
    expectValidationFailure(validateBemModifier(["fiz", "buz-"]));
    expectValidationFailure(validateBemModifier(["fiz", "biz--buz"]));
  });

  test("validation passes when value is a BEM modifier", () => {
    expectValidationSuccess(validateBemModifier(["fiz"]));
    expectValidationSuccess(validateBemModifier(["fiz", undefined]));
    expectValidationSuccess(validateBemModifier(["fiz", "1"]));
    expectValidationSuccess(validateBemModifier(["fiz", "buz"]));
    expectValidationSuccess(validateBemModifier(["fiz", "biz-buz"]));
  });
});

describe("validateBemObject()", () => {
  describe("validation fails when", () => {
    test("'blk' property is not valid BEM block", () => {
      expectValidationFailure(validateBemObject({ blk: "1" }));
    });

    test("'elt' property is not valid BEM element", () => {
      expectValidationFailure(validateBemObject({ blk: "blk", elt: "1" }));
    });

    test("'mod' property is not valid BEM modifier", () => {
      expectValidationFailure(validateBemObject({ blk: "blk", mod: ["1"] }));
      expectValidationFailure(
        validateBemObject({ blk: "blk", mod: ["mod", "foo--bar"] })
      );
    });
  });

  describe("validation passes when", () => {
    test("'blk' is valid BEM block and no 'elt' and 'mod' provided", () => {
      expectValidationSuccess(validateBemObject({ blk: "blk" }));
    });

    test("'blk' is valid BEM block, 'elt' is valid BEM element and no 'mod' is provided", () => {
      expectValidationSuccess(validateBemObject({ blk: "blk", elt: "elt" }));
    });

    test("'blk' is valid BEM block, 'elt' is valid BEM element and 'mod' is valid BEM modifier", () => {
      expectValidationSuccess(
        validateBemObject({ blk: "blk", elt: "elt", mod: ["modNam"] })
      );
      expectValidationSuccess(
        validateBemObject({ blk: "blk", elt: "elt", mod: ["modNam", "modVal"] })
      );
    });
  });
});

describe("validateBemObject()", () => {
  test("validation fails when value's block part is not valid BEM block", () => {
    expectValidationFailure(validateBemObject({ blk: "1" }));
  });

  test("validation fails when value's element part is provided but not valid BEM element", () => {
    expectValidationFailure(validateBemObject({ blk: "block", elt: "1" }));
  });

  test("validation fails when value's modifier part is provided but not valid BEM modifier", () => {
    expectValidationFailure(
      validateBemObject({ blk: "block", elt: "elt", mod: ["1"] })
    );
    expectValidationFailure(
      validateBemObject({
        blk: "block",
        elt: "elt",
        mod: ["modName", "foo--bar"]
      })
    );
  });

  test("validation passes when value is valid BEM string", () => {
    expectValidationSuccess(validateBemObject({ blk: "blk" }));
    expectValidationSuccess(validateBemObject({ blk: "blk", elt: "elt" }));
    expectValidationSuccess(validateBemObject({ blk: "blk", mod: ["mod"] }));
    expectValidationSuccess(
      validateBemObject({ blk: "blk", elt: "elt", mod: ["mod"] })
    );
    expectValidationSuccess(
      validateBemObject({ blk: "blk", mod: ["modName", "modValue"] })
    );
    expectValidationSuccess(
      validateBemObject({
        blk: "blk",
        elt: "elt",
        mod: ["modName", "modValue"]
      })
    );
  });
});

describe("validateBemString()", () => {
  test("validation fails when value is an empty string", () => {
    expectValidationFailure(validateBemString(""));
  });

  test("validation fails when value is a blank string", () => {
    expectValidationFailure(validateBemString(" "));
    expectValidationFailure(validateBemString("\t"));
  });

  test("validation fails when value have more than one BEM modifier parts", () => {
    expectValidationFailure(validateBemString("blk--mod1--mod2_2"));
  });

  test("validation fails when value's BEM modifier part have more than one BEM modifier values", () => {
    expectValidationFailure(validateBemString("blk--mod_a_b"));
  });

  test("validation fails when value's BEM modifier part have not valid BEM modifier name", () => {
    expectValidationFailure(validateBemString("blk--mod@name_val"));
  });

  test("validation fails when value's BEM modifier part have not valid BEM modifier value", () => {
    expectValidationFailure(validateBemString("blk--mod-name_val-"));
  });

  test("validation fails when value have more than one BEM element parts", () => {
    expectValidationFailure(validateBemString("blk__elt1__elt2__elt3"));
  });

  test("validation fails when value's BEM element part is not valid BEM element", () => {
    expectValidationFailure(validateBemString("blk__elt2-"));
  });

  test("validation fails when value's BEM block part is not valid BEM block", () => {
    expectValidationFailure(validateBemString("blk-"));
    expectValidationFailure(validateBemString("1blk"));
    expectValidationFailure(validateBemString("blk_1"));
  });

  test("validation passes when value is valid BEM string", () => {
    expectValidationSuccess(validateBemString("blk"));
    expectValidationSuccess(validateBemString("blk__elt"));
    expectValidationSuccess(validateBemString("blk--mod"));
    expectValidationSuccess(validateBemString("blk__elt--mod"));
    expectValidationSuccess(validateBemString("blk--mod-name_mod-value"));
    expectValidationSuccess(validateBemString("blk__elt--mod-name_mod-value"));
  });
});

describe("validateBemVector()", () => {
  test("validation fails when value's block part is not valid BEM block", () => {
    expectValidationFailure(validateBemVector(["1"]));
  });

  test("validation fails when value's element part is provided but not valid BEM element", () => {
    expectValidationFailure(validateBemVector(["block", "1"]));
  });

  test("validation fails when value's modifier part is provided but not valid BEM modifier", () => {
    expectValidationFailure(validateBemVector(["block", "elt", ["1"]]));
    expectValidationFailure(
      validateBemVector(["block", "elt", ["modName", "foo--bar"]])
    );
  });

  test("validation passes when value is valid BEM string", () => {
    expectValidationSuccess(validateBemVector(["blk"]));
    expectValidationSuccess(validateBemVector(["blk", "elt"]));
    expectValidationSuccess(validateBemVector(["blk", undefined, ["mod"]]));
    expectValidationSuccess(validateBemVector(["blk", "elt", ["mod"]]));
    expectValidationSuccess(
      validateBemVector(["blk", undefined, ["modName", "modValue"]])
    );
    expectValidationSuccess(
      validateBemVector(["blk", "elt", ["modName", "modValue"]])
    );
  });
});

describe("validateBemStructure()", () => {
  test("validates BEM string", () => {
    expectValidationFailure(validateBemStructure("1"));
    expectValidationSuccess(validateBemStructure("block__elt--mod"));
  });

  test("validates BEM vector", () => {
    expectValidationFailure(validateBemStructure(["block", "1"]));
    expectValidationSuccess(validateBemStructure(["block", "elt", ["mod"]]));
  });

  test("validates BEM object", () => {
    expectValidationFailure(
      validateBemStructure({ blk: "blk", elt: "1", mod: ["mod"] })
    );
    expectValidationSuccess(
      validateBemStructure({ blk: "blk", elt: "elt", mod: ["mod"] })
    );
  });
});

describe("toBemObject()", () => {
  const bemObj: BemObject = {
    blk: "foo",
    elt: "bar",
    mod: ["fiz", "buz"]
  };

  test("returns BEM object as-is", () => {
    expect(toBemObject(bemObj)).toBe(bemObj);
  });

  test("converts BEM string to BEM object", () => {
    expect(toBemObject("foo__bar--fiz_buz")).toEqual(bemObj);
  });

  test("converts BEM vector to BEM object", () => {
    expect(toBemObject(["foo", "bar", ["fiz", "buz"]])).toEqual(bemObj);
  });
});

describe("toBemString()", () => {
  const bemStr = "foo__bar--fiz_buz";

  test("returns BEM string as-is", () => {
    expect(toBemString(bemStr)).toBe(bemStr);
  });

  test("converts BEM object to BEM string", () => {
    expect(
      toBemString({ blk: "foo", elt: "bar", mod: ["fiz", "buz"] })
    ).toEqual(bemStr);
  });

  test("converts BEM vector to BEM string", () => {
    expect(toBemString(["foo", "bar", ["fiz", "buz"]])).toEqual(bemStr);
  });
});

describe("toBemVector()", () => {
  const bemVec: BemVector = ["foo", "bar", ["fiz", "buz"]];

  test("returns BEM vector as-is", () => {
    expect(toBemVector(bemVec)).toBe(bemVec);
  });

  test("converts BEM object to BEM vector", () => {
    expect(
      toBemVector({ blk: "foo", elt: "bar", mod: ["fiz", "buz"] })
    ).toEqual(bemVec);
  });

  test("converts BEM string to BEM vector", () => {
    expect(toBemVector("foo__bar--fiz_buz")).toEqual(bemVec);
  });
});
