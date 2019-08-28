import NuBlock from './block';
import NuElement from './element';

export default class NuBadge extends NuElement {
  static get nuTag() {
    return 'nu-badge';
  }

  static get nuDisplay() {
    return 'inline-block';
  }

  static get nuAttrs() {
    return {
      border: NuBlock.nuAttrs.border,
      radius: NuBlock.nuAttrs.radius,
    };
  }

  static nuCSS({ nuTag }) {
    return `
      ${nuTag} {
        padding: 0 .5em;
        border-radius: var(--nu-theme-border-radius, .5rem);
        color: var(--nu-theme-background-color) !important;
        white-space: nowrap;
      }
      ${nuTag}:not([special]) {
        background-color: var(--nu-theme-color) !important;
      }
      ${nuTag}[special] {
        background-color: var(--nu-theme-special-color) !important;
      }
    `;
  }
}
