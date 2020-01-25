import { validateClassName, validateClassNameSpec } from "../../main/selector";

describe("validateClassName()", () => {
  it("returns failed validation result when class name is not valid", () => {
    expect(validateClassName("").valid).toBe(false);
    expect(validateClassName(" ").valid).toBe(false);
  });

  it("returns successful validation result when class name is valid", () => {
    expect(validateClassName("f").valid).toBe(true);
    expect(validateClassName("foo").valid).toBe(true);
  });
});

describe("validateClassNameSpec()", () => {
  it("returns failed validation result when class name spec is not valid", () => {
    expect(validateClassNameSpec([""]).valid).toBe(false);
    expect(validateClassNameSpec([" "]).valid).toBe(false);
  });

  it("returns successful validation result when class name spec is valid", () => {
    expect(validateClassNameSpec(["f"]).valid).toBe(true);
    expect(validateClassNameSpec(["foo"]).valid).toBe(true);
    expect(validateClassNameSpec(["foo", true]).valid).toBe(true);
  });
});
