import { parseAttr } from '../helpers';

export default function rotateAttr(val) {
  if (!val) return;

  const { values } = parseAttr(val);

  return {
    $suffix: ':not([transform]):not([scale]):not([move])',
    '--nu-transform': `rotate(${values.join(', ')})`,
    transform: 'var(--nu-transform-place, translate(0, 0)) var(--nu-transform)',
  };
}
