export default function imageAttr(val) {
  return {
    'background-repeat': 'no-repeat',
    'background-position': 'center',
    'background-size': 'contain',
    'background': val,
    'background-color': 'var(--nu-local-bg-color, var(--nu-bg-color))',
  };
}
