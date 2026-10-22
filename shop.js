(function () {
  'use strict';

  var allowed = ['clarity', 'stamina', 'calm', 'seasonal', 'ritual', 'curious'];
  var titles = { clarity: 'Clarity', stamina: 'Stamina', calm: 'Calm', seasonal: 'Seasonal', ritual: 'Ritual', curious: 'Curious' };
  var catalog = window.UA_SHOP_CATALOG;
  var available = !!catalog && Array.isArray(catalog.shelves) && Array.isArray(catalog.products);
  var requested = new URLSearchParams(window.location.search).get('feeling');
  var normalized = requested ? requested.trim().toLowerCase() : '';
  var selected = allowed.indexOf(normalized) !== -1 ? normalized : 'curious';
  var products = [];
  var seen = Object.create(null);

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function productUrl(value) {
    if (!text(value)) return null;
    try {
      var url = new URL(value);
      if (url.protocol !== 'https:' || (url.hostname !== 'quickvee.com' && url.hostname !== 'www.quickvee.com') || url.username || url.password) return null;
      return url.href;
    } catch (error) {
      return null;
    }
  }

  function element(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  }

  if (available) {
    catalog.products.forEach(function (product) {
      if (!product || !text(product.name) || !Array.isArray(product.shelves)) return;
      var href = productUrl(product.href);
      if (!href) return;
      var shelves = product.shelves.filter(function (id) { return allowed.indexOf(id) !== -1; });
      if (!shelves.length) return;
      var key = text(String(product.id || '')) + '|' + text(product.variant) + '|' + href;
      if (seen[key]) return;
      seen[key] = true;
      products.push({ name: text(product.name), variant: text(product.variant), summary: text(product.summary), href: href, shelves: shelves });
    });
  }

  var shelf = available ? catalog.shelves.filter(function (item) { return item && item.id === selected; })[0] : null;
  var title = titles[selected];
  document.title = 'Shop ' + title + ' | Urban Alchemist, Lincoln Park';
  document.getElementById('shop-title').textContent = 'Shop ' + title + '.';
  document.getElementById('shop-description').textContent = shelf && text(shelf.description) ? text(shelf.description) : 'A few things for whatever your day has in mind.';

  if (normalized && allowed.indexOf(normalized) === -1) {
    var queryNote = document.getElementById('shop-query-note');
    queryNote.textContent = 'We couldn’t find that feeling, so we’ve opened Curious. Choose another shelf below if you like.';
    queryNote.hidden = false;
  }

  document.querySelectorAll('#shop-shelves [data-shelf]').forEach(function (link) {
    var id = link.getAttribute('data-shelf');
    var count = products.filter(function (product) { return product.shelves.indexOf(id) !== -1; }).length;
    if (id === selected) link.setAttribute('aria-current', 'page');
    if (available) {
      var countNode = element('span', 'shop-shelf-count', String(count));
      countNode.setAttribute('aria-hidden', 'true');
      link.appendChild(countNode);
      link.setAttribute('aria-label', titles[id] + ', ' + count + (count === 1 ? ' product' : ' products'));
    }
  });

  if (available && /^\d{4}-\d{2}-\d{2}$/.test(catalog.verifiedAt || '')) {
    var checkedDate = new Date(catalog.verifiedAt + 'T12:00:00Z');
    if (!isNaN(checkedDate.getTime()) && checkedDate.toISOString().slice(0, 10) === catalog.verifiedAt) {
      var dateLabel = checkedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
      document.getElementById('shop-checked').textContent = 'Online selection checked ' + dateLabel + '. Current prices and availability are shown on Quickvee.';
    }
  }

  var matches = products.filter(function (product) { return product.shelves.indexOf(selected) !== -1; });
  var productList = document.getElementById('shop-products');
  var countLabel = document.getElementById('shop-count');
  countLabel.textContent = available ? matches.length + (matches.length === 1 ? ' product' : ' products') : '';
  document.getElementById('shop-results-title').textContent = title + ' online';

  matches.forEach(function (product, index) {
    var card = element('article', 'shop-product');
    var number = element('span', 'shop-product__number', String(index + 1).padStart(2, '0'));
    number.setAttribute('aria-hidden', 'true');
    card.appendChild(number);
    card.appendChild(element('h3', '', product.name));
    if (product.variant) card.appendChild(element('p', 'shop-product__variant', product.variant));
    if (product.summary) card.appendChild(element('p', 'shop-product__summary', product.summary));
    var link = element('a', 'shop-product__link', 'View options');
    link.href = product.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'View options for ' + product.name + (product.variant ? ', ' + product.variant : '') + ' on Quickvee (opens in a new tab)');
    var arrow = element('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    link.appendChild(arrow);
    card.appendChild(link);
    productList.appendChild(card);
  });

  if (!matches.length) {
    document.getElementById('shop-empty').hidden = false;
    if (available && shelf && text(shelf.emptyMessage)) document.getElementById('shop-empty-copy').textContent = text(shelf.emptyMessage);
    if (!available) {
      document.getElementById('shop-empty-title').textContent = 'The online selection is being refreshed.';
      document.getElementById('shop-empty-copy').textContent = 'Call us for today’s selection, or explore our Snacks collection on Quickvee.';
      document.getElementById('shop-checked').textContent = 'Current prices and availability are shown on Quickvee.';
      var browse = element('a', 'shop-empty__browse', 'Browse snacks on Quickvee ↗');
      browse.href = 'https://quickvee.com/merchant/SYE2217487IL?category=Snacks&orderMethod=delivery&categoryId=106635&isSideBarFilter=true';
      browse.target = '_blank';
      browse.rel = 'noopener noreferrer';
      document.getElementById('shop-empty').appendChild(browse);
    }
  }
})();
