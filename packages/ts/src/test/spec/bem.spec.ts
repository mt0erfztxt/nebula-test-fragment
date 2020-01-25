import {
  BemBase,
  BemModifier,
  BemModifierRequirement,
  BemObject,
  BemString,
  BemVector,
  toBemObject,
  toBemString,
  toBemVector,
  validateBemBlock,
  validateBemModifier,
  validateBemModifierRequirement,
  validateBemName,
  validateBemObject,
  validateBemString,
  validateBemStructure,
  validateBemValue,
  validateBemVector
} from "../../main/bem";

describe("validateBemName()", () => {
  const error = "BEM name does not conform constraints";

  it("validation fails when value is a blank string", () => {
    expect(validateBemName("")).toEqual({ error, value: "" });
    expect(validateBemName(" ")).toEqual({ error, value: " " });
  });

  it("validation fails when value is a string that starts not with a letter", () => {
    const value = "1";
    expect(validateBemName(value)).toEqual({ error, value });
  });

  it("validation fails when value is a string that ends with not a letter or a digit", () => {
    const value = "a1-";
    expect(validateBemName(value)).toEqual({ error, value });
  });

  it("validation fails when value is a string but not an alpha-numeric-dashed string", () => {
    for (const value of ["a__1", "a@1"]) {
      expect(validateBemName(value)).toEqual({ error, value });
    }
  });

  it("validation fails when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    const value = "some--thing";
    expect(validateBemName(value)).toEqual({ error, value });
  });

  it("validation passes when value meet all criteria of valid BEM name", () => {
    for (const value of [
      "name",
      "name-with-dashes",
      "name-that-ends-with-digit-1"
    ]) {
      expect(validateBemName(value)).toEqual({ value });
    }
  });
});

describe("validateBemValue()", () => {
  const error = "BEM value does not conform constraints";

  it("validation fails when value is a blank string", () => {
    expect(validateBemValue("")).toEqual({ error, value: "" });
    expect(validateBemValue(" ")).toEqual({ error, value: " " });
  });

  it("validation fails when value is a string that ends with not a letter or a digit", () => {
    const value = "a1-";
    expect(validateBemValue(value)).toEqual({ error, value });
  });

  it("validation fails when value is a string but not an alpha-numeric-dashed string", () => {
    for (const value of ["a__1", "a@1"]) {
      expect(validateBemValue(value)).toEqual({ error, value });
    }
  });

  it("validation fails when value is an alpha-numeric-dashed string but have sibling dashes", () => {
    const value = "some--thing";
    expect(validateBemValue(value)).toEqual({ error, value });
  });

  it("validation passes when value meet all criteria of valid BEM name", () => {
    for (const value of [
      "1",
      "value",
      "value-with-dashes",
      "value-that-ends-with-digit-1",
      "2-value-that-ends-with-digit"
    ]) {
      expect(validateBemValue(value)).toEqual({ value });
    }
  });
});

describe("validateBemBlock()", () => {
  const error = "BEM block does not conform constraints";

  it("validation fails when value is not valid BEM name", () => {
    const value = "1";
    expect(validateBemBlock(value)).toEqual({ error, value });
  });
});

describe("validateBemModifier()", () => {
  it("validation fails when value is an array but its first element is not valid BEM name", () => {
    const error = "BEM modifier's name must be valid BEM name";
    const value: BemModifier = ["1"];
    expect(validateBemModifier(value)).toEqual({
      error,
      value
    });
  });

  it("validation fails when value is an array but its second element is not valid BEM value", () => {
    const input: BemModifier[] = [
      ["fiz", ""],
      ["fiz", " "],
      ["fiz", "-buz"],
      ["fiz", "buz-"],
      ["fiz", "biz--buz"]
    ];
    for (const value of input) {
      expect(validateBemModifier(value)).toEqual({
        error:
          "BEM modifier's value is optional but must be valid BEM value when provided",
        value
      });
    }
  });

  it("validation passes when value is a BEM modifier", () => {
    const input: BemModifier[] = [
      ["fiz"],
      ["fiz", undefined],
      ["fiz", "1"],
      ["fiz", "buz"],
      ["fiz", "biz-buz"]
    ];
    for (const value of input) {
      expect(validateBemModifier(value)).toEqual({ value });
    }
  });
});

