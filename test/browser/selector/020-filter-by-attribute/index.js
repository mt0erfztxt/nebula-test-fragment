import appRootPath from 'app-root-path';
import expect from 'unexpected';
import { Selector } from 'testcafe';

import selector from '../../../../src/selector';

fixture('selector :: 020 filterByAttribute')
  .page(appRootPath.path + '/test/browser/selector/020-filter-by-attribute/index.html');

test("010 It should throw error when attribute name is not a non-blank string", async () => {
  expect(
    () => selector.filterByAttribute('.foo', ['']),
    'to throw',
    new TypeError("Attribute name must be a non-blank string but it is String ()")
  );
});

test("020 It should return selector filtered by absence of attribute", async (t) => {
  const sel = Selector('.test-020');
  await t.expect(sel.count).eql(2);

  const filteredSel1 = selector.filterByAttribute(sel, ['data-non-existent']);
  await t.expect(filteredSel1.count).eql(0);

  const filteredSel2 = selector.filterByAttribute(sel, ['data-non-existent'], { isNot: true });
  await t.expect(filteredSel2.count).eql(2);
});

test("030 It should allow filter selector using only attribute name", async (t) => {
  const sel = Selector('.test-030');
  await t.expect(sel.count).eql(3);

  const filteredSel1 = selector.filterByAttribute(sel, ['data-attr2']);
  await t.expect(filteredSel1.count).eql(2);
  await t.expect(filteredSel1.nth(0).textContent).eql('Test 030 | 1');
  await t.expect(filteredSel1.nth(1).textContent).eql('Test 030 | 2');

  const filteredSel2 = selector.filterByAttribute(sel, ['data-attr2'], { isNot: true });
  await t.expect(filteredSel2.count).eql(1);
  await t.expect(filteredSel2.textContent).eql('Test 030 | 0');
});

test("040 It should allow filter selector using both attribute name and value", async (t) => {
  const sel = Selector('.test-040');
  await t.expect(sel.count).eql(3);

  // RegExp value.
  const filteredSel1 = selector.filterByAttribute(sel, ['data-attr1', /foo/]);
  await t.expect(filteredSel1.count).eql(2);
  await t.expect(filteredSel1.nth(0).textContent).eql('Test 040 | 1');
  await t.expect(filteredSel1.nth(1).textContent).eql('Test 040 | 2');

  // RegExp value + isNot.
  const filteredSel2 = selector.filterByAttribute(sel, ['data-attr1', /.*bar$/], { isNot: true });
  await t.expect(filteredSel2.count).eql(2);
  await t.expect(filteredSel2.nth(0).textContent).eql('Test 040 | 0');
  await t.expect(filteredSel2.nth(1).textContent).eql('Test 040 | 1');

  // Non-RegExp value.
  const filteredSel3 = selector.filterByAttribute(sel, ['data-attr1', 'foo']);
  await t.expect(filteredSel3.count).eql(1);
  await t.expect(filteredSel3.textContent).eql('Test 040 | 1');

  // Non-RegExp value + isNot.
  const filteredSel4 = selector.filterByAttribute(sel, ['data-attr1', 'foo'], { isNot: true });
  await t.expect(filteredSel4.count).eql(2);
  await t.expect(filteredSel4.nth(0).textContent).eql('Test 040 | 0');
  await t.expect(filteredSel4.nth(1).textContent).eql('Test 040 | 2');
});
