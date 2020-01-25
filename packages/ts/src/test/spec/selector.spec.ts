import {
  CssClass,
  CssClassSpec,
  validateCssClass,
  validateCssClassSpec
} from "../../main/selector";

describe("validateCssClass()", () => {
  it("returns failed validation result when CSS class is not valid", () => {
    const values: [CssClass, string][] = [
      ["", ""],
      [" ", " "],
      ["\t", "\t"]
    ];
    for (const [value, error] of values) {
      expect(validateCssClass(value)).toEqual({
        error: `CSS class must be a non-blank string but it is '${error}'`,
        value
      });
    }
  });

  it("returns successful validation result when CSS class is valid", () => {
    const values: CssClass[] = ["f", "foo"];
    for (const value of values) {
      expect(validateCssClass(value)).toEqual({ value });
    }
  });
});

describe("validateCssClassSpec()", () => {
  it("returns failed validation result when CSS class spec is not valid", () => {
    const values: [CssClassSpec, string][] = [
      [[""], ""],
      [[" "], " "],
      [["\t"], "\t"]
    ];
    for (const [value, error] of values) {
      expect(validateCssClassSpec(value)).toEqual({
        error: `CSS class spec -- CSS class must be a non-blank string but it is '${error}'`,
        value
      });
    }
  });

  it("returns successful validation result when CSS class spec is valid", () => {
    const values: [CssClassSpec, CssClassSpec][] = [
      [["f"], ["f", false]],
      [["foo"], ["foo", false]],
      [
        ["foo", true],
        ["foo", true]
      ]
    ];
    for (const [value, cssClassSpec] of values) {
      expect(validateCssClassSpec(value)).toEqual({ value: cssClassSpec });
    }
  });
});
