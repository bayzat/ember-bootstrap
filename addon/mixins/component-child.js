import { on } from '@ember/object/evented';
import Mixin from '@ember/object/mixin';
import ComponentParentMixin from 'ember-bootstrap/mixins/component-parent';

/**
 * Mixin for components that act as a child component in a parent-child relationship of components
 *
 * @class ComponentChild
 * @namespace Mixins
 * @private
 */
export default Mixin.create({

  /**
   * flag to check if component has already been rendered, for the `_willRender` event handler
   * @property _didInsert
   * @type boolean
   * @private
   */
  _didInsert: false,

  /**
   * Register ourself as a child at the parent component
   * We use the `willRender` event here to also support the fastboot environment, where there is no `didInsertElement`
   *
   * @method _willRender
   * @private
   */
  _willRender: on('willRender', function() {
    if (!this._didInsert) {
      this._didInsert = true;
      let parent = this.nearestOfType(ComponentParentMixin);
      if (parent) {
        parent.registerChild(this);
        this.set('_parent', parent);
      }
    }
  }),

  /**
   * stores the parent in didInsertElement hook as a work-a-round for
   * https://github.com/emberjs/ember.js/issues/12080
   *
   * @property _parent
   * @private
   */
  _parent: null,

  /**
   * Unregister form the parent component
   *
   * @method _willDestroyElement
   * @private
   */
  _willDestroyElement: on('willDestroyElement', function() {
    let parent = this.nearestOfType(ComponentParentMixin) || this.get('_parent');
    if (parent) {
      parent.removeChild(this);
    }
  })
});
