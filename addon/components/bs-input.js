import TextField from '@ember/component/text-field';

/**
 Extends Ember.TextField to add Bootstrap's 'form-control' class.

 @class Input
 @namespace Components
 @extends Ember.TextField
 @public
 */
export default TextField.extend({
  classNames: ['form-control']
});