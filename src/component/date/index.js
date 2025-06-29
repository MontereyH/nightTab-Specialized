import { state } from '../state';
import { node } from '../../utility/node';
import { clearChildNode } from '../../utility/clearChildNode';

import './index.css';

export const Date = function () {
  this.now = new Date();
  this.element = {
    date: node('div|class:date-ios'),
    day: node('span|class:date-ios-day'),
    dateOfMonth: node('span|class:date-ios-date'),
    month: node('span|class:date-ios-month'),
    year: node('span|class:date-ios-year')
  };

  this.update = () => {
    this.now = new Date();
    this.element.day.textContent = this.now.toLocaleDateString(undefined, { weekday: 'short' });
    this.element.dateOfMonth.textContent = this.now.getDate();
    this.element.month.textContent = this.now.toLocaleDateString(undefined, { month: 'short' });
    this.element.year.textContent = this.now.getFullYear();
  };

  this.assemble = () => {
    clearChildNode(this.element.date);
    this.element.date.appendChild(this.element.day);
    this.element.date.appendChild(this.element.dateOfMonth);
    this.element.date.appendChild(this.element.month);
    this.element.date.appendChild(this.element.year);
  };

  this.assemble();
  this.update();
  setInterval(this.update, 1000 * 60); // update every minute

  this.date = () => this.element.date;
};
