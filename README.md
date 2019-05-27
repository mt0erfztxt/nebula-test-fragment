<!-- # nebula-test-fragment -->
# nebula-test-fragment [![Build Status](https://travis-ci.org/mt0erfztxt/nebula-test-fragment.svg?branch=master)](https://travis-ci.org/mt0erfztxt/nebula-test-fragment) [![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=WU96SXJuV25BRldyWGxqMTY4V2p3akNYTXhTeEZhMjBjdEU1R01kSFc1WT0tLWVGVVBGRW03ZnM1ZkpINnNYb3pMY3c9PQ==--3e4fe16865a93f95a27220badf98f70669cfb370)](https://www.browserstack.com/automate/public-build/WU96SXJuV25BRldyWGxqMTY4V2p3akNYTXhTeEZhMjBjdEU1R01kSFc1WT0tLWVGVVBGRW03ZnM1ZkpINnNYb3pMY3c9PQ==--3e4fe16865a93f95a27220badf98f70669cfb370)

**The documentation now at a 'Work In Progress' stage.**

An approach for fullstack and frontend web developers that allows create web UIs
and simple, extensible e2e test for them using [Page Object](https://martinfowler.com/bliki/PageObject.html)
pattern.

## Introduction

This approach, or a system if you like, is the result of necessity to test HTML forms
in an easy, repeatable and programmable way which was latter expanded to web widgets in
general.

## Assumptions, tools, technologies and opinions used in project

Many projects in the wild which were initially built as a part of other project
share technologies, assumptions or opinions from its "parent" and that project is
not an exception.

### Variant of BEM-like notation used for CSS class naming

Project relies on fact that CSS classes in HTML markup follow some variant of
BEM-like notation. In general `block__element--modifier_value` notation is used and
in case when modifier is a boolean-like (only presence/absence of modifier has
matter) a reduced notation `block__element--modifier` can be used. `block`, `element`
 and `modifier` name and `modifier` value must start with letter, ends with letter or
digit and can contain dashes (two or more consequent dashes not allowed). e.g.,
`block-name`, `elementName` and `ModifierName` are valid naming schemas.

### A tool that provides low level functionality

This project doesn't build all the things from scratch, instead it leverages
[TestCafe](https://devexpress.github.io/testcafe/) tool which in my experience is
very convenient. It is very flexible and allows you easily select page elements, do
assertions or interact with them.

## For which projects this approach is suitable?

When started to use this approach I meet a need to refactor/rewrite many of widgets
I used because they don't allow to easily test UI composed from them, so in my
experience this approach can be suitable for long living projects which extensively
use some set of widgets because it requires more time at starting stage when you
don't have widgets to compose UI and tests, but latter when widgets are ready adding
new tests requires little effort.

## Used terminology

- page - HTML document or simply a page in browser
- widget - HTML element on page used to provide some functionality, e.g. button,
link, combo input, toolbar, custom upload input, map, image, etc.
- (widget) fragment class - JavaScript class extended from `Fragment` or other class
that were extended from `Fragment` and used to work (find, test, interact, ...) with
widget's HTML element
- (widget) fragment instance or simply (widget) fragment - instance of fragment class
created to work with concrete instance of widget. For example, if we have two
instances of `button` widget, say 'red button' and 'blue button', on the page and we
want to test 'red button', then we write fragment class for that widget, say `Button`,
and then create instance of that class that know how to find element of 'red button'.

## Fragment class

Fragment class is a javascript class that wraps TestCafe's [`Selector`](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors/)
and provides some helper methods to work (find, test, interact, ...) with widget's
element in an easy and systematic way.

### Minimal example of fragment class

Imagine that we have a widget with following HTML markup:
```html
<div class="myWidget">
  Some content goes here
</div>
```

Let's write fragment class for it:
```js
// my-widget.js

import { Fragment } from 'nebula-test-fragment';

class MyWidget extends Fragment {}

Object.defineProperties(MyWidget, {
  bemBase: {
    // Required when extending from `Fragment`, but optional (inherited) when
    // extending from custom fragment class that already have that property.
    // Letter casing is up to you - use 'MyWidget', 'my-widget' or any other
    // scheme you like, but remember - it must be same as a CSS class you apply
    // to widget's element.
    value: 'myWidget'
  },
  displayName: {
    // Used in error messages for easier debugging. Doesn't need to be the same
    // as `bemBase` property.
    value: 'myWidget'
  }
});

export default MyWidget;
```

Now we can create widget fragment and it would know how to find widget's elements
on the page. In our case this would be `DIV`s that have 'myWidget' in value of its
`class` attribute:
```js
const myWidget = new MyWidget();
```

Now `myWidget.selector` is a TestCafe `Selector` and we can work with it as
described [here](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/),
but most of the time it wouldn't be used directly. Instead we would use built-in
helpers to narrow down fragment's selector to point to an element of concrete widget
instance or to create new helpers that would allow us modify selector as we want
but in a predefined way.

## Creating fragment for concrete widget instance

`Fragment` is designed to work with single element on the page (widget's element) and
it provides built-in helpers to do that. `Fragment`'s constructor accepts two optional
parameters - `locator` and `options`. `locator` used to narrow down fragment's
selector so it returns only element we interested in. In general case `locator` is a
set of selector transformations that would be applied to fragment's selector on first
access.

Important thing to remember is that most of `Fragment`'s helper methods designed to
work with selector that return single element - element for concrete instance of
widget. To narrow down fragment's selector to return single element we pass selector
transformation as first argument when creating fragment.

### Built-in selector transformations

`Fragment` has three built-in selector transformations `cns`, `cid` and `idx`:
- `cns` (abbr for component namespace), a string, initially (in previous
version of tool that wasn't in open source) was added to allow extension of fragment
classes without need to duplicate them only because they have different CSS classes
for styling, for example, I have fragment class for group of inputs used only to
hold common helpers used in checkbox and radio input groups, e.g. `group-input group-input--cns_checkbox-group-input group-input--in-line group-input--size_normal group-input--widget_icon`
but in current version of tool I use Stylus' capabilities to handle such cases.
So, that selector transformation now can be a bit obsolete.
- `cid` (abbr for component id), a string, it's like an `id` attribute of an
element but not required to be unique across all elements on page - you can have
fragments instantiated from different fragment classes and they would not conflict,
e.g. `myWidget--cid_one` and `otherWidget--cid_one`.
- `idx`, a number gte 0, used to select fragment by its index.

Let's see simple usages of `cid` and `idx` selector transformations. Imagine we have
button widget, which we use three times on the page:
```html
<!-- Button widget instance 1 (idx 0) -->
<button class="button button--cid_create-user">Create</button>

<!-- Button widget instance 2 (idx 1) -->
<button class="button button--cid_update-user">Update</button>

<!-- Button widget instance 3 (idx 2) -->
<button class="button button--cid_remove-user">Remove</button>
```

Then widget fragment class would be:
```js
// button.js

import { Fragment } from 'nebula-test-fragment';

class Button extends Fragment {}

Object.defineProperties(Button, {
  bemBase: {
    value: 'button'
  },
  displayName: {
    value: 'Button'
  }
});

export default Button;
```

Now we can create fragments for widget instances:
```js
const removeUserButtonByCid = new Button({ cid: 'remove-user' });
const removeUserButtonByIdx = new Button({ idx: 2 });
```

Both `removeUserButtonByCid` and `removeUserButtonByIdx` above would have
`selector` that returns single page element (in HTML snippet above its an element
marked 'Button widget instance 3').

Note that when used together built-in selector transformation applied in following
order `cns` -> `cid` -> `idx`, but using of `cid` and `idx` together is discouraged.

### User defined selector transformations

When we meet cases where capabilities of built-in selector transformations not
enough we can add custom selector transformations by overriding `transformSelector`
method of widget fragment class. As an example let's provide ability to create button
widget fragments using button's text:
```js
// button.js

import testFragment from 'nebula-test-fragment';

const {
  Fragment,
  selector,
  utils
} = testFragment;

class Button extends Fragment {

  // TODO: Describe arguments or provide link to API docs
  transformSelector(transformations, sel, bemBase) {

    // We need to apply selector transformations provided by parent fragment classes,
    // otherwise we loose support for built-in selector transformations.
    sel = super.transformSelector(transformations, sel, bemBase);

    // Handle custom selector transformations, only 'text' in our case.
    for (const k in transformations) {
      if (transformations.hasOwnProperty(k) && k === 'text') {
        const value = transformations[k];

        if (utils.isNonBlankString(value) || utils.isRegExp(value)) {
          sel = selector.filterByText(sel, value);
        }
        else {
          throw new TypeError(
            `${this.displayName}: value for 'text' transformation must ` +
            `be a non-blank string or a regular expression but it is ` +
            `${typeOf(value)} (${value})`
          );
        }
      }
    }

    return sel;
  }
}

Object.defineProperties(Button, {
  bemBase: {
    value: 'button'
  },
  displayName: {
    value: 'Button'
  }
});

export default Button;
```

Now if we have button widget with text 'foobar' we can create fragment for it
in following ways:
```js
const foobarButtonByEquality = new Button({ text: 'foobar' });
const foobarButtonByPattern = new Button({ text: /foobar/ });
```

To get more details on what can be passed to `Fragment`'s constructor see API docs
and examples in [tests](test/browser/fragment/010-index/index.js).

## Fragment's state

## Generating fragment classes

## Making assertions

## Parent and child fragments

## Demos/Examples

There is one open source project for this version of tool available in public
GitHub [repository](https://mt0erfztxt.github.io/nebula-widgets/). Fragment classes
for widgets can be found in this [directory](https://github.com/mt0erfztxt/nebula-widgets/tree/master/src/js)
and tests form in this [directory](https://github.com/mt0erfztxt/nebula-widgets/tree/master/test/js/browser).

## Running project tests

Project tested using Node.js and [BrowserStack](https://www.browserstack.com)

To run tests locally run `npm run local-tests`.

![BrowserStack Logo](https://bstacksupport.zendesk.com/attachments/token/C8boggDsuw8Id8QWDpSJyp7p4/?name=browserstack-logo-600x315.png)

## License

Copyright © 2017-2019 Sergey Kozhevnikov <mt0erfztxt@gmail.com>.

Licensed under the Apache License, Version 2.0. See the `LICENSE` file for more details.
