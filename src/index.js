import './component/iosHome/index.css';
import { IOSHome } from './component/iosHome/index.js';
import { initialItems } from './component/iosHome/index.js';

window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root') || document.body;
  root.innerHTML = '';
  const iosHome = new IOSHome({ items: initialItems });
  root.appendChild(iosHome.element);
});
