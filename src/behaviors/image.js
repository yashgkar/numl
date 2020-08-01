import WidgetBehavior from './widget';
import { setAttr, warn } from '../helpers';
import { h } from '../dom-helpers';

export default class ImageBehavior extends WidgetBehavior {
  init() {
    this.props.src = (src) => {
      this.load(src);
    };

    this.props.loading = (value) => {
      if (this.ref && this.ref !== this.host) {
        setAttr(this.ref, 'loading', value);
      }
    };

    super.init();
  }

  connected() {
    [...this.host.querySelectorAll('img:not([src])')].forEach(el => {
      el.parentNode.removeChild(el);
    });
  }

  load(src) {
    const { host } = this;

    if (!src || !src.trim()) return;

    let img = host.querySelector('img') || h('img');

    setAttr(img, 'loading', host.getAttribute('loading'));
    img.src = src;
    img.alt = '';

    this.ref = img;

    host.appendChild(img);

    img.onerror = () => {
      this.removeChild(img);

      const icon = h('nu-icon');

      icon.setAttribute('name', 'image');

      host.appendChild(icon);

      warn('image not loaded', src);
    };

    return src;
  }
}