describe("validateBemModifierRequirement()", () => {
  it("fails when value is an array but its first element is not valid BEM name", () => {
    const error = "BEM modifier's name must be valid BEM name";
    const value: BemModifierRequirement = ["1"];
    expect(validateBemModifierRequirement(value)).toEqual({
      error,
      value
    });
  });

  it("fails when value is an array but its second element is not valid BEM value", () => {
    const input: BemModifierRequirement[] = [
      ["fiz", ""],
      ["fiz", " "],
      ["fiz", "-buz"],
      ["fiz", "buz-"],
      ["fiz", "biz--buz"]
    ];
    for (const value of input) {
      expect(validateBemModifierRequirement(value)).toEqual({
        error:
          "BEM modifier's value is optional but must be valid BEM value when provided",
        value
      });
    }
  });

  it("succeeds when value is a BEM modifier requirement", () => {
    const input: [BemModifierRequirement, BemModifierRequirement][] = [
      [["fiz"], ["fiz", undefined, false]],
      [
        ["fiz", undefined],
        ["fiz", undefined, false]
      ],
      [
        ["fiz", undefined, true],
        ["fiz", undefined, true]
      ],
      [
        ["fiz", "1"],
        ["fiz", "1", false]
      ],
      [
        ["fiz", "buz"],
        ["fiz", "buz", false]
      ],
      [
        ["fiz", "biz-buz"],
        ["fiz", "biz-buz", false]
      ],
      [
        ["fiz", "biz-buz", false],
        ["fiz", "biz-buz", false]
      ]
    ];
    for (const [value, result] of input) {
      expect(validateBemModifierRequirement(value)).toEqual({ value: result });
    }
  });
});

describe("validateBemObject()", () => {
  describe("validation fails when", () => {
    it("'blk' property is not valid BEM block", () => {
      const value = { blk: "1" };
      expect(validateBemObject(value)).toEqual({
        error: "BEM object -- BEM block does not conform constraints",
        value
      });
    });

    it("'elt' property is not valid BEM element", () => {
      const value = { blk: "blk", elt: "1" };
      expect(validateBemObject(value)).toEqual({
        error: "BEM object -- BEM element does not conform constraints",
        value
      });
    });

    it("'mod' property is not valid BEM modifier", () => {
      const values: [BemObject, string][] = [
        [
          { blk: "blk", mod: ["1"] },
          "BEM object -- BEM modifier's name must be valid BEM name"
        ],
        [
          { blk: "blk", mod: ["mod", "foo--bar"] },
          "BEM object -- BEM modifier's value is optional but must be valid BEM value when provided"
        ]
      ];
      for (const [value, error] of values) {
        expect(validateBemObject(value)).toEqual({
          error,
          value
        });
      }
    });
  });

  describe("validation passes when", () => {
    it("'blk' is valid BEM block and no 'elt' and 'mod' provided", () => {
      const value = { blk: "blk" };
      expect(validateBemObject(value)).toEqual({ value });
    });

    it("'blk' is valid BEM block, 'elt' is valid BEM element and no 'mod' is provided", () => {
      const value = { blk: "blk", elt: "elt" };
      expect(validateBemObject(value)).toEqual({ value });
    });

    it("'blk' is valid BEM block, 'elt' is valid BEM element and 'mod' is valid BEM modifier", () => {
      const values: BemObject[] = [
        { blk: "blk", elt: "elt", mod: ["modNam"] },
        { blk: "blk", elt: "elt", mod: ["modNam", "modVal"] }
      ];
      for (const value of values) {
        expect(validateBemObject(value)).toEqual({ value });
      }
    });
  });
});

