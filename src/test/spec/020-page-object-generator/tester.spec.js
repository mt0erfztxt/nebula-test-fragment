import nodeFs from "fs";
import nodePath from "path";
import { generate } from "../../../main/page-object-generator";

const testsRoot = "src/test/spec/020-page-object-generator";

function compareFiles(testName, generatedFileName = "text-input") {
  const cwd = process.cwd();
  const testSrcRootPath = nodePath.join(cwd, testsRoot);
  const testSrcPath = nodePath.join(testSrcRootPath, testName);
  generate(nodePath.join(testsRoot, testName, "config.json"));
  expect(
    nodeFs.readFileSync(
      nodePath.join(
        testSrcRootPath,
        "generated-src",
        testName,
        generatedFileName
      ) + ".js"
    )
  ).toEqual(nodeFs.readFileSync(nodePath.join(testSrcPath, "result.js")));
}

describe("Page object generator generates page object module", () => {
  const tests = [
    ["with default bemBase", "010-bem-base-default"],
    ["with provided bemBase", "020-bem-base-provided"],
    ["with default extends", "030-extends-default"],
    ["with provided extends", "040-extends-provided"],
    ["with default display name", "050-display-name-default"],
    ["with provided display name", "060-display-name-provided"],
    [
      "with default state part getter name",
      "070-state-part-getter-name-default"
    ],
    [
      "with provided state part getter name",
      "080-state-part-getter-name-provided"
    ],
    [
      "with provided state part name",
      "090-state-part-name-provided"
    ],
    [
      "with default state part simple",
      "100-state-part-simple-default"
    ],
    [
      "with provided state part simple",
      "110-state-part-simple-provided"
    ]
  ];

  for (const [expectation, testName, generatedFileName] of tests) {
    it(expectation, () => {
      compareFiles(testName, generatedFileName);
    });
  }
});
