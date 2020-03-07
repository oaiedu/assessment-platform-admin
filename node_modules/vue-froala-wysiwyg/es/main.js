"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

require("froala-editor/css/froala_editor.pkgd.min.css");

require("froala-editor/css/froala_style.min.css");

require("froala-editor/js/plugins.pkgd.min.js");

var _App = _interopRequireDefault(require("./examples/App"));

var _vue = _interopRequireDefault(require("vue"));

var _src = _interopRequireDefault(require("src"));

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
_vue["default"].use(_src["default"]);

new _vue["default"]({
  render: function render(h) {
    return h(_App["default"]);
  }
}).$mount('#app');