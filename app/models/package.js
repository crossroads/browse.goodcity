import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import cloudinaryImage from '../mixins/cloudinary_image';
const {
  getOwner
} = Ember;

export default Model.extend(cloudinaryImage, {
  quantity:        attr('number'),
  length:          attr('number'),
  width:           attr('number'),
  height:          attr('number'),
  notes:           attr('string'),

  createdAt:       attr('date'),
  updatedAt:       attr('date'),
  item:            belongsTo('item', { async: false }),
  packageType:     belongsTo('package_type', { async: false }),
  images:          hasMany('image', { async: false }),
  donorCondition:  belongsTo('donor_condition', { async: false }),
  itemId:          attr('number'),
  stockitSentOn:   attr('date'),
  orderId:         attr('number'),
  allowWebPublish: attr('boolean'),

  isDispatched: Ember.computed.bool("stockitSentOn"),

  isAvailable: Ember.computed('isDispatched', 'allowWebPublish', 'orderId', 'quantity', function() {
    return this.get("allowWebPublish");
  }),

  isUnavailableAndDesignated: Ember.computed('isDispatched', 'allowWebPublish', function() {
    return !this.get("isDispatched") && (!this.get("allowWebPublish") || this.get("orderId"));
  }),

  allPackageCategories: Ember.computed.alias('packageType.allPackageCategories'),

  _packages: Ember.computed(function() {
    return this.store.peekAll("package");
  }),

  hasSiblingPackages: Ember.computed('_packages.@each.itemId', function() {
    return this.get("itemId") && (this.get("_packages").filterBy("itemId", this.get("itemId")).length > 1);
  }),

  packageName: Ember.computed('packageType', function() {
    return this.get('packageType.name');
  }),

  packageTypeObject: Ember.computed('packageType', function() {
    var obj = this.get('packageType').getProperties('id', 'name', 'isItemTypeNode');
    obj.id = obj.packageTypeId = parseInt(obj.id, 10);
    return obj;
  }),

  dimensions: Ember.computed('width', 'height', 'length', function() {
    var res = '';
    var append = val => {
      if (val) { res += !res ? val : ' x ' + val; }
    };
    append(this.get('width'));
    append(this.get('height'));
    append(this.get('length'));
    return !res ? '' : res + 'cm';
  }),

  image: Ember.computed("images.@each.favourite", function() {
    return this.get('images').filterBy("favourite").get("firstObject");
  }),

  favouriteImage: Ember.computed.alias('image'),

  otherImages: Ember.computed('images.[]', function(){
    return this.get("images").toArray().removeObject(this.get("image"));
  }),

  sortedImages: Ember.computed('otherImages.[]', 'image', function(){
    var images = this.get('otherImages').toArray();
    images.unshift(this.get("image"));
    return images;
  }),

  displayImage: Ember.computed.alias('image'),

  displayImageUrl: Ember.computed("image", function() {
    return this.get('image.defaultImageUrl') || this.generateUrl(500, 500, true);
  }),

  previewImageUrl: Ember.computed('image', function() {
    return this.get('image.previewImageUrl') || this.generateUrl(265, 265, true);
  }),

  toCartItem() {
    let CartItem = getOwner(this)._lookupFactory('model:cart-item');

    return CartItem.create({
      id: Ember.get(this, 'id'),
      modelType: "package",
      name: Ember.get(this, 'packageType.name'),
      imageUrl: Ember.get(this, 'favouriteImage.cartImageUrl'),
      thumbImageUrl: Ember.get(this, 'favouriteImage.thumbImageUrl'),
      available: Ember.get(this, 'isAvailable')
    });
  }
});
