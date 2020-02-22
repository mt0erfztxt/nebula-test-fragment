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
    ["010 with default bemBase", "010-bem-base-default"],
    ["020 with provided bemBase", "020-bem-base-provided"],
    ["030 with default extends", "030-extends-default"],
    ["040 with provided extends", "040-extends-provided"],
    ["050 with default display name", "050-display-name-default"],
    ["060 with provided display name", "060-display-name-provided"],
    ["070 with default state part alias", "070-state-part-alias-default"],
    ["080 with provided state part alias", "080-state-part-alias-provided"],
    ["090 with provided state part name", "090-state-part-name-provided"],
    ["100 with default state part simple", "100-state-part-simple-default"],
    ["110 with provided state part simple", "110-state-part-simple-provided"],
    ["120 with default state part src", "120-state-part-src-default"],
    ["130 with provided state part src", "130-state-part-src-provided"],
    [
      "140 with default state part default value",
      "140-state-part-default-value-default"
    ],
    [
      "150 with provided state part default value",
      "150-state-part-default-value-provided"
    ],
    [
      "160 with multiple state parts",
      "160-multiple-state-parts-provided"
    ],
    [
      "180 with module named 'base'",
      "180-module-name",
      "input/base"
    ],
    [
      "190 with default project name",
      "190-project-name-default"
    ],
    [
      "200 with provided project name",
      "200-project-name-provided"
    ]
  ];

  for (const [expectation, testName, generatedFileName] of tests) {
    it(expectation, () => {
      compareFiles(testName, generatedFileName);
    });
  }
});
