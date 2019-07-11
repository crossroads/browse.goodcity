import Ember from "ember";
import ApiService from "./api-base-service";
import _ from "lodash";

/**
 *
 * Service to interact with cloud cart
 * Records are all of the requested_package type
 *
 */
export default ApiService.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  localStorage: Ember.inject.service(),
  preloadService: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.get("session").addObserver(
      "currentUser",
      this.onUserChange.bind(this)
    );
    this.onUserChange();
    this.get("preloadService").one("data", () => {
      this.restoreGuestItems();
    });
  },

  // ---- Properties

  cartItems: Ember.computed(function() {
    return this.get("store").peekAll("requested_package");
  }),

  packages: Ember.computed("cartItems.[]", function() {
    return this.get("cartItems").mapBy("package");
  }),

  offlineCartItems: Ember.computed(
    "cartItems.[]",
    "cartItems.@each.id",
    function() {
      return this.get("cartItems").filter(it => !it.get("id"));
    }
  ),

  availableCartItems: Ember.computed(
    "cartItems.[]",
    "cartItems.@each.isAvailable",
    function() {
      return this.get("cartItems").filterBy("isAvailable", true);
    }
  ),

  unavailableCartItems: Ember.computed(
    "cartItems.[]",
    "cartItems.@each.isAvailable",
    function() {
      return this.get("cartItems").filterBy("isAvailable", false);
    }
  ),

  canCheckout: Ember.computed("availableCartItems.length", function() {
    const availableItemCount = this.get("availableCartItems.length");
    return (
      availableItemCount > 0 &&
      availableItemCount === this.get("cartItems.length")
    );
  }),

  isLoggedIn: Ember.computed.alias("session.authToken"),
  isEmpty: Ember.computed.empty("cartItems"),
  isNotEmpty: Ember.computed.not("isEmpty"),
  counter: Ember.computed.alias("cartItems.length"),
  user: Ember.computed.alias("session.currentUser"),
  userId: Ember.computed.alias("user.id"),

  // ---- Hooks

  onUserChange() {
    const loggedIn = this.get("user");
    if (loggedIn) {
      this.onLogin();
    } else {
      this.onLogout();
    }
  },

  /**
   * When the user logs in we
   *    - fetch the user's cart items
   *    - push any record he/she might have added as a guest before
   *   logging in
   */
  onLogin() {
    this.populate().then(() => {
      this.persistLocalRecords();
    });
  },

  /**
   * When logging out, we clear the local data
   */
  onLogout() {
    this.get("store")
      .peekAll("requested_package")
      .forEach(record => this.get("store").unloadRecord(record));
  },

  // ---- Control methods

  /**
   * Checkout the cart and fill the order
   */
  checkoutOrder(order) {
    return this.POST(`/requested_packages/checkout`, {
      order_id: order.get("id")
    }).then(data => {
      this.get("store").pushPayload(data);
      return this.refresh();
    });
  },

  /**
   * Fetches the user's cart items from the api
   */
  populate() {
    if (!this.get("isLoggedIn")) {
      return Ember.RSVP.resolve();
    }
    return this.get("store").findAll("requested_package", { reload: true });
  },

  /**
   * Clears the local data and re-fetches the data
   */
  refresh() {
    this.get("store").unloadAll("requested_package");
    return this.populate();
  },

  /**
   * Cart items that were added as guest are pushed to the db
   */
  persistLocalRecords() {
    if (!this.get("isLoggedIn")) {
      return Ember.RSVP.resolve();
    }

    this.clearDuplicates();

    return Ember.RSVP.all(
      this.get("offlineCartItems").map(it => {
        it.set("user", this.get("user"));
        it.set("userId", this.get("userId"));
        return it.save();
      })
    ).then(res => {
      this.forgetGuestItems();
      return res;
    });
  },

  add(pkgOrItem) {
    if (pkgOrItem.get("isItem")) {
      return this.addItem(pkgOrItem);
    }
    return this.addPackage(pkgOrItem);
  },

  /**
   * Adds the packages of the item to the cloud cart.
   * If the user is not logged in, will only save it locally
   */
  addItem(item) {
    return Ember.RSVP.all(
      item.get("packages").map(pkg => this.addPackage(pkg))
    );
  },

  /**
   * Adds a package to the cloud cart.
   * If the user is not logged in, will only save it locally
   */
  addPackage(pkg) {
    let record = this.get("store").createRecord("requested_package", {
      packageId: pkg.get("id"),
      package: pkg,
      isAvailable: pkg.get("isAvailable")
    });

    this.notifyPropertyChange("cartItems");

    if (!this.get("isLoggedIn")) {
      // Will be persisted when the user logs in
      this.rememberGuestItems();
      return Ember.RSVP.resolve();
    }

    record.set("user", this.get("user"));
    record.set("userId", this.get("userId"));
    return record.save();
  },

  remove(pkgOrItem) {
    if (pkgOrItem.get("isItem")) {
      return this.removeItem(pkgOrItem);
    }
    return this.removePackage(pkgOrItem);
  },

  /**
   * Removes the packages of the item from the cart
   * The changes are local only if the user is not logged in
   */
  removeItem(item) {
    return Ember.RSVP.all(
      item.get("packages").map(pkg => this.removePackage(pkg))
    );
  },

  /**
   * Remove the cart item of the specified package
   * The changes are local only if the user is not logged in
   */
  removePackage(pkg) {
    let cartItem = this.getCartItemForPackage(pkg);
    if (!cartItem) {
      return Ember.computed.resolve();
    }
    return this.removeCartItem(cartItem);
  },

  /**
   * Remove a cart item from the cart
   * The changes are local only if the user is not logged in
   */
  removeCartItem(cartItem) {
    cartItem.deleteRecord();

    if (!this.get("isLoggedIn")) {
      return Ember.RSVP.resolve();
    }
    return cartItem.save();
  },

  /**
   * Returns the cart item associated with the package
   */
  getCartItemForPackage(pkg) {
    return this.get("cartItems").findBy("packageId", pkg.id);
  },

  /**
   * Returns true if the package or item is already in the cart
   */
  contains(pkgOrItem) {
    if (pkgOrItem.get("isItem")) {
      return this.containsItem(pkgOrItem);
    }
    return this.containsPackage(pkgOrItem);
  },

  /**
   * Returns true if the package is already in the cart
   */
  containsPackage(pkg) {
    return !!this.getCartItemForPackage(pkg);
  },

  /**
   * Returns true if all of the item's packages are in the cart
   */
  containsItem(item) {
    return item.get("packages").every(pkg => this.containsPackage(pkg));
  },

  /**
   * Returns true if the package or item is both in the cart and available
   */
  isAvailable(pkgOrItem) {
    if (!this.contains(pkgOrItem)) {
      return false;
    }

    let packages = pkgOrItem.get("isItem")
      ? pkgOrItem.get("packages").toArray()
      : [pkgOrItem];

    return _.every(packages, pkg => {
      return this.getCartItemForPackage(pkg).get("isAvailable");
    });
  },

  /**
   * If an offline item already exists in the user cart, clear it
   */
  clearDuplicates() {
    this.get("offlineCartItems").forEach(it => {
      const existingItem = this.get("cartItems").find(ci => {
        return ci.get("id") && ci.get("packageId") === it.get("packageId");
      });

      if (existingItem) {
        it.deleteRecord();
        this.notifyPropertyChange("cartItems");
      }
    });
  },

  /**
   * If a package is in the cart, as well as all it's siblings
   * It will appear as an 'item' (if they are available)
   *
   * This property groups them as such
   *
   * e.g
   *  [
   *    ...
   *    {
   *       record: <the package or item>
   *       isAvailabel: <availability>
   *    }
   *  ]
   */
  groupedPackages: Ember.computed(
    "cartItems.[]",
    "cartItems.@each.isAvailable",
    function() {
      let res = [];
      let itemsRef = {};

      this.get("packages").filter(pkg => {
        // Single packages
        if (!pkg.get("hasSiblingPackages")) {
          res.push(pkg);
          return;
        }

        // Items
        const item = pkg.get("item");
        const itemId = item.get("id");

        if (itemsRef[itemId]) {
          return; // Already processed
        }

        if (this.isAvailable(item)) {
          // We mark this item as in cart and available
          itemsRef[itemId] = item;
          res.push(item);
          return;
        }

        res.push(pkg); // We store the package a singleton
      });

      return _.map(res, record => {
        const isAvailable = this.isAvailable(record);
        return { record, isAvailable };
      });
    }
  ),

  // --- Helpers

  rememberGuestItems() {
    const refs = this.get("offlineCartItems").mapBy("packageId");
    this.get("localStorage").write("offlineCart", refs);
  },

  forgetGuestItems() {
    this.get("localStorage").remove("offlineCart");
  },

  restoreGuestItems() {
    const pkgIds = this.get("localStorage").read("offlineCart", []);

    pkgIds
      .map(id => this.get("store").peekRecord("package", id))
      .filter(_.identity)
      .reject(pkg => this.contains(pkg))
      .forEach(pkg => this.add(pkg));
  }
});