describe("validateBemString()", () => {
  it("validation fails when value is a blank string", () => {
    const values: BemString[] = ["", " ", "\t"];
    for (const value of values) {
      expect(validateBemString(value)).toEqual({
        error: "BEM string -- must have at least block part",
        value
      });
    }
  });

  it("validation fails when value have more than one BEM modifier parts", () => {
    const value = "blk--mod1--mod2_2";
    expect(validateBemString(value)).toEqual({
      error:
        "BEM string -- can have only one modifier but '2' of them found -- mod1, mod2_2",
      value
    });
  });

  it("validation fails when value's BEM modifier part have more than one BEM modifier values", () => {
    const value = "blk--mod_a_b";
    expect(validateBemString(value)).toEqual({
      error:
        "BEM string -- modifier can have only one value but '2' of them found -- a, b",
      value
    });
  });

  it("validation fails when value's BEM modifier part have not valid BEM modifier name", () => {
    const value = "blk--mod@name_val";
    expect(validateBemString(value)).toEqual({
      error:
        "BEM string -- modifier's name must be a valid BEM name -- mod@name",
      value
    });
  });

  it("validation fails when value's BEM modifier part have not valid BEM modifier value", () => {
    const value = "blk--mod-name_val-";
    expect(validateBemString(value)).toEqual({
      error:
        "BEM string -- modifier's value is optional but must be valid BEM value when provided -- val-",
      value
    });
  });

  it("validation fails when value have more than one BEM element parts", () => {
    const value = "blk__elt1__elt2__elt3";
    expect(validateBemString(value)).toEqual({
      error:
        "BEM string -- only one element allowed but '3' of them found -- elt1, elt2, elt3",
      value
    });
  });

  it("validation fails when value's BEM element part is not valid BEM element", () => {
    const value = "blk__elt2-";
    expect(validateBemString(value)).toEqual({
      error: "BEM string -- element must be valid BEM name -- elt2-",
      value
    });
  });

  it("validation fails when value's BEM block part is not valid BEM block", () => {
    const values: [BemString, string][] = [
      ["blk-", "BEM string -- block must be valid BEM name -- blk-"],
      ["1blk", "BEM string -- block must be valid BEM name -- 1blk"],
      ["blk_1", "BEM string -- block must be valid BEM name -- blk_1"]
    ];
    for (const [value, error] of values) {
      expect(validateBemString(value)).toEqual({
        error,
        value
      });
    }
  });

  it("validation passes when value is valid BEM string", () => {
    const values: BemString[] = [
      "blk",
      "blk__elt",
      "blk--mod",
      "blk__elt--mod",
      "blk--mod-name_mod-value",
      "blk__elt--mod-name_mod-value"
    ];
    for (const value of values) {
      expect(validateBemString(value)).toEqual({ value });
    }
  });
});

describe("validateBemVector()", () => {
  it("validation fails when value's block part is not valid BEM block", () => {
    const value: BemVector = ["1"];
    expect(validateBemVector(value)).toEqual({
      error: "BEM vector -- BEM block does not conform constraints",
      value
    });
  });

  it("validation fails when value's element part is provided but not valid BEM element", () => {
    const value: BemVector = ["block", "1"];
    expect(validateBemVector(value)).toEqual({
      error: "BEM vector -- BEM element does not conform constraints",
      value
    });
  });

  it("validation fails when value's modifier part is provided but not valid BEM modifier", () => {
    const values: [BemVector, string][] = [
      [
        ["block", "elt", ["1"]],
        "BEM vector -- BEM modifier's name must be valid BEM name"
      ],
      [
        ["block", "elt", ["modName", "foo--bar"]],
        "BEM vector -- BEM modifier's value is optional but must be valid BEM value when provided"
      ]
    ];
    for (const [value, error] of values) {
      expect(validateBemVector(value)).toEqual({
        error,
        value
      });
    }
  });

  it("validation passes when value is valid BEM string", () => {
    const values: BemVector[] = [
      ["blk"],
      ["blk", "elt"],
      ["blk", undefined, ["mod"]],
      ["blk", "elt", ["mod"]],
      ["blk", undefined, ["modName", "modValue"]],
      ["blk", "elt", ["modName", "modValue"]]
    ];
    for (const value of values) {
      expect(validateBemVector(value)).toEqual({ value });
    }
  });
});

