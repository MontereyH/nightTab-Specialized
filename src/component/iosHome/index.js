import { node } from '../../utility/node';
import './index.css';
import { IOSToolbar } from './toolbar';
import './toolbar.css';

// Example data (replace with persistent state as needed)
export const initialItems = [
  { type: 'bookmark', id: 'b1', title: 'Google', url: 'https://google.com', icon: '🌐' },
  { type: 'bookmark', id: 'b2', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { type: 'folder', id: 'f1', title: 'Work', items: [
    { type: 'bookmark', id: 'b3', title: 'Docs', url: 'https://docs.com', icon: '📄' },
    { type: 'bookmark', id: 'b4', title: 'Mail', url: 'https://mail.com', icon: '✉️' }
  ]}
];

export const IOSHome = function({ items = initialItems } = {}) {
  this.items = items;
  this.appSize = 100;
  this.iconColor = '#222';
  this.bookmarkColor = '#fff';
  this.bookmarkAlpha = 1;
  this.showSearch = true;
  this.searchEngine = 'google';
  this.backgroundType = 'theme';
  this.backgroundColor = '#f7f7fa';
  this.backgroundImage = '';
  this.draggedBookmark = null;
  this.draggedFolder = null;
  this.draggedSearch = false;
  this.dragOverIndex = null; // <-- Track drag preview index
  this.element = node('div|class:ios-home-root');

  // Toolbar
  this.toolbar = new IOSToolbar({
    onSettings: () => this.openSettings(),
    onAdd: () => this.openAddModal()
  });
  this.element.appendChild(this.toolbar);

  // Main grid
  this.grid = node('div|class:ios-home-grid');
  this.element.appendChild(this.grid);

  // Helper: find and remove bookmark by id (from root or any folder)
  this.removeBookmarkById = (id) => {
    // Remove from root
    let idx = this.items.findIndex(i => i.type === 'bookmark' && i.id === id);
    if (idx !== -1) return this.items.splice(idx, 1)[0];
    // Remove from folders
    for (const folder of this.items.filter(i => i.type === 'folder')) {
      let fidx = folder.items.findIndex(bm => bm.id === id);
      if (fidx !== -1) return folder.items.splice(fidx, 1)[0];
    }
    return null;
  };

  // Persistent node map for FLIP animation
  this.nodeMap = this.nodeMap || {};
  this.render = () => {
    console.log('[IOSHome] render called', this.items);
    // Set background
    if (this.backgroundType === 'color') {
      document.body.style.background = this.backgroundColor;
    } else if (this.backgroundType === 'image' && this.backgroundImage) {
      document.body.style.background = `url('${this.backgroundImage}') center/cover no-repeat`;
    } else {
      document.body.style.background = '';
    }
    // Set icon size and color CSS variables
    document.body.style.setProperty('--icon-size', this.appSize + 'px');
    document.body.style.setProperty('--icon-font-size', (this.appSize * 0.48) + 'px');
    document.body.style.setProperty('--label-font-size', (this.appSize * 0.18) + 'px');
    document.body.style.setProperty('--bookmark-bg', this.bookmarkColor);
    // Render grid
    this.grid.innerHTML = '';
    this.grid.style.gridTemplateColumns = `repeat(auto-fit, minmax(${this.appSize}px, 1fr))`;
    // --- Always allow drop on main grid ---
    this.grid.ondragover = (e) => {
      e.preventDefault();
      this.grid.classList.add('drag-over');
      // If dragging over empty grid, set dragOverIndex to end
      if (this.draggedBookmark || this.draggedFolder || this.draggedSearch) {
        this.dragOverIndex = this.items.length;
        this.render();
      }
    };
    this.grid.ondragleave = (e) => {
      this.grid.classList.remove('drag-over');
      this.dragOverIndex = null;
      this.render();
    };
    this.grid.ondrop = (e) => {
      this.grid.classList.remove('drag-over');
      if (this.draggedBookmark) {
        this.removeBookmarkById(this.draggedBookmark.id);
        if (!this.items.some(i => i.type === 'bookmark' && i.id === this.draggedBookmark.id)) {
          this.items.splice(this.dragOverIndex ?? this.items.length, 0, this.draggedBookmark);
        }
        this.draggedBookmark = null;
        this.dragOverIndex = null;
        let modal = document.querySelector('.ios-folder-modal');
        if (modal) modal.remove();
        this.render();
      } else if (this.draggedFolder) {
        this.removeBookmarkById(this.draggedFolder.id);
        if (!this.items.some(i => i.type === 'folder' && i.id === this.draggedFolder.id)) {
          this.items.splice(this.dragOverIndex ?? this.items.length, 0, this.draggedFolder);
        }
        this.draggedFolder = null;
        this.dragOverIndex = null;
        this.render();
      } else if (this.draggedSearch) {
        const fromIdx = this.items.findIndex(i => i === '__search__');
        const toIdx = this.dragOverIndex ?? (this.items.length - 1);
        if (fromIdx !== -1 && fromIdx !== toIdx) {
          const [moved] = this.items.splice(fromIdx, 1);
          this.items.splice(toIdx, 0, moved);
        }
        this.draggedSearch = false;
        this.dragOverIndex = null;
        this.render();
      }
    };
    // --- End always allow drop ---
    // Helper to render a draggable icon (bookmark, folder, or search)
    const renderDraggableIcon = (type, item, idx, isPlaceholder = false) => {
      let icon;
      if (isPlaceholder) {
        icon = node('div|class:ios-app-placeholder');
        icon.style.width = icon.style.height = `var(--icon-size)`;
        icon.style.background = 'rgba(0,0,0,0.08)';
        icon.style.borderRadius = '24px';
        return icon;
      }
      if (type === 'bookmark') {
        icon = node('div|class:ios-app-icon');
        icon.style.width = icon.style.height = `var(--icon-size)`;
        icon.style.background = hexToRgba(this.bookmarkColor, this.bookmarkAlpha);
        icon.innerHTML = `<div class=\"ios-app-icon-img\" style=\"font-size:var(--icon-font-size);color:${this.iconColor}\">${item.icon}</div><div class=\"ios-app-label\" style=\"font-size:var(--label-font-size)\">${item.title}</div>`;
        icon.onclick = () => window.open(item.url, '_blank');
        icon.draggable = true;
        icon.ondragstart = (e) => {
          this.draggedBookmark = item;
          this.draggedFolder = null;
          this.draggedSearch = false;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', 'bookmark');
        };
      } else if (type === 'folder') {
        icon = node('div|class:ios-folder-icon');
        icon.style.width = icon.style.height = `var(--icon-size)`;
        icon.style.background = hexToRgba(this.bookmarkColor, this.bookmarkAlpha);
        icon.innerHTML = `<div class=\"ios-folder-img\" style=\"font-size:var(--icon-font-size);color:${this.iconColor}\">📁</div><div class=\"ios-app-label\" style=\"font-size:var(--label-font-size)\">${item.title}</div>`;
        icon.onclick = () => this.openFolder(item);
        icon.draggable = true;
        icon.ondragstart = (e) => {
          this.draggedFolder = item;
          this.draggedBookmark = null;
          this.draggedSearch = false;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', 'folder');
        };
      } else if (type === 'search') {
        icon = node('div|class:ios-app-icon');
        icon.style.width = icon.style.height = `var(--icon-size)`;
        icon.style.background = hexToRgba(this.bookmarkColor, this.bookmarkAlpha);
        icon.innerHTML = `<div class=\"ios-app-icon-img\" style=\"font-size:var(--icon-font-size);color:${this.iconColor}\">🔍</div><div class=\"ios-app-label\" style=\"font-size:var(--label-font-size)\">Search</div>`;
        icon.onclick = () => this.openSearchModal();
        icon.draggable = true;
        icon.ondragstart = (e) => {
          this.draggedSearch = true;
          this.draggedBookmark = null;
          this.draggedFolder = null;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', 'search');
        };
      }
      // All icons: allow drop before/after for any type
      icon.ondragover = (e) => {
        e.preventDefault();
        icon.classList.add('drag-over');
        if (this.draggedBookmark || this.draggedFolder || this.draggedSearch) {
          if (this.dragOverIndex !== idx) {
            this.dragOverIndex = idx;
            this.render();
          }
        }
      };
      icon.ondragleave = (e) => {
        icon.classList.remove('drag-over');
        this.dragOverIndex = null;
        this.render();
      };
      icon.ondrop = (e) => {
        icon.classList.remove('drag-over');
        let fromIdx = null, toIdx = idx;
        if (this.draggedBookmark) fromIdx = this.items.findIndex(i => i.id === this.draggedBookmark.id);
        else if (this.draggedFolder) fromIdx = this.items.findIndex(i => i.id === this.draggedFolder.id);
        else if (this.draggedSearch) fromIdx = this.items.findIndex(i => i === '__search__');
        if (fromIdx !== null && fromIdx !== -1 && fromIdx !== toIdx) {
          let moved;
          if (this.draggedBookmark) moved = this.items.splice(fromIdx, 1)[0];
          else if (this.draggedFolder) moved = this.items.splice(fromIdx, 1)[0];
          else if (this.draggedSearch) moved = this.items.splice(fromIdx, 1)[0];
          this.items.splice(toIdx, 0, moved);
          this.draggedBookmark = null;
          this.draggedFolder = null;
          this.draggedSearch = false;
          this.dragOverIndex = null;
          this.render();
        }
      };
      return icon;
    };
    // FLIP animation: store old positions by key
    const prevRects = {};
    Array.from(this.grid.children).forEach(child => {
      const key = child.dataset.key;
      if (key) prevRects[key] = child.getBoundingClientRect();
    });
    // Render all items in order, plus search if enabled
    let itemsToRender = [...this.items];
    if (this.showSearch && !itemsToRender.includes('__search__')) itemsToRender.push('__search__');
    if (!this.showSearch) itemsToRender = itemsToRender.filter(i => i !== '__search__');
    // --- Drag preview: insert placeholder at dragOverIndex ---
    let dragging = this.draggedBookmark || this.draggedFolder || this.draggedSearch;
    let dragIdx = this.dragOverIndex;
    let draggedKey = this.draggedBookmark?.id || this.draggedFolder?.id || (this.draggedSearch ? '__search__' : null);
    let filtered = itemsToRender.filter(i => (i === '__search__' ? '__search__' : i.id) !== draggedKey);
    if (dragging && dragIdx !== null && dragIdx !== undefined) {
      filtered = [
        ...filtered.slice(0, dragIdx),
        { type: 'placeholder', id: 'placeholder' },
        ...filtered.slice(dragIdx)
      ];
    }
    // Build keyed nodes, persistently
    const nodes = filtered.map((item, idx) => {
      if (item.type === 'placeholder') {
        return renderDraggableIcon(null, null, idx, true);
      }
      let key = item === '__search__' ? '__search__' : item.id;
      let node = this.nodeMap[key];
      if (!node) {
        if (item === '__search__') node = renderDraggableIcon('search', {}, idx);
        else if (item.type === 'bookmark') node = renderDraggableIcon('bookmark', item, idx);
        else if (item.type === 'folder') node = renderDraggableIcon('folder', item, idx);
        node.dataset.key = key;
        this.nodeMap[key] = node;
      }
      // Always update icon content for live changes
      if (item === '__search__') {
        node.onclick = () => this.openSearchModal();
      } else if (item.type === 'bookmark') {
        node.onclick = () => window.open(item.url, '_blank');
      } else if (item.type === 'folder') {
        node.onclick = () => this.openFolder(item);
      }
      return node;
    });
    // --- Render nodes with FLIP animation ---
    // Remove all children before appending
    while (this.grid.firstChild) this.grid.removeChild(this.grid.firstChild);
    nodes.forEach(node => this.grid.appendChild(node));
    // After rendering nodes:
    console.log('[IOSHome] grid children:', this.grid.children.length, 'nodes:', nodes);
  };
  this.render();
};

// Utility function: hex to rgba color conversion
function hexToRgba(hex, alpha) {
  if (!hex || hex.length !== 7) return `rgba(255,255,255,${alpha})`;
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
