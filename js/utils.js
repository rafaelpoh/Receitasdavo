/**
 * DOM Element Builder Helper.
 * Replaces the need for innerHTML, complying strictly with security check-mate rules.
 * 
 * @param {string} tag - HTML tag name (e.g. 'div', 'button')
 * @param {object} attrs - HTML attributes, event listeners (e.g. onclick), styles, datasets
 * @param {...(HTMLElement|string|number|Array)} children - Child elements or text
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'style' && typeof val === 'object') {
      Object.assign(element.style, val);
    } else if (key.startsWith('on') && typeof val === 'function') {
      // Binds events natively: e.g. onclick -> click
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, val);
    } else if (key === 'dataset' && typeof val === 'object') {
      Object.assign(element.dataset, val);
    } else if (val !== undefined && val !== null) {
      element.setAttribute(key, val);
    }
  }
  
  for (const child of children) {
    if (child === undefined || child === null) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    } else if (Array.isArray(child)) {
      child.forEach(c => {
        if (c instanceof HTMLElement) {
          element.appendChild(c);
        } else if (typeof c === 'string' || typeof c === 'number') {
          element.appendChild(document.createTextNode(c));
        }
      });
    }
  }
  return element;
}

/**
 * Event Delegation Helper.
 * Encapsulates event delegation patterns for dynamic lists (recipes, ingredients).
 * 
 * @param {HTMLElement} parent - The parent container element
 * @param {string} selector - Selector matching the interactive targets
 * @param {string} eventType - The trigger event type (e.g. 'click', 'change')
 * @param {function} handler - The execution function callback
 */
export function delegateEvent(parent, selector, eventType, handler) {
  if (!parent) return;
  parent.addEventListener(eventType, (event) => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) {
      handler(event, target);
    }
  });
}

/**
 * Toast Notifications System.
 * Renders quick messages for user feedback (errors, completions, loads).
 */
export function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = el('div', { class: 'toast-container' });
    document.body.appendChild(container);
  }
  
  const toast = el('div', { class: `toast toast-${type}` }, 
    el('span', {}, message),
    el('button', { 
      class: 'dialog-close', 
      onclick: () => toast.remove(),
      style: { marginLeft: 'var(--space-md)' }
    }, '×')
  );
  
  container.appendChild(toast);
  
  // Transition out and destroy elements
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'opacity var(--transition-normal), transform var(--transition-normal)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}
