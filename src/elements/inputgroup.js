import NuGroup from './group';
import { DEFAULT_STROKE_SHADOW } from '../attributes/border';

export default class NuInputGroup extends NuGroup {
  static get nuTag() {
    return 'nu-inputgroup';
  }

  static get nuBehaviors() {
    return {
      inputgroup: true,
    };
  }

  static get nuStyles() {
    return {
      fill: 'input',
      outline: 'focus-inside',
      cursor: 'text',
    };
  }

  static get nuAttrsFor() {
    return {
      icon: {
        padding: '1x left right',
        grow: '0',
      },
      input: {
        border: '0',
      },
    };
  }
}
