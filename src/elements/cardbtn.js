import NuBtn from './btn';

export default class NuCardBtn extends NuBtn {
  static get nuTag() {
    return 'nu-cardbtn';
  }

  static get nuStyles() {
    return {
      display: 'block',
      padding: '1.5x 2x',
      border: '1bw :clear[hidden] :hover[1bw] :clear:hover[#mark]',
      flow: 'column',
      text: 'wrap :special[sb wrap]',
      transition: 'theme, radius',
      shadow: '0 :clear[1.5]',
    }
  }
}
