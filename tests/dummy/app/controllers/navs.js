import { oneWay } from '@ember/object/computed';
import Controller from '@ember/controller';
import { A } from '@ember/array';

export default Controller.extend({
  type: oneWay('typeChoices.firstObject'),
  stacked: false,
  justified: false,
  typeChoices: A([
    {
      id: 'pills'
    },
    {
      id: 'tabs'
    }
  ])
});
