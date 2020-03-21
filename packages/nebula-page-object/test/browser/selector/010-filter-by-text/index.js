import appRootPath from 'app-root-path';
import { Selector } from 'testcafe';

import selector from '../../../../src/selector';

fixture('selector :: 010 filterByText')
  .page(appRootPath.path + '/test/browser/selector/010-filter-by-text/index.html');

test("010 It filters selector by text", async (t) => {
  let sel;
  const allThings2 = Selector('.thing2');
  await t.expect(allThings2.count).eql(5);

  sel = selector.filterByText(allThings2, 'Text 1');
  await t.expect(sel.count).eql(1);

  sel = selector.filterByText(allThings2, 'Text 2');
  await t.expect(sel.count).eql(2);
});

test("020 It allows `text` argument to be a regular expression", async (t) => {
  const sel = selector.filterByText('div', /^4.*/);
  await t.expect(sel.count).eql(2);
  await t.expect(sel.nth(0).textContent).eql('4 Text');
  await t.expect(sel.nth(1).textContent).eql('4');
});

test("030 It stringifies `text` argument when it is not a string or regular expression", async (t) => {
  const sel = selector.filterByText('div', 4);
  await t.expect(sel.count).eql(1);
  await t.expect(sel.nth(0).textContent).eql('4');
});
