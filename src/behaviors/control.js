import { asyncDebounce, log, setAttr } from "../helpers";
import { ROOT } from '../context';

const CONTROL_REGEXP = /((|:)[a-z][a-z0-9-]+)([\s]|$|\[(!|)(\.|)([a-z-]+)(:([^)=\]]+)|)(=([^\]]+?)|)])/gi;

export const CONTROL_ATTR = 'control';

export default class ControlBehavior {
  constructor(host) {
    this.host = host;

    this.apply = asyncDebounce(this.apply, this);
  }

  changed(name, value) {
    if (name === CONTROL_ATTR && value) {
      this.apply(this.state, this.applyValue);
    }
  }

  apply(state, applyValue) {
    this.state = state;
    this.applyValue = applyValue;

    const isBool = typeof state === 'boolean';

    const { host } = this;
    const value = host.getAttribute(CONTROL_ATTR);

    log('control triggered', state, applyValue, value);

    if (!value) return;

    let token;

    const elements = [];

    while (token = CONTROL_REGEXP.exec(value)) {
      let [s, id, special, s3, invert, dot, attr, s7, units, s9, val] = token;
      let element;

      invert = !!invert;

      if (invert && isBool) {
        state = !state;
      }

      // find controlled node

      if (special) {
        if (id === ':root') {
          element = ROOT;
        } else if (id === ':self') {
          element = host;
        } else {
          continue;
        }
      } else {
        element = host.nuQueryById(id);
      }

      if (!element) continue;

      // if no attribute specified then just toggle element
      if (!attr) {
        if (isBool) {
          element.hidden = !state;
        } else {
          element.hidden = !element.hidden;
        }

        elements.push(element);

        continue;
      }

      // if no value specified
      if (val == null && typeof applyValue === 'boolean') {
        setAttr(element, attr, state);

        elements.push(element);
      } else {
        let firstValue, secondValue;

        if (val == null) {
          firstValue = secondValue = applyValue;
        } else {
          // if no value specified then use default value
          [firstValue, secondValue] = val.split('|')
            .map(vl => {
              if (vl.startsWith('@')) {
                vl = vl.slice(1);

                return vl === 'value' || !vl ? applyValue : host.nuGetVar(vl);
              }

              return vl;
            });

          secondValue = secondValue != null ? secondValue : firstValue;
        }

        let setValue = firstValue;

        const isProp = attr.startsWith('--');

        if (state === false) {
          if (firstValue == null) {
            setValue = null;
          } else if (units) {
            setValue = `${secondValue}${units ? units : ''}`;
          } else {
            setValue = secondValue;
          }
        } else if (units) {
          setValue = `${firstValue}${units ? units : ''}`;
        }

        if (dot) {
          element[attr] = setValue;
        } else {
          if (isProp) {
            if (setValue != null && setValue !== false) {
              element.style.setProperty(attr, String(setValue));
            } else {
              element.style.removeProperty(attr);
            }
          } else {
            setAttr(element, attr, setValue);
          }
        }
      }
    }

    if (elements.length) {
      const isLabelled = host.nuHasAria('labelledby');

      host.nuSetAria('controls', elements.map(el => {
        if (!isLabelled && !host.nuHasAria('labelledby') && !host.hasAttribute('labelledby')) {
          host.nuSetAria('describedby', el.nuUniqId);
          el.nuSetAria('labelledby', host.nuUniqId);
        }

        return el.nuUniqId;
      }).filter(id => id).join(' '));
    } else {
      host.nuSetAria('controls', null);
    }
  }
}
