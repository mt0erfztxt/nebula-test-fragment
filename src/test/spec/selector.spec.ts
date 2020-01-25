import {
  ClassName,
  ClassNameSpec,
  validateClassName,
  validateClassNameSpec
} from "../../main/selector";

describe("validateClassName()", () => {
  it("returns failed validation result when class name is not valid", () => {
    const values: [ClassName, string][] = [
      ["", ""],
      [" ", " "],
      ["\t", "\t"]
    ];
    for (const [value, error] of values) {
      expect(validateClassName(value)).toEqual({
        error: `Class name must be non-blank string but it is '${error}'`,
        value
      });
    }
  });

  it("returns successful validation result when class name is valid", () => {
    const values: ClassName[] = ["f", "foo"];
    for (const value of values) {
      expect(validateClassName(value)).toEqual({ value });
    }
  });
});

describe("validateClassNameSpec()", () => {
  it("returns failed validation result when class name spec is not valid", () => {
    const values: [ClassNameSpec, string][] = [
      [[""], ""],
      [[" "], " "],
      [["\t"], "\t"]
    ];
    for (const [value, error] of values) {
      expect(validateClassNameSpec(value)).toEqual({
        error: `Class name spec -- Class name must be non-blank string but it is '${error}'`,
        value
      });
    }
  });

  it("returns successful validation result when class name spec is valid", () => {
    const values: [ClassNameSpec, ClassNameSpec][] = [
      [["f"], ["f", false]],
      [["foo"], ["foo", false]],
      [
        ["foo", true],
        ["foo", true]
      ]
    ];
    for (const [value, classNameSpec] of values) {
      expect(validateClassNameSpec(value)).toEqual({ value: classNameSpec });
    }
  });
});
