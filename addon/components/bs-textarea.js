import TextArea from '@ember/component/text-area';

/**
 Extends Ember.TextArea to add Bootstrap's 'form-control' class.

 @class Textarea
 @namespace Components
 @extends Ember.TextArea
 @public
 */
export default TextArea.extend({
  classNames: ['form-control']
});