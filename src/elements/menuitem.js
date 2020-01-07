import NuBtn from './btn';

export default class NuMenuitem extends NuBtn {
  static get nuTag() {
    return 'nu-menuitem';
  }

  static get nuRole() {
    return 'menuitem';
  }

  static get nuDefaults() {
    return {
      padding: '1x',
      fill: 'transparent',
      width: '100%',
      flow: 'column',
      gap: '1x',
      content: 'center start',
      radius: '0',
      border: '0',
    };
  }

  static nuCSS({ tag, css }) {
    return `
      ${css}
      ${tag} {
        --nu-local-focus-inset: inset 0 0;
      }
    `;
  }

  nuConnected() {
    super.nuConnected();

    this.setAttribute('action', 'submit');
  }
}
