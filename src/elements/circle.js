import NuElement from './el';
import sizeAttr from '../attributes/size';

export default class NuCircle extends NuElement {
  static get nuTag() {
    return 'nu-circle';
  }

  static get nuGenerators() {
    return {
      size(val) {
        return sizeAttr(val, {}, true);
      },
    };
  }

  static get nuStyles() {
    return {
      display: 'block',
      width: '1fs 1fs',
      height: '1fs 1fs',
      size: '1em',
      radius: 'round',
      border: '',
      fill: 'bg :special[special]',
    };
  }
}
