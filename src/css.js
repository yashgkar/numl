import { devMode, log, warn } from "./helpers";
import { h } from './dom-helpers';
import scrollbarAttr from './attributes/scrollbar';
import { USE_HIDDEN_STYLES } from './settings';

export const STYLE_MAP = {};
const HEAD = document.head;
const STYLE = h('style');
const RULE_SETS = {};

STYLE.dataset.numl = '';

HEAD.appendChild(STYLE);

const SHEET = STYLE.sheet;

// [...document.querySelectorAll('style[data-nu-name]')]
//   .forEach(element => {
//     const name = element.dataset.nuName.replace(/&quot;/g, '"');
//
//     if (!name.includes('#')) {
//       STYLE_MAP[name] = {
//         element: element,
//         css: element.textContent,
//         selector: name,
//       };
//     }
//   });

function getRootNode(root) {
  return root || HEAD;
}

function getSheet(root) {
  if (!root) return SHEET;

  if (root.nuSheet) {
    return root.nuSheet;
  }

  const style = h('style');

  root.appendChild(style);

  style.dataset.numl = '';

  root.nuSheet = style.sheet;

  return root.nuSheet;
}

/**
 * Insert a set of rules into style sheet.
 * @param {String} css
 * @param {CSSStyleSheet} sheet
 * @param {String} id
 * @return {CSSRule}
 */
export function insertRule(css, sheet, id) {
  css = css || '';

  if (devMode) {
    css = beautifyCSS(css);
  }

  const index = sheet.insertRule(css);
  const rule = sheet.cssRules[index];

  if (id) {
    rule.nuId = id;
  }

  return rule;
}

/**
 * Insert CSS Rule Set.
 * @param {String} id
 * @param {Array<String>} arr
 * @param {Undefined|ShadowRoot} [root]
 * @param {Boolean} [force]
 */
export function insertRuleSet(id, arr, root, force = false) {
  if (id && hasRuleSet(id, root)) {
    if (force) {
      removeRuleSet(id, root);
    } else {
      return;
    }
  }

  const ruleMap = getRuleMap(root);

  const ruleSet = ruleMap[id] = {
    raw: arr,
    rules: [],
  };

  if (!root) {
    RULE_SETS[id] = ruleSet;
  }

  if (USE_HIDDEN_STYLES) {
    const sheet = getSheet(root);

    for (let i = 0; i < arr.length; i++) {
      const rule = arr[i];

      const cssRule = insertRule(rule, sheet, id);

      ruleSet.rules.push(cssRule);
    }
  } else {
    const rootNode = getRootNode(root);
    const style = h('style');

    style.dataset.numl = id || '';

    ruleSet.element = style;

    style.appendChild(document.createTextNode(arr.join('\n')));

    rootNode.appendChild(style);
  }
}

export function removeRuleSet(id, root) {
  const ruleMap = getRuleMap(root);

  if (USE_HIDDEN_STYLES) {
    const sheet = getSheet(root);

    while (removeRule(id, sheet)) {}
  } else {
    const ruleSet = ruleMap[id];

    if (ruleSet) {
      const element = ruleSet.element;

      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  }


  if (!root) {
    delete ruleMap[name];
  }
}

/**
 * Remove the CSS rule from a style sheet.
 * @param {String} id
 * @param {CSSStyleSheet} sheet
 * @return {boolean}
 */
export function removeRule(id, sheet) {
  const rules = sheet.cssRules;

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    if (rule.nuId === id) {
      sheet.deleteRule(i);
      return true;
    }
  }

  return false;
}

export function attrsQuery(attrs) {
  return Object.keys(attrs)
    .reduce((query, attr) => {
      const val = attrs[attr];

      return `${query}${val != null ? `[${attr}="${val}"]` : `:not([${attr}])`}`
    }, '');
}

export function stylesString(styles) {
  if (devMode) {
    Object.keys(styles)
      .forEach(style => {
        if (style.startsWith('$')) return;
        if (!styles[style]) return;

        const value = String(styles[style]);

        if (value
          && !style.startsWith('-')
          && !CSS.supports(style, value.replace('!important', ''))
          && !value.endsWith('-reverse')) {
          warn('unsupported style detected:', `{ ${style}: ${value}; }`);
        }
      });
  }

  return Object.keys(styles)
    .reduce((string, style) => !style.startsWith('$') ? `${string}${styles[style] ? `${style}:${styles[style]}` : ''};` : string, '');
}

