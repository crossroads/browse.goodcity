import { resolve, all } from "rsvp";
import { alias, empty, not } from "@ember/object/computed";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import ApiService from "./api-base-service";
import _ from "lodash";
import asyncMixin from "browse/mixins/async_tasks";

/**
 *
 * Service to interact with cloud cart
 * Records are all of the requested_package type
 *
 */
export default ApiService.extend(asyncMixin, {
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

  updateRequestedQuantity(pkgId, quantity) {
    let record = this.get("cartItems").findBy("packageId", pkgId);
    if (record) {
      record.set("quantity", +quantity);
      return record.save();
    }
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
    this.get("store").findAll("package", { reload: true });
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

  add(pkgOrSet, quantity) {
    if (pkgOrSet.get("isSet")) {
      this.runTask(this.addSet(pkgOrSet));
    } else {
      this.runTask(this.addPackage(pkgOrSet, quantity));
    }
  },

  /**
   * Adds the packages of the set to the cloud cart.
   * If the user is not logged in, will only save it locally
   */
  addSet(packageSet) {
    return all(
      packageSet
        .get("packages")
        .map(pkg => this.addPackage(pkg, pkg.get("quantity")))
    );
  },

  /**
   * Adds a package to the cloud cart.
   * If the user is not logged in, will only save it locally
   */
  addPackage(pkg, quantity) {
    let _this = this;
    let record = this.get("store").createRecord("requested_package", {
      packageId: pkg.get("id"),
      package: pkg,
      isAvailable: pkg.get("isAvailable"),
      quantity: +quantity
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

  remove(pkgOrSet) {
    if (pkgOrSet.get("isSet")) {
      this.runTask(this.removeSet(pkgOrSet));
    } else {
      this.runTask(this.removePackage(pkgOrSet));
    }
  },

  /**
   * Removes the packages of the set from the cart
   * The changes are local only if the user is not logged in
   */
  removeSet(packageSet) {
    return all(packageSet.get("packages").map(pkg => this.removePackage(pkg)));
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
   * Returns true if the package or set is already in the cart
   */
  contains(pkgOrSet) {
    if (pkgOrSet.get("isSet")) {
      return this.containsSet(pkgOrSet);
    }
    return this.containsPackage(pkgOrSet);
  },

  /**
   * Returns true if the package is already in the cart
   */
  containsPackage(pkg) {
    return !!this.getCartItemForPackage(pkg);
  },

  /**
   * Returns true if all of the set's packages are in the cart
   */
  containsSet(packageSet) {
    return packageSet.get("packages").every(pkg => this.containsPackage(pkg));
  },

  /**
   * Returns true if the package or set is both in the cart and available
   */
  isAvailable(pkgOrSet) {
    if (!this.contains(pkgOrSet)) {
      return false;
    }

    let packages = pkgOrSet.get("isSet")
      ? pkgOrSet.get("packages").toArray()
      : [pkgOrSet];

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
    let isPackageSet = record.get("isSet");
    let categoryId = record.get("allPackageCategories.firstObject.id");
    let sortBy = "createdAt:desc";

    const route = isPackageSet ? "package_set" : "package";
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
      let refs = {};

      this.get("packages").forEach(pkg => {
        // Single packages
        if (!pkg.get("hasSiblingPackages")) {
          res.push(pkg);
          return;
        }

        // Items
        const packageSet = pkg.get("packageSet");
        const packageSetId = packageSet.get("id");

        if (refs[packageSetId]) {
          return; // Already processed
        }

        if (this.isAvailable(packageSet)) {
          // We mark this item as in cart and available
          refs[packageSetId] = packageSet;
          res.push(packageSet);
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
      .forEach(pkg => this.add(pkg, 1));
  }
});
