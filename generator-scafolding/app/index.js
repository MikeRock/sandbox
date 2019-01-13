"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _yeomanGenerator = _interopRequireDefault(require("yeoman-generator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class _default extends _yeomanGenerator.default {
  constructor(...args) {
    super(...args);
    this.option('babel');
  }

  async handler1() {
    await this.prompt([{
      type: 'input',
      name: 'name',
      message: 'Enter a name for the new component (i.e.: myNewComponent): '
    }]).then(answers => {
      // create destination folder
      // this.destinationRoot(answers.name)
      console.log(`ANSWERED:${answers.name}`);
      return '';
    }).catch(err => console.log(`Error encountered:${err}`));
  }

  handler2() {
    console.log('RAN HANDLER 2');
  }

}

exports.default = _default;
