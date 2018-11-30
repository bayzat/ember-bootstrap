import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import ModalComponent from '../components/bs-modal';

/**
 * @class ModalCloser
 * @namespace Mixins
 * @private
 */
export default Mixin.create({
  target: computed(function() {
    return this.nearestOfType(ModalComponent);
  }).volatile(),

  action: 'close',

  actions: {
    close() {
      this.sendAction();
    }
  }
});
