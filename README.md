# extract-module-exports

Extracts the export objects of a [NodeJS module][module].

This will provide you a list of the properties' name available when you [import a module][require].

> COMING SOON!

## Installation

> COMING SOON!

## Usage

```js
// file that exports
// some-file.js

const features = {
    feature1: function () {},
    feature2: function () {}
};

module.exports = features;
```

```js
const extractExports = require("extract-module-exports");

extractExports("dir-to-file/some-file.js")
.then(results => {
    console.log(results); // ["feature1", "feature2"]
});
```

[module]: https://nodejs.org/api/modules.html#modules_the_module_object
[require]: https://nodejs.org/api/modules.html#modules_require_id