describe("validateBemStructure()", () => {
  it("validates BEM string", () => {
    expect(validateBemStructure("1")).toEqual({
      error: "BEM string -- block must be valid BEM name -- 1",
      value: "1"
    });
    expect(validateBemStructure("block__elt--mod")).toEqual({
      value: "block__elt--mod"
    });
  });

  it("validates BEM vector", () => {
    expect(validateBemStructure(["block", "1"])).toEqual({
      error: "BEM vector -- BEM element does not conform constraints",
      value: ["block", "1"]
    });
    expect(validateBemStructure(["block", "elt", ["mod"]])).toEqual({
      value: ["block", "elt", ["mod"]]
    });
  });

  it("validates BEM object", () => {
    expect(
      validateBemStructure({ blk: "blk", elt: "1", mod: ["mod"] })
    ).toEqual({
      error: "BEM object -- BEM element does not conform constraints",
      value: { blk: "blk", elt: "1", mod: ["mod"] }
    });
    expect(
      validateBemStructure({ blk: "blk", elt: "elt", mod: ["mod"] })
    ).toEqual({ value: { blk: "blk", elt: "elt", mod: ["mod"] } });
  });
});

describe("toBemObject()", () => {
  const bemObj: BemObject = {
    blk: "foo",
    elt: "bar",
    mod: ["fiz", "buz"]
  };

  it("returns BEM object as-is", () => {
    expect(toBemObject(bemObj)).toBe(bemObj);
  });

  it("converts BEM string to BEM object", () => {
    expect(toBemObject("foo__bar--fiz_buz")).toEqual(bemObj);
  });

  it("converts BEM vector to BEM object", () => {
    expect(toBemObject(["foo", "bar", ["fiz", "buz"]])).toEqual(bemObj);
  });
});

describe("toBemString()", () => {
  const bemStr = "foo__bar--fiz_buz";

  it("returns BEM string as-is", () => {
    expect(toBemString(bemStr)).toBe(bemStr);
  });

  it("converts BEM object to BEM string", () => {
    expect(
      toBemString({ blk: "foo", elt: "bar", mod: ["fiz", "buz"] })
    ).toEqual(bemStr);
  });

  it("converts BEM vector to BEM string", () => {
    expect(toBemString(["foo", "bar", ["fiz", "buz"]])).toEqual(bemStr);
  });
});

describe("toBemVector()", () => {
  const bemVec: BemVector = ["foo", "bar", ["fiz", "buz"]];

  it("returns BEM vector as-is", () => {
    expect(toBemVector(bemVec)).toBe(bemVec);
  });

  it("converts BEM object to BEM vector", () => {
    expect(
      toBemVector({ blk: "foo", elt: "bar", mod: ["fiz", "buz"] })
    ).toEqual(bemVec);
  });

  it("converts BEM string to BEM vector", () => {
    expect(toBemVector("foo__bar--fiz_buz")).toEqual(bemVec);
  });
});

