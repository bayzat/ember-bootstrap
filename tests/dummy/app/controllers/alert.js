import Controller from '@ember/controller';

export default Controller.extend({
  visible: false,

  actions: {
    close() {
      this.set('visible', false);
    }
  }
});
