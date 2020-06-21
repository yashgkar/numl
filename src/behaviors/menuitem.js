import Behavior from './behavior';

export default class MenuItemBehavior extends Behavior {
  static get params() {
    return {
      provideValue: false,
    };
  }

  init() {
    this.host.nuMenuItem = this;

    this.on('click', () => {
      if (this.menu) {
        this.menu.setCurrent(this);
      }
    });
  }

  connected() {
    this.nu('focusable')
      .then(Focusable => Focusable.set('manual'));

    this.linkContext('menu', (menu) => {
      if (this.menu) {
        this.menu.removeItem(this);
      }

      this.menu = menu;

      if (menu) {
        menu.addItem(this);
      }
    }, false);
  }
}
