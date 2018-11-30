import { oneWay, alias, not, reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import TypeClass from 'ember-bootstrap/mixins/type-class';
import ComponentChild from 'ember-bootstrap/mixins/component-child';
import Accordion from 'ember-bootstrap/components/bs-accordion';

/**
 A collapsible/expandable item within an accordion

 See [Components.Accordion](Components.Accordion.html) for examples.


 @class AccordionItem
 @namespace Components
 @extends Ember.Component
 @uses Mixins.ComponentChild
 @uses Mixins.TypeClass
 @public
 */
export default Component.extend(ComponentChild, TypeClass, {
  classNames: ['panel'],

  /**
   * @property classTypePrefix
   * @type String
   * @default 'panel'
   * @protected
   */
  classTypePrefix: 'panel',

  /**
   * The title of the accordion item, displayed as a .panel-title element
   *
   * @property title
   * @type string
   * @public
   */
  title: null,

  /**
   * The value of the accordion item, which is used as the value of the `selected` property of the parent [Components.Accordion](Components.Accordion.html) component
   *
   * @property value
   * @public
   */
  value: oneWay('elementId'),

  selected: alias('accordion.selected'),

  collapsed: computed('value', 'selected', function() {
    return this.get('value') !== this.get('selected');
  }),
  active: not('collapsed'),

  /**
   * Reference to the parent `Components.Accordion` class.
   *
   * @property accordion
   * @private
   */
  accordion: computed(function() {
    return this.nearestOfType(Accordion);
  }),

  target: reads('accordion'),

  actions: {
    toggleActive() {
      let value = this.get('value');
      let previous = this.get('selected');
      let active = this.get('active');
      if (!active) {
        this.set('selected', value);
        this.send('selected', value, previous);
      } else {
        this.set('selected', null);
        this.send('selected', null, previous);
      }
    }
  }

});
