import {
  BemBase,
  toBemObject,
  toBemString,
  toBemVector,
  validateBemBlock,
  validateBemElement,
  validateBemModifier,
  validateBemModifierName,
  validateBemModifierRequirement,
  validateBemModifierValue,
  validateBemName,
  validateBemObject,
  validateBemString,
  validateBemStructure,
  validateBemValue,
  validateBemVector
} from "../../main/bem";

describe("validateBemName()", () => {
  describe("validation fails when 'bemName' is", () => {
    it("not a string", () => {
      const value = 1;
      expect(validateBemName(value)).toEqual({
        error: "BEM name: must be a string but it doesn't -- number 1",
        value
      });
    });

    const f = v =>
      `BEM name: must conform constraints but it doesn't -- string ${v || ""}`;

    it("a blank string", () => {
      for (const value of ["", " "]) {
        expect(validateBemName(value)).toEqual({ error: f(value), value });
      }
    });

    it("a string that starts not with a letter", () => {
      const value = "1";
      expect(validateBemName(value)).toEqual({ error: f(value), value });
    });

    it("a string that ends with not a letter or digit", () => {
      const value = "a1-";
      expect(validateBemName(value)).toEqual({ error: f(value), value });
    });

    it("a string but not an alpha-numeric-dashed string", () => {
      for (const value of ["a__1", "a@1"]) {
        expect(validateBemName(value)).toEqual({ error: f(value), value });
      }
    });

    it("an alpha-numeric-dashed string but have sibling dashes", () => {
      const value = "some--thing";
      expect(validateBemName(value)).toEqual({ error: f(value), value });
    });
  });

  it("validation succeeds when 'bemName' conforms constraints of valid BEM name", () => {
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
  describe("validation fails when 'bemValue' is", () => {
    it("not a string", () => {
      const value = true;
      expect(validateBemValue(value)).toEqual({
        error: "BEM value: must be a string but it doesn't -- boolean true",
        value
      });
    });

    const f = v =>
      `BEM value: must conform constraints but it doesn't -- string ${v || ""}`;

    it("a blank string", () => {
      for (const value of ["", " "]) {
        expect(validateBemValue(value)).toEqual({ error: f(value), value });
      }
    });

    it("a string that ends with not a letter or a digit", () => {
      const value = "a1-";
      expect(validateBemValue(value)).toEqual({ error: f(value), value });
    });

    it("a string but not an alpha-numeric-dashed string", () => {
      for (const value of ["a__1", "a@1"]) {
        expect(validateBemValue(value)).toEqual({ error: f(value), value });
      }
    });

    it("an alpha-numeric-dashed string but have sibling dashes", () => {
      const value = "some--thing";
      expect(validateBemValue(value)).toEqual({ error: f(value), value });
    });
  });

  it("validation succeeds when 'bemValue' conforms constraints of valid BEM value", () => {
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
  it("validation fails when 'bemBlock' is not valid", () => {
    const error =
      "BEM block: BEM name: must conform constraints but it doesn't -- string 1";
    const value = "1";
    expect(validateBemBlock(value)).toEqual({ error, value });
  });

  it("validation succeeds when 'bemBlock' is valid", () => {
    const value = "foo1";
    expect(validateBemBlock(value)).toEqual({ value });
  });
});

describe("validateBemElement()", () => {
  it("validation fails when 'bemElement' is not valid", () => {
    const error =
      "BEM element: BEM name: must conform constraints but it doesn't -- string 2";
    const value = "2";
    expect(validateBemElement(value)).toEqual({ error, value });
  });

  it("validation succeeds when 'bemElement' is valid", () => {
    const value = "foo2";
    expect(validateBemElement(value)).toEqual({ value });
  });
});

describe("validateBemModifierName()", () => {
  it("validation fails when 'bemModifierName' is not valid", () => {
    const error =
      "BEM modifier's name: BEM name: must be a string but it doesn't -- number 3";
    const value = 3;
    expect(validateBemModifierName(value)).toEqual({ error, value });
  });

  it("validation succeeds when 'bemModifierName' is valid", () => {
    const value = "foo3";
    expect(validateBemModifierName(value)).toEqual({ value });
  });
});

describe("validateBemModifierValue()", () => {
  it("validation fails when 'bemModifierValue' is not valid", () => {
    const error =
      "BEM modifier's value: BEM value: must be a string but it doesn't -- number 4";
    const value = 4;
    expect(validateBemModifierValue(value)).toEqual({ error, value });
  });

  it("validation succeeds when 'bemModifierValue' is valid", () => {
    const value = "foo4";
    expect(validateBemModifierValue(value)).toEqual({ value });
  });
});

describe("validateBemModifier()", () => {
  describe("validation fails when 'bemModifier'", () => {
    it("is not an array", () => {
      const error =
        "BEM modifier: must be an array but it doesn't -- string foo";
      const value = "foo";
      expect(validateBemModifier(value)).toEqual({ error, value });
    });

    it("has more than one BEM value", () => {
      const error =
        "BEM modifier: can have only one BEM modifier value but it " +
        "doesn't -- foo bar, buz";
      const value = ["foo", "bar", "buz"];
      expect(validateBemModifier(value)).toEqual({ error, value });
    });

    it("first element is not valid BEM name", () => {
      const error =
        "BEM modifier: BEM modifier's name: BEM name: must conform constraints but it doesn't -- string 1";
      const value = ["1"];
      expect(validateBemModifier(value)).toEqual({ error, value });
    });

    it("second element is not valid BEM value", () => {
      const input = [
        ["fiz", ""],
        ["fiz", " "],
        ["fiz", "-buz"],
        ["fiz", "buz-"],
        ["fiz", "biz--buz"]
      ];
      for (const value of input) {
        expect(validateBemModifier(value)).toEqual({
          error:
            `BEM modifier: optional BEM modifier's value: BEM value: ` +
            `must conform constraints but it doesn't -- string ${value[1]}`,
          value
        });
      }
    });
  });

  it("validation succeeds when 'bemModifier' is valid", () => {
    const input = [
      [["fiz"], ["fiz"]],
      [["fiz", undefined], ["fiz"]],
      [
        ["fiz", "1"],
        ["fiz", "1"]
      ],
      [
        ["fiz", "buz"],
        ["fiz", "buz"]
      ],
      [
        ["fiz", "biz-buz"],
        ["fiz", "biz-buz"]
      ]
    ];
    for (const [inValue, outValue] of input) {
      expect(validateBemModifier(inValue)).toEqual({ value: outValue });
    }
  });
});

describe("validateBemModifierRequirement()", () => {
  describe("validation fails when 'bemModifierRequirement'", () => {
    it("is not an array", () => {
      const error =
        "BEM modifier requirement: must be an array of one, two or three " +
        "elements but it doesn't -- string 1";
      const value = "1";
      expect(validateBemModifierRequirement(value)).toEqual({ error, value });
    });

    it("is an array with wrong number of elements", () => {
      const error =
        "BEM modifier requirement: must be an array of one, two or three " +
        "elements but it doesn't -- Array foo,bar,true,42";
      const value = ["foo", ["bar"], true, 42];
      expect(validateBemModifierRequirement(value)).toEqual({ error, value });
    });

    it("is an array but its first element is not valid BEM modifier's name", () => {
      const error =
        "BEM modifier requirement: BEM modifier: BEM modifier's name: BEM name: must " +
        "conform constraints but it doesn't -- string 1";
      const value = ["1"];
      expect(validateBemModifierRequirement(value)).toEqual({ error, value });
    });

    it("is an array but its second element is not valid BEM modifier's value", () => {
      const error =
        "BEM modifier requirement: BEM modifier: optional BEM modifier's " +
        "value: BEM value: must conform constraints but it doesn't -- string ";
      const value = ["fiz", ""];
      expect(validateBemModifierRequirement(value)).toEqual({ error, value });
    });
  });

  it("succeeds when 'bemModifierRequirement' is valid", () => {
    const input = [
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
  describe("validation fails when 'bemObject'", () => {
    it("is not a plain object", () => {
      const error =
        "BEM object: must be a plain object but it doesn't -- boolean true";
      const value = true;
      expect(validateBemObject(value)).toEqual({ error, value });
    });

    it("'blk' property is not valid BEM block", () => {
      const value = { blk: "1" };
      expect(validateBemObject(value)).toEqual({
        error:
          "BEM object: BEM block: BEM name: must conform constraints but it " +
          "doesn't -- string 1",
        value
      });
    });

    it("'elt' property is not valid BEM element", () => {
      const value = { blk: "blk", elt: "1" };
      expect(validateBemObject(value)).toEqual({
        error:
          "BEM object: BEM element: BEM name: must conform constraints but " +
          "it doesn't -- string 1",
        value
      });
    });

    it("'mod' property is not valid BEM modifier", () => {
      const values = [
        [
          { blk: "blk", mod: ["1"] },
          "BEM object: BEM modifier: BEM modifier's name: BEM name: must " +
            "conform constraints but it doesn't -- string 1"
        ],
        [
          { blk: "blk", mod: ["mod", "foo--bar"] },
          "BEM object: BEM modifier: optional BEM modifier's value: BEM value: must " +
            "conform constraints but it doesn't -- string foo--bar"
        ]
      ];
      for (const [value, error] of values) {
        expect(validateBemObject(value)).toEqual({ error, value });
      }
    });
  });

  describe("validation succeeds when", () => {
    it("'blk' is valid BEM block and no 'elt' and 'mod' provided", () => {
      const value = { blk: "blk" };
      expect(validateBemObject(value)).toEqual({ value });
    });

    it("'blk' is valid BEM block, 'elt' is valid BEM element and no 'mod' is provided", () => {
      const value = { blk: "blk", elt: "elt" };
      expect(validateBemObject(value)).toEqual({ value });
    });

    it("'blk' is valid BEM block, 'elt' is valid BEM element and 'mod' is valid BEM modifier", () => {
      const values = [
        { blk: "blk", elt: "elt", mod: ["modNam"] },
        { blk: "blk", elt: "elt", mod: ["modNam", "modVal"] }
      ];
      for (const value of values) {
        expect(validateBemObject(value)).toEqual({ value });
      }
    });
  });
});

describe("validateBemVector()", () => {
  describe("validation fails when 'bemVector'", () => {
    it("is not an array", () => {
      const error =
        "BEM vector: must be an array of one, two or three elements but it " +
        "doesn't -- string foo";
      const value = "foo";
      expect(validateBemVector(value)).toEqual({ error, value });
    });

    it("is an array with wrong number of elements", () => {
      const error =
        "BEM vector: must be an array of one, two or three elements but it " +
        "doesn't -- Array foo,bar,buz,foobar";
      const value = ["foo", "bar", ["buz"], "foobar"];
      expect(validateBemVector(value)).toEqual({ error, value });
    });

    it("BEM block is not valid", () => {
      const value = ["1"];
      expect(validateBemVector(value)).toEqual({
        error:
          "BEM vector: BEM block: BEM name: must conform constraints but " +
          "it doesn't -- string 1",
        value
      });
    });

    it("BEM element is provided but not valid", () => {
      const value = ["block", "1"];
      expect(validateBemVector(value)).toEqual({
        error:
          "BEM vector: BEM element: BEM name: must conform constraints but " +
          "it doesn't -- string 1",
        value
      });
    });

    describe("BEM modifier", () => {
      const values = [
        [
          "BEM modifier's name",
          ["block", "elt", ["1"]],
          "BEM vector: BEM modifier: BEM modifier's name: BEM name: must " +
            "conform constraints but it doesn't -- string 1"
        ],
        [
          "BEM modifier's value",
          ["block", "elt", ["modName", "foo--bar"]],
          "BEM vector: BEM modifier: optional BEM modifier's value: BEM " +
            "value: must conform constraints but it doesn't -- string foo--bar"
        ]
      ];
      for (const [label, value, error] of values) {
        it(`${label} is not valid`, () => {
          expect(validateBemVector(value)).toEqual({
            error,
            value
          });
        });
      }
    });
  });

  it("validation succeeds when 'bemVector' is valid", () => {
    const values = [
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

describe("validateBemString()", () => {
  describe("validation fails when 'bemString'", () => {
    it("is not a string", () => {
      const value = 42;
      expect(validateBemString(value)).toEqual({
        error: "BEM string: must be a string but it doesn't -- number 42",
        value
      });
    });

    it("is a blank string", () => {
      const values = ["", " "];
      for (const value of values) {
        expect(validateBemString(value)).toEqual({
          error:
            "BEM string: BEM block: BEM name: must conform constraints but " +
            `it doesn't -- string ${value}`,
          value
        });
      }
    });

    it("have more than one BEM modifier", () => {
      const value = "blk--mod1--mod2_2";
      expect(validateBemString(value)).toEqual({
        error:
          "BEM string: can have only one BEM modifier but 2 of them " +
          "found -- mod1, mod2_2",
        value
      });
    });

    describe("BEM modifier", () => {
      it("have more than one BEM modifier values", () => {
        const value = "blk--mod_a_b";
        expect(validateBemString(value)).toEqual({
          error:
            "BEM string: BEM modifier: can have only one BEM modifier " +
            "value but it doesn't -- mod a, b",
          value
        });
      });

      it("BEM modifier's name is not valid", () => {
        const value = "blk--mod@name_val";
        expect(validateBemString(value)).toEqual({
          error:
            "BEM string: BEM modifier: BEM modifier's name: BEM name: must " +
            "conform constraints but it doesn't -- string mod@name",
          value
        });
      });

      it("BEM modifier's value is not valid", () => {
        const value = "blk--mod-name_val-";
        expect(validateBemString(value)).toEqual({
          error:
            "BEM string: BEM modifier: optional BEM modifier's value: BEM " +
            "value: must conform constraints but it doesn't -- string val-",
          value
        });
      });
    });
  });

  it("have more than one BEM element", () => {
    const value = "blk__elt1__elt2__elt3";
    expect(validateBemString(value)).toEqual({
      error:
        "BEM string: can have only one BEM element but 3 of them found -- " +
        "elt1, elt2, elt3",
      value
    });
  });

  it("BEM element is not valid", () => {
    const value = "blk__elt2-";
    expect(validateBemString(value)).toEqual({
      error:
        "BEM string: BEM element: BEM name: must conform constraints but it " +
        "doesn't -- string elt2-",
      value
    });
  });

  it("BEM block is not valid", () => {
    const values = ["blk-", "1blk", "blk_1"];
    for (const value of values) {
      expect(validateBemString(value)).toEqual({
        error:
          `BEM string: BEM block: BEM name: must conform constraints but it ` +
          `doesn't -- string ${value}`,
        value
      });
    }
  });

  it("validation succeeds when 'bemString' is valid", () => {
    const values = [
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

describe("validateBemStructure()", () => {
  it("validates BEM string", () => {
    const invalidValue = "1";
    expect(validateBemStructure(invalidValue)).toEqual({
      error:
        "BEM structure: BEM string: BEM block: BEM name: must conform " +
        "constraints but it doesn't -- string 1",
      value: invalidValue
    });

    const validValue = "block__elt--mod";
    expect(validateBemStructure(validValue)).toEqual({
      value: validValue
    });
  });

  it("validates BEM vector", () => {
    const invalidValue = ["block", "1"];
    expect(validateBemStructure(invalidValue)).toEqual({
      error:
        "BEM structure: BEM vector: BEM element: BEM name: must conform " +
        "constraints but it doesn't -- string 1",
      value: invalidValue
    });

    const validValue = ["block", "elt", ["mod"]];
    expect(validateBemStructure(validValue)).toEqual({
      value: validValue
    });
  });

  it("validates BEM object", () => {
    const invalidValue = { blk: "blk", elt: "1", mod: ["mod"] };
    expect(validateBemStructure(invalidValue)).toEqual({
      error:
        "BEM structure: BEM object: BEM element: BEM name: must conform " +
        "constraints but it doesn't -- string 1",
      value: invalidValue
    });

    const validValue = { blk: "blk", elt: "elt", mod: ["mod"] };
    expect(validateBemStructure(validValue)).toEqual({ value: validValue });
  });
});

describe("toBemObject()", () => {
  it("throws on invalid input", () => {
    const values = [{}, "", []];
    for (const value of values) {
      expect(() => toBemObject(value)).toThrowError(Error);
    }
  });

  const bemObj = {
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
  it("throws on invalid input", () => {
    const values = [{}, "", []];
    for (const value of values) {
      expect(() => toBemString(value)).toThrowError(Error);
    }
  });

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
  it("throws on invalid input", () => {
    const values = [{}, "", []];
    for (const value of values) {
      expect(() => toBemVector(value)).toThrowError(Error);
    }
  });

  const bemVec = ["foo", "bar", ["fiz", "buz"]];

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
