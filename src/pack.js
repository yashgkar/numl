import {
  NuGridCell,
  NuCell,
  NuTable,
  NuPane,
  NuSeparator,
  NuLayout,
  NuIcon,
  NuCard,
  NuBtn,
  NuBlock,
  NuGrid,
  NuResponsive,
  NuBadge,
  NuInput,
  NuScroll,
  NuToggle,
  NuFlex,
  NuBtnGroup,
} from './index';
import { log } from './helpers';

[
  NuGridCell,
  NuCell,
  NuTable,
  NuPane,
  NuSeparator,
  NuLayout,
  NuIcon,
  NuCard,
  NuBtn,
  NuBlock,
  NuGrid,
  NuResponsive,
  NuBadge,
  NuInput,
  NuScroll,
  NuToggle,
  NuFlex,
  NuBtnGroup,
].forEach(customElement => {
  const tagName = `nu-${customElement.nuTag}`;

  customElements.define(tagName, customElement);

  log('custom element registered', `<${tagName}/>`);
});
