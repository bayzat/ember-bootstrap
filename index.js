/* jshint node: true */
'use strict';

const path = require('path');
const util = require('util');
const extend = util._extend;
const mergeTrees = require('broccoli-merge-trees');
const Funnel = require('broccoli-funnel');
const chalk = require('chalk');
const resolve = require('resolve');

const defaultOptions = {
  importBootstrapTheme: false,
  importBootstrapCSS: false,
  importBootstrapFont: false
};

const supportedPreprocessors = [
  'less',
  'sass'
];

// For ember-cli < 2.7 findHost doesnt exist so we backport from that version
// for earlier version of ember-cli.
// https://github.com/ember-cli/ember-cli/blame/16e4492c9ebf3348eb0f31df17215810674dbdf6/lib/models/addon.js#L533
function findHostShim() {
  let current = this;
  let app;
  do {
    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));
  return app;
}

function findModulePath(moduleName) {
  let result = resolve.sync(moduleName, { basedir: this.app.project.root });
  return result.substring(0, result.lastIndexOf('/node_modules/')) + `/node_modules/${moduleName}`;
}

module.exports = {
  name: 'ember-bootstrap',

  included() {
    this._super.included.apply(this, arguments);

    let findHost = this._findHost || findHostShim;
    let app = findHost.call(this);

    this.app = app;

    let options = extend(extend({}, defaultOptions), app.options['ember-bootstrap']);
    this.bootstrapOptions = options;

    this.validateDependencies();
    this.preprocessor = this.findPreprocessor();

    // static Bootstrap CSS is mapped to vendor tree so import from there
    let vendorPath = path.join('vendor', 'ember-bootstrap');

    if (!this.hasPreprocessor()) {
      // Import css from bootstrap
      if (options.importBootstrapCSS) {
        app.import(path.join(vendorPath, 'css/bootstrap.css'));
        app.import(path.join(vendorPath, 'css/bootstrap.css.map'), {destDir: 'assets'});
      }

      if (options.importBootstrapTheme) {
        app.import(path.join(vendorPath, 'css/bootstrap-theme.css'));
        app.import(path.join(vendorPath, 'css/bootstrap-theme.css.map'), {destDir: 'assets'});
      }
    }

    if (!process.env.EMBER_CLI_FASTBOOT) {
      app.import('vendor/transition.js');
    }
  },

  validateDependencies() {
    let bowerDependencies = this.app.project.bowerDependencies();

    if ('bootstrap' in bowerDependencies || 'bootstrap-sass' in bowerDependencies) {
      this.warn('The dependencies for ember-bootstrap may be outdated. Please run `ember generate ember-bootstrap` to install appropriate dependencies!');
    }
  },

  findPreprocessor() {
    return supportedPreprocessors.find((name) => !!this.app.project.findAddonByName(`ember-cli-${name}`) && this.validatePreprocessor(name));
  },

  validatePreprocessor(name) {
    let dependencies = this.app.project.dependencies();
    switch (name) {
      case 'sass':
        if (!('bootstrap-sass' in dependencies)) {
          this.warn('Npm package "bootstrap-sass" is missing, but is typically required for SASS support. Please run `ember generate ember-bootstrap` to install the missing dependencies!');
        }
        break;
      case 'less':
        if (!('bootstrap' in dependencies)) {
          this.warn('Npm package "bootstrap" is missing, but is typically required for Less support. Please run `ember generate ember-bootstrap` to install the missing dependencies!');
        }
        break;
    }
    return true;
  },

  getBootstrapStylesPath() {
    switch (this.preprocessor) {
      case 'sass':
        return path.join(findModulePath.call(this, 'bootstrap-sass'), 'assets', 'stylesheets');
      case 'less':
        return path.join(findModulePath.call(this, 'bootstrap'), 'less');
      default:
        return path.join(findModulePath.call(this, 'bootstrap'), 'dist', 'css');
    }
  },

  getBootstrapFontPath() {
    switch (this.preprocessor) {
      case 'sass':
        return path.join(findModulePath.call(this, 'bootstrap-sass'), 'assets', 'fonts');
      case 'less':
      default:
        return path.join(findModulePath.call(this, 'bootstrap'), 'fonts');
    }
  },

  hasPreprocessor() {
    return !!this.preprocessor;
  },

  treeForStyles() {
    if (this.hasPreprocessor()) {
      return new Funnel(this.getBootstrapStylesPath(), {
        destDir: 'ember-bootstrap'
      });
    }
  },

  treeForPublic() {
    if (this.bootstrapOptions.importBootstrapFont) {
      return new Funnel(this.getBootstrapFontPath(), {
        destDir: 'fonts'
      });
    }
  },

  treeForVendor(tree) {
    let trees = [tree];

    if (!this.hasPreprocessor()) {
      trees.push(new Funnel(this.getBootstrapStylesPath(), {
        destDir: 'ember-bootstrap'
      }));
    }
    return mergeTrees(trees, { overwrite: true });
  },

  warn(message) {
    this.ui.writeLine(chalk.yellow(message));
  }

};
