import { helper as buildHelper } from '@ember/component/helper';

export function not(params/*, hash*/) {
  return !params[0];
}

export default buildHelper(not);
