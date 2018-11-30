import LinkComponent from '@ember/routing/link-component';
import ComponentChildMixin from 'ember-bootstrap/mixins/component-child';

export function initialize(/* application */) {
  if (!ComponentChildMixin.detect(LinkComponent)) {
    LinkComponent.reopen(ComponentChildMixin);
  }
}

export default {
  name: 'bootstrap-linkto',
  initialize
};
