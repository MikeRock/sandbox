'use strict';

var _rapid = require('rapid.js');

var _rapid2 = _interopRequireDefault(_rapid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var anime = new _rapid2.default({ baseURL: 'https://api.jikan.moe/v3' });
anime.id(1).append('stats').get().then(function (res) {
  console.log(res.json());
});
