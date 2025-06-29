import { node } from '../../utility/node';

export const IOSToolbar = function({ onSettings, onAdd } = {}) {
  this.element = node('div|class:ios-toolbar');
  this.element.innerHTML = `
    <button class="ios-toolbar-btn ios-toolbar-add" title="Add">＋</button>
    <button class="ios-toolbar-btn ios-toolbar-settings" title="Settings">⚙️</button>
  `;
  this.element.querySelector('.ios-toolbar-settings').onclick = onSettings;
  this.element.querySelector('.ios-toolbar-add').onclick = onAdd;
  return this.element;
};