const TOUCH_REGEXP = /:hover(?!\))/; // |\[nu-active](?!\))
const NOT_TOUCH_REGEXP = /:not\(:hover(?=\))/;

export function generateCSS(query, styles, universal = false) {
  if (!styles || !styles.length) return [];

  const isHost = query.startsWith(':host');

  if (isHost) {
    query = query.replace(':host', '');
  }

  return styles.reduce((arr, map) => {
    let queries = [query];

    const $prefix = map.$prefix;
    const $suffix = map.$suffix;

    if (isHost && ($prefix || !$suffix)) return arr;

    // multiple suffixes and prefixes
    [$suffix, $prefix]
      .forEach((add, addIndex) => {
        if (!add) return;

        const multiple = ~add.indexOf(',');
        const list = multiple && add.split(',');
        [...queries].forEach((query, queryIndex) => {
          if (multiple) {
            queries[queryIndex] = addIndex ? `${list[0]} ${query}` : `${query}${list[0]}`;

            list.forEach((ad, adIndex) => {
              if (adIndex) { // skip first suffix
                queries.push(addIndex ? `${ad} ${query}` : `${query}${ad}`);
              }
            });
          } else {
            queries[queryIndex] = addIndex ? `${add} ${query}` : `${query}${add}`;
          }
        });
      });

    if (isHost) {
      for (let i = 0; i < queries.length; i++) {
        const qry = queries[i];

        if (!qry) continue;

        if (qry.includes('>')) {
          const tmp = qry.split('>');

          queries[i] = `:host(${tmp[0].trim()})>${tmp[1]}`;
        } else {
          queries[i] = `:host(${qry})`;
        }
      }
    }

    if (universal) {
      arr.push(`${queries.join(',')}{${stylesString(map)}}`);

      return arr;
    }

    const touchQueries = [];
    const nonTouchQueries = [];

    queries.forEach(query => [query.match(TOUCH_REGEXP) ? touchQueries : nonTouchQueries].push(query));

    const touchCSS = nonTouchQueries.length
      ? `@media (pointer: coarse){${nonTouchQueries.join(',').replace(':not(:hover)', '')}{${stylesString(map)}}}`
      : '';
    const nonTouchCSS = (nonTouchQueries.length ? `@media (pointer: fine){${nonTouchQueries.join(',')}{${stylesString(map)}}}` : '')
      + (touchQueries.length ? `@media (pointer: fine){${touchQueries.join(',')}{${stylesString(map)}}}` : '');
    const otherQueries = queries.filter(query => !touchQueries.includes(query) && !nonTouchQueries.includes(query));
    const otherCSS = otherQueries.length ? `${otherQueries.join(',')}{${stylesString(map)}}` : '';

    [touchCSS, nonTouchCSS, otherCSS].forEach(rule => {
      if (rule) {
        arr.push(rule);
      }
    });

    return arr;
  }, []);
}

export function parseStyles(str) {
  return str
    .split(/;/g)
    .map(s => s.trim())
    .filter(s => s)
    .map(s => s.split(':'))
    .reduce((st, s) => {
      st[s[0]] = s[1].trim();
      return st;
    }, {});
}

export function removeRulesByPart(selectorPart) {
  log('clean css by part', selectorPart);
  const isRegexp = selectorPart instanceof RegExp;
  const keys = Object.keys(RULE_SETS).filter(id => isRegexp
    ? id.match(selectorPart) : id.includes(selectorPart));

  keys.forEach(key => {
    removeRuleSet(key);
    log('css removed:', key);
  });
}

function getRuleMap(root) {
  let styleMap = RULE_SETS;

  if (root) {
    if (!root.nuRuleMap) {
      root.nuRuleMap = {};
    }

    styleMap = root.nuRuleMap;
  }

  return styleMap;
}

export function hasRuleSet(id, root) {
  let ruleMap = getRuleMap(root);

  return !!ruleMap[id];
}

export function transferCSS(id, root) {
  const ruleMap = getRuleMap(); // get document rule map
  const ruleSet = ruleMap[id];

  if (!ruleSet) return;

  const css = ruleSet.raw;

  log('transfer styles to the shadow root:', JSON.stringify(id), root);

  return insertRuleSet(id, css, root);
}

/**
 * Very fast css beautification without parsing.
 * Do not support media queries
 * Use in Dev Mode only!
 * @param {Array|String} css
 * @returns {Array|String}
 */
