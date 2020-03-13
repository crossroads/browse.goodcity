import { resolve, all } from "rsvp";
import { alias, empty, not } from "@ember/object/computed";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import ApiService from "./api-base-service";
import _ from "lodash";
import { getOwner } from "@ember/application";

/**
 *
 * Service to interact with cloud cart
 * Records are all of the requested_package type
 *
 */
export default ApiService.extend({
  store: service(),
  session: service(),
  localStorage: service(),
  preloadService: service(),
  messageBox: service(),

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

  cartItems: computed(function() {
    return this.get("store").peekAll("requested_package");
  }),

  packages: computed("cartItems.[]", function() {
    return this.get("cartItems").mapBy("package");
  }),

  offlineCartItems: computed("cartItems.[]", "cartItems.@each.id", function() {
    return this.get("cartItems").filter(it => !it.get("id"));
  }),

  availableCartItems: computed(
    "cartItems.[]",
    "cartItems.@each.isAvailable",
    function() {
      return this.get("cartItems").filterBy("isAvailable", true);
    }
  ),

  unavailableCartItems: computed(
    "cartItems.[]",
    "cartItems.@each.isAvailable",
    function() {
      return this.get("cartItems").filterBy("isAvailable", false);
    }
  ),

  hasValidItems: computed("unavailableCartItems", "isNotEmpty", function() {
    return (
      this.get("isNotEmpty") && this.get("unavailableCartItems.length") === 0
    );
  }),

  canCheckout: computed("availableCartItems.length", function() {
    const availableItemCount = this.get("availableCartItems.length");
    return (
      availableItemCount > 0 &&
      availableItemCount === this.get("cartItems.length")
    );
  }),

  isLoggedIn: alias("session.authToken"),
  isEmpty: empty("cartItems"),
  isNotEmpty: not("isEmpty"),
  counter: alias("cartItems.length"),
  user: alias("session.currentUser"),
  userId: alias("user.id"),

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
      return resolve();
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
      return resolve();
    }

    this.clearDuplicates();

    return all(
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
    let promise;
    let loadingView = getOwner(this)
      .lookup("component:loading")
      .append();

    if (pkgOrItem.get("isItem")) {
      promise = this.addItem(pkgOrItem);
    } else {
      promise = this.addPackage(pkgOrItem);
    }

    promise.finally(() => {
      loadingView.destroy();
    });
  },

  /**
   * Adds the packages of the item to the cloud cart.
   * If the user is not logged in, will only save it locally
   */
  addItem(item) {
    return all(item.get("packages").map(pkg => this.addPackage(pkg)));
  },

  /**
   * Adds a package to the cloud cart.
   * If the user is not logged in, will only save it locally
   */
  addPackage(pkg) {
    let _this = this;
    let record = this.get("store").createRecord("requested_package", {
      packageId: pkg.get("id"),
      package: pkg,
      isAvailable: pkg.get("isAvailable")
    });

    this.notifyPropertyChange("cartItems");

    if (!this.get("isLoggedIn")) {
      // Will be persisted when the user logs in
      this.rememberGuestItems();
      return resolve();
    }

    record.set("user", this.get("user"));
    record.set("userId", this.get("userId"));

    return record.save().catch(error => {
      let errorMessage = error.errors[0].detail.message;
      // Remove record from Cart
      _this.get("store").unloadRecord(record);
      _this.get("messageBox").alert(errorMessage, () => {
        _this.get("router").transitionTo("/");
      });
    });
  },

  remove(pkgOrItem) {
    let promise;
    let loadingView = getOwner(this)
      .lookup("component:loading")
      .append();

    if (pkgOrItem.get("isItem")) {
      promise = this.removeItem(pkgOrItem);
    } else {
      promise = this.removePackage(pkgOrItem);
    }

    promise.finally(() => {
      loadingView.destroy();
    });
  },

  /**
   * Removes the packages of the item from the cart
   * The changes are local only if the user is not logged in
   */
  removeItem(item) {
    return all(item.get("packages").map(pkg => this.removePackage(pkg)));
  },

  /**
   * Remove the cart item of the specified package
   * The changes are local only if the user is not logged in
   */
  removePackage(pkg) {
    let cartItem = this.getCartItemForPackage(pkg);
    if (!cartItem) {
      return resolve();
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
      return resolve();
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

  navigateToItemDetails(record) {
    let isItem = record.get("isItem");
    let categoryId = record.get("allPackageCategories.firstObject.id");
    let sortBy = "createdAt:desc";

    const route = isItem ? "item" : "package";
    const routeId = record.get("id");
    this.get("router").transitionTo(route, routeId, {
      queryParams: {
        categoryId: categoryId,
        sortBy: sortBy
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
  groupedPackages: computed(
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
