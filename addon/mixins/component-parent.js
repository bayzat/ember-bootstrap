import { schedule } from '@ember/runloop';
import { A } from '@ember/array';
import { on } from '@ember/object/evented';
import Mixin from '@ember/object/mixin';

/**
 * Mixin for components that act as a parent component in a parent-child relationship of components
 *
 * @class ComponentParent
 * @namespace Mixins
 * @private
 */
export default Mixin.create({

  /**
   * Array of registered child components
   *
   * @property children
   * @type array
   * @protected
   */
  children: null,

  _onInit: on('init', function() {
    this.set('children', A());
  }),

  /**
   * Register a component as a child of this parent
   *
   * @method registerChild
   * @param child
   * @public
   */
  registerChild(child) {
    schedule('actions', this, function() {
      this.get('children').addObject(child);
    });
  },

  /**
   * Remove the child component from this parent component
   *
   * @method removeChild
   * @param child
   * @public
   */
  removeChild(child) {
    schedule('actions', this, function() {
      this.get('children').removeObject(child);
    });
  }
});