export function beautifyCSS(css) {
  if (Array.isArray(css)) {
    return css.map(beautifyCSS);
  }

  let flag = false;

  return css.replace(/[{;}](?!$)/g, s => s + '\n')
    .split(/\n/g)
    .map(s => s.trim())
    .filter(s => s)
    .map(s => {
      if (!s.includes('{') && !s.includes('}') && flag) {
        if (s.includes(':')) {
          s = s.replace(/:(?!\s)(?!not\()(?!:)/, ': ');
          return `  ${s}`;
        }

        return `    ${s}`;
      }

      if (s.includes('{')) {
        flag = true;
      } else if (s.includes('}')) {
        flag = false;
      }

      return s;
    }).join('\n');
}

export function splitIntoRules(css) {
  if (Array.isArray(css)) return css;

  const arr = css.split('}').map(s => `${s}}`);

  return arr.slice(0, -1);
}

/**
 *
 * @param mediaQuery - CSS media query for the rule
 * @param {String} rule - a full rule or just a selector
 * @param {String} [styles]
 * @return {string}
 */
export function withMediaQuery(mediaQuery, rule, styles) {
  return `@media ${mediaQuery} {${styles != null ? `${rule}{${styles}}` : rule}}`;
}


const globalRules = [`
:root {
  font-size: 16px;

  --nu-pixel: 1px;
  --nu-rem-pixel: calc(1rem / 16);

  --nu-radius: 0.5rem;
  --nu-gap: 0.5rem;
  --nu-border-width: 1px;
  --nu-outline-width: calc(1rem / 16 * 3);
  --nu-transition: 0.08s;
  --nu-inline-offset: -.15em;
  --nu-transition-enabler: 1;
  --nu-icon-size: 1.5em;
  --nu-disabled-opacity: .5;

  --nu-font-size: 1rem;
  --nu-line-height: 1.5rem;
  --nu-font-weight: 400;
  --nu-text-font-weight: var(--nu-font-weight);
  --nu-light-font-weight: 200;
  --nu-normal-font-weight: 400;
  --nu-bold-font-weight: 600;
  --nu-semi-bold-font-weight: 500;
  --nu-heading-font-weight: 700;
  --nu-font-weight-step: 200;

  --nu-base-font: 'Avenir Next', 'Avenir', Helvetica, Ubuntu, 'DejaVu Sans', Arial, sans-serif;
  --nu-font: var(--nu-base-font);
  --nu-base-monospace-font: monospace;
  --nu-monospace-font: var(--nu-base-monospace-font);

  --nu-clear-color: transparent;
}`,

`:root:not([data-nu-prevent-reset]) body {
  line-height: 1rem;
}`,

`:root:not([data-nu-prevent-reset]) body > *:not([size]) {
  line-height: 1.5rem;
}`,

`.nu-defaults, :root:not([data-nu-prevent-reset]) body {
  margin: 0;
  padding: 0;
  font-family: var(--nu-font);
  font-size: var(--nu-font-size);
  color: var(--nu-text-color);
  background-color: var(--nu-subtle-color);
  font-weight: var(--nu-normal-font-weight);
  word-spacing: calc(1rem / 8);
  min-height: 100vh;
  text-align: left;
  text-size-adjust: none;
  -webkit-text-size-adjust: none;
  transition: background-color calc(var(--nu-transition-enabler) * var(--nu-transition)) linear;
}`,

`.nu-defaults:not(body) {
  line-height: 1.5rem;
}`,

`@media (prefers-color-scheme: dark) {
  :root:not([data-nu-scheme="light"]) .nu-dark-invert {
    filter: invert(100%) hue-rotate(180deg);
  }
}`,

`@media (prefers-color-scheme: dark) {
  :root:not([data-nu-scheme="light"]) .nu-dark-dim, :root:not([data-nu-scheme="light"]) nu-img {
    filter: brightness(0.95);
  }
}`,

`:root[data-nu-scheme="dark"] .nu-dark-invert {
  filter: invert(95%) hue-rotate(180deg);
}`,

`:root[data-nu-scheme="dark"] .nu-dark-dim, :root[data-nu-scheme="dark"] nu-img {
  filter: brightness(0.95);
}`,

`@media (prefers-reduced-motion: reduce) {
  :root {
    --nu-transition-enabler: 0;
  }
}`,

`:root[data-nu-reduce-motion] {
  --nu-transition-enabler: 0;
}`,

`:root[data-nu-outline] [nu] {
  outline: var(--nu-border-width, 1px) solid var(--nu-outline-color) !important;
}`,

`[nu-hidden] {
  display: none !important;
}`,

...generateCSS('body', scrollbarAttr('yes'), false)];

insertRuleSet('global', globalRules);
