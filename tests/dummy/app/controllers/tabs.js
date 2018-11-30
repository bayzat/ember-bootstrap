import { oneWay } from '@ember/object/computed';
import Controller from '@ember/controller';
import { A } from '@ember/array';

export default Controller.extend({
  type: oneWay('typeChoices.lastObject'),
  typeChoices: A([
    {
      id: 'pills'
    },
    {
      id: 'tabs'
    }
  ]),
  badge: 5
});