describe("BemBase class", () => {
  describe("#blk getter", () => {
    it("returns block part of instance", () => {
      expect(new BemBase("foo").blk).toEqual("foo");
    });
  });

  describe("#blk setter", () => {
    it("throws when instance is frozen", () => {
      const bemBase = new BemBase("foo").freeze();
      expect(() => (bemBase.blk = "fiz")).toThrowError(/is frozen/);
    });

    it("throws on invalid value", () => {
      const bemBase = new BemBase("foo");
      expect(() => (bemBase.blk = "1")).toThrowError(/BEM block/);
    });

    it("sets new value", () => {
      const bemBase = new BemBase("foo");
      bemBase.blk = "fiz";
      expect(bemBase.blk).toEqual("fiz");
    });
  });

  describe("#setBlk()", () => {
    it("sets new value and returns this", () => {
      const bemBase = new BemBase("foo");
      const result = bemBase.setBlk("fiz");
      expect(bemBase.blk).toEqual("fiz");
      expect(result).toBe(bemBase);
    });
  });

  describe("#elt getter", () => {
    it("returns element part of instance", () => {
      expect(new BemBase("foo__bar").elt).toEqual("bar");
    });
  });

  describe("#elt setter", () => {
    it("throws when instance is frozen", () => {
      const bemBase = new BemBase("foo__bar").freeze();
      expect(() => (bemBase.elt = "biz")).toThrowError(/is frozen/);
    });

    it("throws on invalid value", () => {
      const bemBase = new BemBase("foo__bar");
      expect(() => (bemBase.elt = "1")).toThrowError(/BEM element/);
    });

    it("sets new value", () => {
      const bemBase = new BemBase("foo__bar");
      bemBase.elt = "biz";
      expect(bemBase.elt).toEqual("biz");
    });
  });

  describe("#setElt()", () => {
    it("sets new value and returns this", () => {
      const bemBase = new BemBase("foo__bar");
      const result = bemBase.setElt("biz");
      expect(bemBase.elt).toEqual("biz");
      expect(result).toBe(bemBase);
    });
  });

  describe("#mod getter", () => {
    it("returns modifier part of instance", () => {
      expect(new BemBase("foo__bar--uno").mod).toEqual(["uno"]);
      expect(new BemBase("foo__bar--uno_1").mod).toEqual(["uno", "1"]);
    });
  });

  describe("#mod setter", () => {
    it("throws when instance is frozen", () => {
      const bemBase = new BemBase("foo__bar--uno").freeze();
      expect(() => (bemBase.mod = ["dos"])).toThrowError(/is frozen/);
    });

    it("throws on invalid value", () => {
      const bemBase = new BemBase("foo__bar--uno");
      expect(() => (bemBase.mod = ["1"])).toThrowError(/BEM modifier's name/);
      expect(() => (bemBase.mod = ["dos", "-1-"])).toThrowError(
        /BEM modifier's value/
      );
    });

    it("sets new value", () => {
      const bemBase = new BemBase("foo__bar--uno");
      bemBase.mod = ["dos", "2"];
      expect(bemBase.mod).toEqual(["dos", "2"]);
    });
  });

  describe("#setMod()", () => {
    it("sets new value and returns this", () => {
      const bemBase = new BemBase("foo__bar--uno");
      const result = bemBase.setMod(["dos"]);
      expect(bemBase.mod).toEqual(["dos"]);
      expect(result).toBe(bemBase);
    });
  });

  describe("#frozen getter", () => {
    it("returns correct value", () => {
      const bemBase = new BemBase("foo");
      expect(bemBase.frozen).toBe(false);

      const frozenBemBase = new BemBase("foo", { frozen: true });
      expect(frozenBemBase.frozen).toBe(true);
    });
  });

  describe("#freeze()", () => {
    it("freezes instance and returns this", () => {
      const bemBase = new BemBase("foo");
      expect(bemBase.frozen).toBe(false);

      const result = bemBase.freeze();
      expect(bemBase.frozen).toBe(true);
      expect(result).toBe(bemBase);
    });
  });

  describe("#toBemObject()", () => {
    it("returns correct value", () => {
      const bemBase = new BemBase("foo__bar--uno_1");
      expect(bemBase.toBemObject()).toEqual({
        blk: "foo",
        elt: "bar",
        mod: ["uno", "1"]
      });
    });
  });

  describe("#toBemString()", () => {
    it("returns correct value", () => {
      const bemBase = new BemBase("foo__bar--uno_1");
      expect(bemBase.toBemString()).toEqual("foo__bar--uno_1");
    });
  });

  describe("#toBemVector()", () => {
    it("returns correct value", () => {
      const bemBase = new BemBase("foo__bar--uno_1");
      expect(bemBase.toBemVector()).toEqual(["foo", "bar", ["uno", "1"]]);
    });
  });

  describe("#clone()", () => {
    it("returns new unfrozen instance with same block, element and modifier parts", () => {
      const bemBase = new BemBase("foo__bar--uno_1");
      bemBase.freeze();
      const clonedBemBase = bemBase.clone();
      expect(clonedBemBase.frozen).toBe(false);
      expect(clonedBemBase.toString()).toEqual("foo__bar--uno_1");
      expect(clonedBemBase).not.toBe(bemBase);
    });
  });
});
