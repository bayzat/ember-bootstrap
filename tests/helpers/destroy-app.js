import { run } from '@ember/runloop';
import $ from 'jquery';

export default function destroyApp(application) {
  run(application, 'destroy');
  $('#ember-bootstrap-modal-container').remove();
}
