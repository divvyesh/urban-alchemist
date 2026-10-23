(function () {
  'use strict';

  var catalog = window.UA_SHOP_CATALOG;
  var available = !!catalog && Array.isArray(catalog.shelves) && Array.isArray(catalog.products);
  var requested = new URLSearchParams(window.location.search).get('feeling');
  var normalized = requested ? requested.trim().toLowerCase() : '';
  var shelves = [];
  var shelfById = Object.create(null);
  var products = [];
  var seen = Object.create(null);
  var snacksUrl = 'https://quickvee.com/merchant/SYE2217487IL?category=Snacks&orderMethod=delivery&categoryId=106635&isSideBarFilter=true';

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function safeSlug(value) {
    return typeof value === 'string' && value.length <= 64 && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);
  }

  function productImage(value) {
    var path = text(value);
    return path.length <= 256 && path.indexOf('/assets/products/') === 0 && /^\/assets\/products\/(?:[a-z0-9][a-z0-9_-]*\/)*[a-z0-9][a-z0-9_-]*\.(?:avif|gif|jpe?g|png|webp)$/i.test(path) ? path : '';
  }

  function productDestination(value) {
    if (!text(value)) return null;
    try {
      var url = new URL(value);
      if (url.protocol !== 'https:' || (url.hostname !== 'quickvee.com' && url.hostname !== 'www.quickvee.com') || url.username || url.password) return null;
      var listedId = url.searchParams.get('product');
      return { href: url.href, group: listedId ? url.pathname + '|' + listedId : url.href, listedId: listedId };
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

  /* A flavor-specific card and its parent listing remain one inventory group. */
  function uniqueGroups(items) {
    var groups = [];
    var positions = Object.create(null);
    items.forEach(function (product) {
      var position = positions[product.group];
      if (position === undefined) {
        positions[product.group] = groups.length;
        groups.push(product);
      } else if (product.parentListing && !groups[position].parentListing) {
        groups[position] = product;
      }
    });
    return groups;
  }

  if (available) {
    catalog.shelves.forEach(function (shelf) {
      if (!shelf || !safeSlug(shelf.id) || shelf.id === 'all' || !text(shelf.title) || shelfById[shelf.id]) return;
      var clean = { id: shelf.id, title: text(shelf.title), description: text(shelf.description), emptyMessage: text(shelf.emptyMessage) };
      shelves.push(clean);
      shelfById[clean.id] = clean;
    });

    catalog.products.forEach(function (product) {
      if (!product || !text(product.name)) return;
      var destination = productDestination(product.href);
      if (!destination) return;
      var assignments = [];
      var candidates = Array.isArray(product.shelves) ? product.shelves.slice() : [];
      if (product.primaryShelf) candidates.push(product.primaryShelf);
      candidates.forEach(function (id) {
        if (typeof id === 'string' && shelfById[id] && assignments.indexOf(id) === -1) assignments.push(id);
      });
      var name = text(product.name);
      var variant = text(product.variant);
      var key = JSON.stringify([destination.group, name, variant]);
      if (seen[key]) {
        assignments.forEach(function (id) { if (seen[key].shelves.indexOf(id) === -1) seen[key].shelves.push(id); });
        return;
      }
      var clean = { name: name, variant: variant, summary: text(product.summary), image: productImage(product.image), imageAlt: text(product.imageAlt), href: destination.href, group: destination.group, parentListing: String(product.id) === destination.listedId, shelves: assignments };
      seen[key] = clean;
      products.push(clean);
    });
  }

  var allProducts = uniqueGroups(products);
  var populated = shelves.filter(function (shelf) {
    shelf.products = uniqueGroups(products.filter(function (product) { return product.shelves.indexOf(shelf.id) !== -1; }));
    return shelf.products.length > 0;
  });
  var defaultId = populated.some(function (shelf) { return shelf.id === 'curious'; }) ? 'curious' : (populated.length ? populated[0].id : 'all');
  var validRequest = (normalized === 'all' && allProducts.length > 0) || populated.some(function (shelf) { return shelf.id === normalized; });
  var selected = validRequest ? normalized : defaultId;
  var shelf = selected === 'all' ? null : shelfById[selected];
  var title = shelf ? shelf.title : 'All products';
  var matches = shelf ? shelf.products : allProducts;
  document.title = 'Shop ' + title + ' | Urban Alchemist, Lincoln Park';
  document.getElementById('shop-title').textContent = selected === 'all' ? 'Shop all products.' : 'Shop ' + title + '.';
  document.getElementById('shop-description').textContent = shelf && shelf.description ? shelf.description : 'Explore snacks, drinks and other everyday finds, or choose a shelf for another way in.';

  if (available && normalized && !validRequest) {
    var queryNote = document.getElementById('shop-query-note');
    queryNote.textContent = 'That shelf is not online right now, so we’ve opened ' + title + '. Choose another shelf below if you like.';
    queryNote.hidden = false;
  }

  var navigation = document.getElementById('shop-shelves');
  navigation.replaceChildren();
  function addShelfLink(id, label, count) {
    var link = element('a', '', label);
    link.href = '/shop.html?feeling=' + encodeURIComponent(id);
    link.setAttribute('data-shelf', id);
    if (id === selected) link.setAttribute('aria-current', 'page');
    var countNode = element('span', 'shop-shelf-count', String(count));
    countNode.setAttribute('aria-hidden', 'true');
    link.appendChild(countNode);
    link.setAttribute('aria-label', label + ', ' + count + (count === 1 ? ' product' : ' products'));
    navigation.appendChild(link);
  }
  if (allProducts.length) addShelfLink('all', 'All products', allProducts.length);
  populated.forEach(function (item) { addShelfLink(item.id, item.title, item.products.length); });
  if (!available) {
    var fallback = element('a', '', 'Browse snacks on Quickvee ↗');
    fallback.href = snacksUrl;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    navigation.appendChild(fallback);
  }

  if (available && /^\d{4}-\d{2}-\d{2}$/.test(catalog.verifiedAt || '')) {
    var checkedDate = new Date(catalog.verifiedAt + 'T12:00:00Z');
    if (!isNaN(checkedDate.getTime()) && checkedDate.toISOString().slice(0, 10) === catalog.verifiedAt) {
      var dateLabel = checkedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
      document.getElementById('shop-checked').textContent = 'Online selection checked ' + dateLabel + '. Current prices and availability are shown on Quickvee.';
    }
  }

  var productList = document.getElementById('shop-products');
  var countLabel = document.getElementById('shop-count');
  countLabel.textContent = available ? matches.length + (matches.length === 1 ? ' product' : ' products') : '';
  document.getElementById('shop-results-title').textContent = selected === 'all' ? 'The online selection' : title + ' online';

  matches.forEach(function (product, index) {
    var card = element('article', 'shop-product');
    var optionsLabel = 'View options for ' + product.name + (product.variant ? ', ' + product.variant : '') + ' on Quickvee (opens in a new tab)';
    if (product.image) {
      var imageLink = element('a', 'shop-product__image-link');
      imageLink.href = product.href;
      imageLink.target = '_blank';
      imageLink.rel = 'noopener noreferrer';
      imageLink.setAttribute('aria-label', optionsLabel);
      var image = element('img', 'shop-product__image');
      image.alt = product.imageAlt || product.name;
      image.width = 600;
      image.height = 600;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', function () { imageLink.remove(); });
      image.src = product.image;
      imageLink.appendChild(image);
      card.appendChild(imageLink);
    }
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
    link.setAttribute('aria-label', optionsLabel);
    var arrow = element('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    link.appendChild(arrow);
    card.appendChild(link);
    productList.appendChild(card);
  });

  if (!matches.length) {
    document.getElementById('shop-empty').hidden = false;
    document.getElementById('shop-empty-title').textContent = 'No verified online products are listed yet';
    document.getElementById('shop-empty-copy').textContent = 'Call us to ask what is available in the shop today.';
    if (!available) {
      document.getElementById('shop-empty-title').textContent = 'The online selection is being refreshed.';
      document.getElementById('shop-empty-copy').textContent = 'Call us for today’s selection, or explore our Snacks collection on Quickvee.';
      document.getElementById('shop-checked').textContent = 'Current prices and availability are shown on Quickvee.';
      var browse = element('a', 'shop-empty__browse', 'Browse snacks on Quickvee ↗');
      browse.href = snacksUrl;
      browse.target = '_blank';
      browse.rel = 'noopener noreferrer';
      document.getElementById('shop-empty').appendChild(browse);
    }
  }
})();
