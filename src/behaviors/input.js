import WidgetBehavior from './widget';
import { isEqual } from '../helpers';
import { h } from '../dom-helpers';

export default class InputBehavior extends WidgetBehavior {
  static get params() {
    return {
      input: true,
      localized: true,
      tag: 'input',
      type: 'text',
    };
  }

  init() {
    const tag = this.tagName = this.params.tag;
    const { host } = this;

    this.ref = host.querySelector(tag);

    if (!this.ref) {
      const input = h(tag);

      host.appendChild(input);

      this.ref = input;
    }

    this.setType();

    this.value = null;
    this.props.disabled = () => {
      return this.transferAttr('disabled', this.ref) != null;
    };
    this.props.autofocus = () => {
      return this.transferAttr('autofocus', this.ref) != null;
    };
    this.props.autocomplete = () => {
      return this.transferAttr('autocomplete', this.ref);
    };
    this.props.pattern = () => {
      return this.transferAttr('pattern', this.ref);
    };
    this.props.placeholder = () => this.transferAttr('placeholder', this.ref, '...');

    super.init();

    const { ref } = this;

    if (this.value == null) {
      const elementValue = tag === 'textarea' ? ref.textContent : ref.value;

      if (elementValue) {
        this.setValue(elementValue, true);
      }
    }

    this.setFormValue();

    this.transferAttr('placeholder', this.ref, '...');

    ref.addEventListener('input', (event) => {
      event.stopPropagation();

      this.setValue(ref.value);
    });

    ref.addEventListener('change', (event) => {
      event.stopPropagation();

      this.emit('change', this.value);
    });

    ref.addEventListener('blur', () => {
      if (host.id) {
        this.emit('nu-blur', host.nuId, { bubbles: true });
      }
    });

    host.nuRef = ref;

    if (host.hasAttribute('label')) {
      host.nuChanged('label', null);
      host.removeAttribute('aria-label');
    }

    if (host.hasAttribute('labelledby')) {
      host.nuChanged('label', null);
      host.removeAttribute('aria-labelledby');
    }

    this.inputGroup = null;

    this.linkContext('inputgroup', () => {
      this.setEmpty();
    }, 'inputGroup');

    host.addEventListener('keydown', (event) => {
      if (tag === 'input' && event.key === 'Enter') {
        this.doAction('submit');
      }
    });

    // recheck for autocomplete
    setTimeout(() => {
      this.setEmpty();
    }, 500);
  }

  setEmpty() {
    if (!this.ref) return;

    this.setMod('placeholder', !this.ref.value);

    const inputGroup = this.inputGroup;

    if (inputGroup) {
      inputGroup.setMod('placeholder', !this.ref.value);
    }
  }

  setValue(value, silent) {
    if (isEqual(this.value, value)) return;

    this.value = value;

    this.setEmpty();

    if (!silent) {
      this.emit('input', this.value);
    }

    this.setInputValue(value);
    this.setFormValue();
  }

  setInputValue(value) {
    const { ref } = this;
    const tag = this.tagName;

    if (!ref) return;

    if (tag === 'textarea') {
      if (ref.textContent !== value) {
        ref.textContent = value;
      }
    } else if (ref.value !== value) {
      ref.value = value;
    }
  }

  setType() {
    if (this.ref ) {
      this.ref.type = this.params.type;
    } else {
      setTimeout(() => this.setType());
    }
  }
}
