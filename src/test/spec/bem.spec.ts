import {
  BemBase,
  BemModifier,
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
} from "../../main/bem";

describe("validateBemName()", () => {
  const error = "BEM name does not conform constraints";

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
    const value: BemModifier = ["1"];
    expect(validateBemModifier(value)).toEqual({
      error: "BEM modifier's name must be valid BEM name",
      value
    });
  });

  it("validation fails when value is an array but its second element is not a nil or valid BEM value", () => {
    expectValidationFailure(validateBemModifier(["fiz", ""]));
    expectValidationFailure(validateBemModifier(["fiz", " "]));
    expectValidationFailure(validateBemModifier(["fiz", "\t"]));
    expectValidationFailure(validateBemModifier(["fiz", "-buz"]));
    expectValidationFailure(validateBemModifier(["fiz", "buz-"]));
    expectValidationFailure(validateBemModifier(["fiz", "biz--buz"]));
  });

  it("validation passes when value is a BEM modifier", () => {
    expectValidationSuccess(validateBemModifier(["fiz"]));
    expectValidationSuccess(validateBemModifier(["fiz", undefined]));
    expectValidationSuccess(validateBemModifier(["fiz", "1"]));
    expectValidationSuccess(validateBemModifier(["fiz", "buz"]));
    expectValidationSuccess(validateBemModifier(["fiz", "biz-buz"]));
  });
});

describe("validateBemObject()", () => {
  describe("validation fails when", () => {
    it("'blk' property is not valid BEM block", () => {
      expectValidationFailure(validateBemObject({ blk: "1" }));
    });

    it("'elt' property is not valid BEM element", () => {
      expectValidationFailure(validateBemObject({ blk: "blk", elt: "1" }));
    });

    it("'mod' property is not valid BEM modifier", () => {
      expectValidationFailure(validateBemObject({ blk: "blk", mod: ["1"] }));
      expectValidationFailure(
        validateBemObject({ blk: "blk", mod: ["mod", "foo--bar"] })
      );
    });
  });

  describe("validation passes when", () => {
    it("'blk' is valid BEM block and no 'elt' and 'mod' provided", () => {
      expectValidationSuccess(validateBemObject({ blk: "blk" }));
    });

    it("'blk' is valid BEM block, 'elt' is valid BEM element and no 'mod' is provided", () => {
      expectValidationSuccess(validateBemObject({ blk: "blk", elt: "elt" }));
    });

    it("'blk' is valid BEM block, 'elt' is valid BEM element and 'mod' is valid BEM modifier", () => {
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
  it("validation fails when value's block part is not valid BEM block", () => {
    expectValidationFailure(validateBemObject({ blk: "1" }));
  });

  it("validation fails when value's element part is provided but not valid BEM element", () => {
    expectValidationFailure(validateBemObject({ blk: "block", elt: "1" }));
  });

  it("validation fails when value's modifier part is provided but not valid BEM modifier", () => {
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

  it("validation passes when value is valid BEM string", () => {
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
  it("validation fails when value is an empty string", () => {
    expectValidationFailure(validateBemString(""));
  });

  it("validation fails when value is a blank string", () => {
    expectValidationFailure(validateBemString(" "));
    expectValidationFailure(validateBemString("\t"));
  });

  it("validation fails when value have more than one BEM modifier parts", () => {
    expectValidationFailure(validateBemString("blk--mod1--mod2_2"));
  });

  it("validation fails when value's BEM modifier part have more than one BEM modifier values", () => {
    expectValidationFailure(validateBemString("blk--mod_a_b"));
  });

  it("validation fails when value's BEM modifier part have not valid BEM modifier name", () => {
    expectValidationFailure(validateBemString("blk--mod@name_val"));
  });

  it("validation fails when value's BEM modifier part have not valid BEM modifier value", () => {
    expectValidationFailure(validateBemString("blk--mod-name_val-"));
  });

  it("validation fails when value have more than one BEM element parts", () => {
    expectValidationFailure(validateBemString("blk__elt1__elt2__elt3"));
  });

  it("validation fails when value's BEM element part is not valid BEM element", () => {
    expectValidationFailure(validateBemString("blk__elt2-"));
  });

  it("validation fails when value's BEM block part is not valid BEM block", () => {
    expectValidationFailure(validateBemString("blk-"));
    expectValidationFailure(validateBemString("1blk"));
    expectValidationFailure(validateBemString("blk_1"));
  });

  it("validation passes when value is valid BEM string", () => {
    expectValidationSuccess(validateBemString("blk"));
    expectValidationSuccess(validateBemString("blk__elt"));
    expectValidationSuccess(validateBemString("blk--mod"));
    expectValidationSuccess(validateBemString("blk__elt--mod"));
    expectValidationSuccess(validateBemString("blk--mod-name_mod-value"));
    expectValidationSuccess(validateBemString("blk__elt--mod-name_mod-value"));
  });
});

describe("validateBemVector()", () => {
  it("validation fails when value's block part is not valid BEM block", () => {
    expectValidationFailure(validateBemVector(["1"]));
  });

  it("validation fails when value's element part is provided but not valid BEM element", () => {
    expectValidationFailure(validateBemVector(["block", "1"]));
  });

  it("validation fails when value's modifier part is provided but not valid BEM modifier", () => {
    expectValidationFailure(validateBemVector(["block", "elt", ["1"]]));
    expectValidationFailure(
      validateBemVector(["block", "elt", ["modName", "foo--bar"]])
    );
  });

  it("validation passes when value is valid BEM string", () => {
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
  it("validates BEM string", () => {
    expectValidationFailure(validateBemStructure("1"));
    expectValidationSuccess(validateBemStructure("block__elt--mod"));
  });

  it("validates BEM vector", () => {
    expectValidationFailure(validateBemStructure(["block", "1"]));
    expectValidationSuccess(validateBemStructure(["block", "elt", ["mod"]]));
  });

  it("validates BEM object", () => {
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
