/* jshint node: true */
'use strict';

const rsvp = require('rsvp');
const fs = require('fs-extra');
const path = require('path');
const writeFile = rsvp.denodeify(fs.writeFile);
const chalk = require('chalk');
const BuildConfigEditor = require('ember-cli-build-config-editor');
const SilentError = require('silent-error'); // From ember-cli

const bsVersion = '3.3.7';

const validPreprocessors = [
  'none',
  'less',
  'sass'
];

module.exports = {
  name: 'ember-bootstrap',

  description: 'Configure ember-bootstrap',

  availableOptions: [
    { name: 'preprocessor', type: String, aliases: ['pp'] }
  ],

  works: 'insideProject',

  normalizeEntityName() {
  },

  existingConfiguration: null,

  beforeInstall(option) {
    let preprocessor = option.preprocessor;

    if (preprocessor && validPreprocessors.indexOf(preprocessor) === -1) {
      throw new SilentError(`Valid preprocessors are: ${validPreprocessors.join(', ')}`);
    }

    if (!preprocessor) {
      let dependencies = this.project.dependencies();
      if ('ember-cli-sass' in dependencies) {
        preprocessor = 'sass';
      } else if ('ember-cli-less' in dependencies) {
        preprocessor = 'less';
      } else {
        preprocessor = 'none';
      }
    }

    this.ui.writeLine(chalk.green(`Installing for Bootstrap using preprocessor ${preprocessor}`));

    this.preprocessor = preprocessor;
  },

  afterInstall() {
    return this.adjustBootstrapDependencies()
      .then(() => this.adjustPreprocessorDependencies())
      // .then(() => this.addPreprocessorStyleImport()) // NOTE: we don't need it as bootstrap is part of our common module
      .then(() => this.addBuildConfiguration());
  },

  removePackageFromBowerJSON(dependency) {
    this.ui.writeLine(chalk.green(`  uninstall bower package ${chalk.white(dependency)}`));
    return new rsvp.Promise(function(resolve, reject) {
      try {
        let bowerJSONPath = 'bower.json';
        let bowerJSON = fs.readJsonSync(bowerJSONPath);

        delete bowerJSON.dependencies[dependency];

        fs.writeJsonSync(bowerJSONPath, bowerJSON);

        resolve();
      } catch(error) {
        reject(error);
      }
    });
  },

  adjustBootstrapDependencies() {
    let preprocessor = this.preprocessor;
    let dependencies = this.project.dependencies();
    let bowerDependencies = this.project.bowerDependencies();
    let promises = [];

    if ('bootstrap' in bowerDependencies) {
      promises.push(this.removePackageFromBowerJSON('bootstrap'));
    }
    if ('bootstrap-sass' in bowerDependencies) {
      promises.push(this.removePackageFromBowerJSON('bootstrap-sass'));
    }

    if (preprocessor === 'sass') {
      if ('bootstrap' in dependencies) {
        promises.push(this.removePackageFromProject('bootstrap'));
      }
      promises.push(this.addPackageToProject('bootstrap-sass', bsVersion));
    } else {
      if ('bootstrap-sass' in dependencies) {
        promises.push(this.removePackageFromProject('bootstrap-sass'));
      }
      promises.push(this.addPackageToProject('bootstrap', bsVersion));
    }

    return rsvp.all(promises);
  },

  adjustPreprocessorDependencies() {
    let preprocessor = this.preprocessor;
    let dependencies = this.project.dependencies();
    let promises = [];

    if (preprocessor !== 'less' && 'ember-cli-less' in dependencies) {
      promises.push(this.removePackageFromProject('ember-cli-less'));
    }

    if (preprocessor !== 'sass' && 'ember-cli-sass' in dependencies) {
      promises.push(this.removePackageFromProject('ember-cli-sass'));
    }

    if (preprocessor === 'less' && !('ember-cli-less' in dependencies)) {
      promises.push(this.addAddonToProject('ember-cli-less'));
    }

    if (preprocessor === 'sass' && !('ember-cli-sass' in dependencies)) {
      promises.push(this.addAddonToProject('ember-cli-sass'));
    }

    return rsvp.all(promises);
  },

  addPreprocessorStyleImport() {
    let preprocessor = this.preprocessor;
    let importStatement = '\n@import "ember-bootstrap/bootstrap";\n';

    if (preprocessor === 'none') {
      return;
    }

    let extension = preprocessor === 'sass' ? 'scss' : 'less';

    let stylePath = path.join('app', 'styles');
    let file = path.join(stylePath, `app.${extension}`);

    if (!fs.existsSync(stylePath)) {
      fs.mkdirSync(stylePath);
    }
    if (fs.existsSync(file)) {
      this.ui.writeLine(chalk.green(`Added import statement to ${file}`));
      return this.insertIntoFile(file, importStatement, {});
    } else {
      this.ui.writeLine(chalk.green(`Created ${file}`));
      return writeFile(file, importStatement);
    }
  },

  addBuildConfiguration() {
    let file = 'ember-cli-build.js';
    let preprocessor = this.preprocessor;
    let config = this.retrieveExistingConfiguration();
    let settings = {};

    if (config.hasOwnProperty('importBootstrapFont')) {
      settings.importBootstrapFont = config.importBootstrapFont;
    } else {
      settings.importBootstrapFont = false;
    }

    if (preprocessor !== 'none') {
      settings.importBootstrapCSS = false;
    } else if (config.hasOwnProperty('importBootstrapCSS')) {
      settings.importBootstrapCSS = config.importBootstrapCSS;
    } else {
      settings.importBootstrapCSS = false;
    }

    if (!fs.existsSync(file)) {
      this.ui.writeLine(chalk.red(`Could not find ${file} to modify.`));
      return;
    }

    let source = fs.readFileSync(file, 'utf-8');
    let build = new BuildConfigEditor(source);

    try {
      let newBuild = build.edit(this.name, settings);
      fs.writeFileSync(file, newBuild.code());
      this.ui.writeLine(chalk.green(`Added ember-bootstrap configuration to ${file}`));
    } catch(error) {
      let settingsString = JSON.stringify(settings);
      this.ui.writeLine(chalk.red(`Configuration file could not be edited. Manually update your ember-cli-build.js to include '${this.name}': ${settingsString}`));
    }
  },

  retrieveExistingConfiguration() {
    if (this.existingConfiguration) {
      return this.existingConfiguration;
    }

    let file = 'ember-cli-build.js';

    let source = fs.readFileSync(file);
    let build = new BuildConfigEditor(source);
    this.existingConfiguration = build.retrieve(this.name) || {};
    return this.existingConfiguration;
  }

};
