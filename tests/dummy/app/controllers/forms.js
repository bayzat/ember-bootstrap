import { A } from '@ember/array';
import Controller from '@ember/controller';

export default Controller.extend({
  formLayout: 'vertical',
  email: null,
  password: null,
  rememberMe: false,
  genderChoices: A([
    {
      id: 'f',
      label: 'Female'
    },
    {
      id: 'm',
      label: 'Male'
    }
  ]),
  actions: {
    submit() {
      window.alert('Successfully submitted form data!');
    }
  }

});
