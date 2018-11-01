import Ember from 'ember';

/**
 * @class SubComponent
 * @namespace Mixins
 * @deprecated
 * @private
 */
export default Ember.Mixin.create({
  target: Ember.computed.alias('parentView')
});
