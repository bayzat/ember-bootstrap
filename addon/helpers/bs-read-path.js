import { helper as buildHelper } from '@ember/component/helper';
import { get } from '@ember/object';

export function readPath(params/*, hash*/) {
  return get(params[0], params[1]);
}

export default buildHelper(readPath);
