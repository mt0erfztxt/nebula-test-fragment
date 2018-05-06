import _ from 'lodash';
import appRootPath from 'app-root-path';

import {Fragment} from '../../../src';
import selector from '../../../src/selector';

class MyFragment extends Fragment {
  constructor(spec, opts) {
    if (spec instanceof MyFragment) {
      return spec;
    }

    let fragmentSpec;

    // TODO Need to implement `Fragment.checkFragmentSpecAndOpts` first!
    if (spec.text) {
      fragmentSpec = _.assign({}, spec, {
        custom: function (sel, spec) {
          return selector.filterByText(sel, spec.text);
        }
      });
    }
    else {
      fragmentSpec = spec;
    }

    super(fragmentSpec, opts);
    return this;
  }
}

Object.defineProperties(MyFragment, {
  bemBase: {
    value: 'myFragment'
  },
  displayName: {
    value: 'MyFragment'
  }
});

fixture `Fragment :: Constructor :: 050 Spec Custom`
  .page(appRootPath.path + '/test/fixtures/fragment/constructor/050-spec-custom.html');

test.skip("010 It uses `spec.custom` argument to filter by consumer defined spec", async (t) => {
  const myFragment = new MyFragment();
  await t.expect(myFragment.selector.exists).ok();
  await t.expect(myFragment.selector.count).eql(7);
});
