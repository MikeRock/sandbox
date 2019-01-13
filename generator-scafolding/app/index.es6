import Generator from 'yeoman-generator'
import path from 'path'

export default class extends Generator {
  constructor(...args) {
    super(...args)
    this.option('babel')
  }
  async handler1() {
    await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for the new component (i.e.: myNewComponent): '
      }
    ])
      .then(answers => {
        // create destination folder
        // this.destinationRoot(answers.name)
        console.log(`ANSWERED:${answers.name}`)
        /*
         this.fs.copyTpl(
              this.templatePath('_package.json'),
              this.destinationPath('package.json'), {
                  name: this.props.name
              }
          );
          this.fs.copyTpl(
              this.templatePath('_bower.json'),
              this.destinationPath('bower.json'), {
                  name: this.props.name
              }
          );
          this.fs.copy(
            this.templatePath('bowerrc'),
            this.destinationPath('.bowerrc')
          );
        */
        return ''
      })
      .catch(err => console.log(`Error encountered:${err}`))
  }
  handler2() {
    console.log('RAN HANDLER 2')
  }
}
