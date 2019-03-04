import Ember from 'ember';
import _ from 'lodash';
import { module, test } from 'qunit';
import startApp from 'browse/tests/helpers/start-app';
import { make, mockFindAll } from 'ember-data-factory-guy';

var App, order, gogo_van, user, user_profile, orderPurpose1, orderPurpose2 , organisation, pkg, ordersPackage, mocks, goodcityRequest, benificiary, identity_type1, package_type, purpose, requestPurposeUrl, goodsDetailsUrl, scheduleDetailsUrl, appointmentPageUrl, clientInfoUrl, bookingSuccessUrl, confirmBookingUrl, orderTransport;
var BookingTypes = {
  onlineOrder: { id:1, identifier: 'online-order'},
  appointment: { id:2, identifier: 'appointment'}
};

module('Acceptance | Book appointment/order ', {
  beforeEach: function() {
    $.mockjax.clear();
    App = startApp();
    user = make("user");
    organisation = make("organisation");
    pkg = make('package');
    purpose = make("purpose");
    order = make("order", { code: "L24489", state: "draft", createdById: user.id, organisationId: organisation.id,
      purposeDescription: 'test test test', peopleHelped: "2", bookingTypeId: BookingTypes.onlineOrder.id }).toJSON({ includeId: true });
    ordersPackage = make("orders_package", { quantity: 1, state: "requested", package: pkg,
      packageId: pkg.id, orderId: order.id});
    gogo_van = make("gogovan_transport");
    user_profile = {"id": user.id,"first_name": user.get('firstName'), "last_name": user.get('lastName'),
    "mobile": user.get('mobile'), "user_role_ids": [1] };
    benificiary = {created_by_id: user.id, first_name: "Test", id: 12, identity_number: "1233",
      identity_type_id: 1, last_name: "John", phone_number: "+85212312312", title: null};
    identity_type1 = {id: 1, name: "Hong Kong Identity Card"};
    package_type = make("package_type");
    goodcityRequest = {id: 1, quantity: 1, description: null, code_id: null,
      order_id: order.id, packageTypes: [{id: package_type.id }]};
    orderTransport = make("order_transport");
    mocks = [];
    $.mockjaxSettings.matchInRegistrationOrder = false;
    mocks.push(
      $.mockjax({url:`/api/v1/orders/*`,
        type:'GET', status:200,
        responseText: {
          booking_types: _.values(BookingTypes),
          order: order,
          goodcity_requests: [goodcityRequest]
        }
      }),
      $.mockjax({url:`/api/v1/booking_type*`,
        type:'GET', status:200,
        responseText: {
          booking_types: _.values(BookingTypes)
        }
      }),
      $.mockjax({url: "/api/v1/goodcity_request*", type: 'POST', status: 201,
        responseText: {goodcity_request: goodcityRequest}}),
      $.mockjax({url:"/api/v1/auth/current_user_profil*", responseText: user_profile }),
      $.mockjax({url: "/api/v1/available_*", type: 'GET', status: 200,
        responseText:["2018-06-14", "2018-06-15", "2018-06-16", "2018-06-19", "2018-06-20", "2018-06-21"]}),
      mockFindAll("gogovan_transport").returns({json: {gogovan_transports: [gogo_van.toJSON({includeId: true})]}}),
      mockFindAll('order').returns({ json: {orders: [order],
        packages: [pkg.toJSON({includeId: true})], orders_packages: [ordersPackage.toJSON({includeId: true})]}}),
      mockFindAll("booking_type").returns({json: {booking_types: _.values(BookingTypes)}}),
      mockFindAll("purpose").returns({json: {purposes: [purpose.toJSON({includeId: true})]}})
    );
    let date = moment(new Date()).format('YYYY-MM-DD'); // jshint ignore:line
    let timestamp = moment(new Date()).format(); // jshint ignore:line
    let slots = [{id: null, isClosed: false, note: "", quota: 3, remaining: 3, timestamp }];
    mocks.push(
      $.mockjax({url: '/api/v1/appointment_slots/calenda*', type: 'GET', status: 200, responseText:{
          appointment_calendar_dates: [{date: date, slots: slots, isClosed: false}]
      }})
    );
    requestPurposeUrl = '/request_purpose';
    clientInfoUrl = `/order/${order.id}/client_information`;
    goodsDetailsUrl = `/order/${order.id}/goods_details`;
    scheduleDetailsUrl = `/order/${order.id}/schedule_details`;
    appointmentPageUrl = `/order/${order.id}/schedule_details`;
    confirmBookingUrl = `/order/${order.id}/confirm_booking`;
    bookingSuccessUrl = `/order/${order.id}/booking_success`;
  },

  afterEach: function() {
     // Clear our ajax mocks
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);

    // Stop the app
    Ember.run(App, 'destroy');
  }
});

// home page login flow with book appointment test
test("should redirect to login page if user not logged in", function(assert) {
  window.localStorage.removeItem('authToken');
  assert.expect(2);
  visit('/');
  andThen(function() {
    click(".book-appointment");
  });
  andThen(function(){
    assert.equal(currentURL(), '/login?bookAppointment=true');
    assert.equal(Ember.$('.title').text().trim(), "Log in/Register");
  });
});

// home page account details flow with book appointment test
test("should redirect to Account details page if user is logged in and account details are incomplete", function(assert) {
  assert.expect(2);
  visit('/');
  andThen(function() {
    click(".book-appointment");
  });
  andThen(function(){
    assert.equal(currentURL(), "/account_details?bookAppointment=true");
    assert.equal(Ember.$('.title').text().trim(), "Account Details");
  });
});

//Request Purpose Page tests
test("request purpose page on completely filled should not redirect to Goods details if district is not selected", function(assert){
  orderPurpose1 = {id: 1, purpose_id: 1, order_id: order.id, designation_id: 1};
  assert.expect(2);
  visit(requestPurposeUrl);
  andThen(function(){
    click("#people-count");
  });
  andThen(function(){
    fillIn("#people-count", "2");
  });
  andThen(function(){
    fillIn("#description", "test test test");
  });
  andThen(function(){
    mocks.push(
      $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
        order: order,
        orders_purposes: [orderPurpose1],
        user: user.toJSON({includeId: true})}
      })
    );
    click('#request-submit');
    andThen(function(){
      assert.equal(currentURL(), requestPurposeUrl);
      assert.equal(Ember.$('.title').text().trim(), "Request Purpose");
    });
  });
});

test("request purpose page should not redirect if incomplete form", function(assert){
  assert.expect(2);
  visit(requestPurposeUrl);
  andThen(function(){
    click('#request-submit');
    andThen(function(){
      assert.equal(currentURL(), requestPurposeUrl);
      assert.equal(Ember.$('.title').text().trim(), "Request Purpose");
    });
  });
});

// test("request purpose page on completely filled should redirect to client information if For client benificiary is selected", function(assert){
//   orderPurpose2 = {id: 1, purpose_id: 2, order_id: order.id, designation_id: 1};
//   assert.expect(2);
//   visit(requestPurposeUrl);
//   andThen(function(){
//     click(".for-client");
//   });
//   andThen(function(){
//     click("#people-count");
//   });
//   andThen(function(){
//     fillIn("#people-count", "2");
//   });
//   andThen(function(){
//     var districtId = find('.district-selector select option:contains("Central")').val();
//     find('.district-selector select').val(districtId);
//   });
//   andThen(function(){
//     fillIn("#description", "test test test");
//   });
//   andThen(function(){
//     mocks.push(
//       $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
//         order: order,
//         orders_purposes: [orderPurpose2],
//         user: user.toJSON({includeId: true})}
//       })
//     );
//     click('#request-submit');
//     andThen(function(){
//       assert.equal(currentURL(), clientInfoUrl);
//       assert.equal(Ember.$('.title').text().trim(), "Client Information");
//     });
//   });
// });

//Client Information Page tests
test("Select HkID on client info should display form for hkid", function(assert){
  orderPurpose2 = {id: 1, purposes: [{id: 2}], order_id: order.id, designation_id: 1};
  assert.expect(2);
  mocks.push(
    $.mockjax({url: '/api/v1/order*', type: 'GET', status: 201,responseText: {
      order: order,
      orders_purposes: [orderPurpose2],
      user: user.toJSON({includeId: true})}
    })
  );
  visit('/');
  andThen(function(){
    visit(clientInfoUrl);
  });
  andThen(function(){
    assert.equal(currentURL(), clientInfoUrl);
  });
  andThen(function(){
    click('.custom_radio_buttons .for-client');
    andThen(function(){
      assert.equal(Ember.$('#id-initials').text().trim(), "P12");
    });
  });
});

test("Select RBCL on client info should display form for rbcl", function(assert){
  orderPurpose2 = {id: 1, purposes: [{id: 2}], order_id: order.id, designation_id: 1};
  assert.expect(3);
  mocks.push(
    $.mockjax({url: '/api/v1/order*', type: 'GET', status: 201,responseText: {
      order: order,
      orders_purposes: [orderPurpose2],
      user: user.toJSON({includeId: true})}
    })
  );
  visit('/');
  andThen(function(){
    visit(clientInfoUrl);
  });
  andThen(function(){
    assert.equal(currentURL(), clientInfoUrl);
  });
  andThen(function(){
    click('.custom_radio_buttons .for-client');
    andThen(function(){
      assert.equal(Ember.$('#id-initials').text().trim(), "P12");
    });
  });
  andThen(function(){
    click('.custom_radio_buttons .abcl');
    andThen(function(){
      assert.equal(Ember.$('#id-initials').text().trim(), "RBCL");
    });
  });
});

test("Online order : Filled Up client info page, should redirect to schedule details page on submit", function(assert){
  orderPurpose2 = {id: 1, purposes: [{id: 2}], order_id: order.id, designation_id: 1, booking_type_id: BookingTypes.onlineOrder.id};
  assert.expect(2);

  mocks.push(
    $.mockjax({url: '/api/v1/order*', type: 'GET', status: 201,responseText: {
        order: order,
        orders_purposes: [orderPurpose2],
        user: user.toJSON({includeId: true}),
        goodcity_requests: []
      }
    })
  );
  visit('/');
  andThen(function(){
    visit(clientInfoUrl);
  });
  andThen(function(){
    click('.custom_radio_buttons .for-client');
  });
  andThen(function(){
    fillIn("#hk-id-number", "1234");
  });
  andThen(function(){
    fillIn("#hk-id-firstName", "Test");
  });
  andThen(function(){
    fillIn("#hk-id-lastName", "John");
  });
  andThen(function(){
    fillIn("#mobile", "98876353");
  });
  andThen(function(){
    mocks.push(
      $.mockjax({url: '/api/v1/order*', type: 'PUT', status: 201,responseText: {
        order: order,
        orders_purposes: [orderPurpose2],
        user: user.toJSON({includeId: true})}
      }),
      $.mockjax({url: '/api/v1/beneficiarie*', type: 'POST', status: 201,
        responseText: {
          beneficiary: benificiary,
          identity_types: [identity_type1]
        }
      })
    );
    click('#client-info-submit');
    andThen(function(){
      let updated_gc_req = {id: goodcityRequest.id, code_id: package_type.id, order_id: order.id, package_type_id: package_type.id};
      let location = {id:12, building:'26Med', area:'B2', stockit_id:null};
      mocks.push(
        $.mockjax({url: 'api/v1/goodcity_requests/*', type:'PUT', status: 201,
          responseText:{
            code: [package_type.toJSON({includeId: true})],
            goodcity_request: updated_gc_req,
            locations: [location]
          }
        })
      );
      assert.equal(currentURL(), scheduleDetailsUrl);
      assert.equal(Ember.$('.title').text().trim(), "Transport Details");
    });
  });
});

test("Appointment : Filled Up client info page, should redirect to goods details page on submit", function(assert){
  orderPurpose2 = {id: 1, purposes: [{id: 2}], order_id: order.id, designation_id: 1 };
  assert.expect(2);

  order.booking_type_id = BookingTypes.appointment.id;

  visit('/');
  andThen(function(){
    visit(clientInfoUrl);
  });
  andThen(function(){
    click('.custom_radio_buttons .for-client');
  });
  andThen(function(){
    fillIn("#hk-id-number", "1234");
  });
  andThen(function(){
    fillIn("#hk-id-firstName", "Test");
  });
  andThen(function(){
    fillIn("#hk-id-lastName", "John");
  });
  andThen(function(){
    fillIn("#mobile", "98876353");
  });
  andThen(function(){
    mocks.push(
      $.mockjax({url: '/api/v1/order*', type: 'PUT', status: 201,responseText: {
        orders: order,
        orders_purposes: [orderPurpose2],
        user: user.toJSON({includeId: true})}
      }),
      $.mockjax({url: '/api/v1/beneficiarie*', type: 'POST', status: 201,
        responseText: {
          beneficiary: benificiary,
          identity_types: [identity_type1]
        }
      })
    );
    click('#client-info-submit');
    andThen(function(){
      let updated_gc_req = {id: goodcityRequest.id, code_id: package_type.id, order_id: order.id, package_type_id: package_type.id};
      let location = {id:12, building:'26Med', area:'B2', stockit_id:null};
      mocks.push(
        $.mockjax({url: 'api/v1/goodcity_requests/*', type:'PUT', status: 201,
          responseText:{
            code: [package_type.toJSON({includeId: true})],
            goodcity_request: updated_gc_req,
            locations: [location]
          }
        })
      );
      assert.equal(currentURL(), `${goodsDetailsUrl}?fromClientInformation=true`);
      assert.equal(Ember.$('.title').text().trim(), "Goods Details");
    });
  });
});

test("Incomplete form submit client info page, should not redirect to goods details", function(assert){
  orderPurpose2 = {id: 1, purposes: [{id: 2}], order_id: order.id, designation_id: 1};
  assert.expect(2);
  mocks.push(
    $.mockjax({url: '/api/v1/order*', type: 'GET', status: 201,responseText: {
      order: order,
      orders_purposes: [orderPurpose2],
      user: user.toJSON({includeId: true})}
    })
  );
  visit('/');
  andThen(function(){
    visit(clientInfoUrl);
  });
  andThen(function(){
    click('.custom_radio_buttons .for-client');
  });
  andThen(function(){
    mocks.push(
      $.mockjax({url: '/api/v1/order*', type: 'PUT', status: 201,responseText: {
        order: order,
        orders_purposes: [orderPurpose2],
        user: user.toJSON({includeId: true})}
      }),
      $.mockjax({url: '/api/v1/beneficiarie*', type: 'POST', status: 201,
        responseText: {
          beneficiary: benificiary,
          identity_types: [identity_type1]
        }
      })
    );
    click('#client-info-submit');
    andThen(function(){
      assert.equal(currentURL(), clientInfoUrl);
      assert.equal(Ember.$('.title').text().trim(), "Client Information");
    });
  });
});

// Goods Details Page tests
test("Goods Details Page on incomplete submit should not redirect to appointment page", function(assert){
  assert.expect(2);
  mocks.push(
    $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
          order: order,
          orders_purposes: [orderPurpose1],
          user: user.toJSON({includeId: true})}
    })
  );
  visit('/');
  andThen(function(){
    visit(goodsDetailsUrl);
  });
  andThen(function(){
    click('#goods-details-submit');
  });
  andThen(function(){
    assert.equal(currentURL(), goodsDetailsUrl);
    assert.equal(Ember.$('.title').text().trim(), "Goods Details");
  });
});

// // fill good details page and click submit, should redirect to appointment
// test("Goods Details Page on successfull submit should redirect to appointment page", function(assert){
//   assert.expect(1);
//   mocks.push(
//     $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
//           order: order,
//           orders_purposes: [orderPurpose1],
//           user: user.toJSON({includeId: true})}
//     }),
//     mockFindAll('package_type').returns({ json: {package_types: [package_type.toJSON({includeId: true})]}})
//   );
//   visit(goodsDetailsUrl);
//   andThen(function(){
//     click('.select-goods');
//   });
//   andThen(function(){
//     let updated_gc_req = {id: goodcityRequest.id, code_id: package_type.id, order_id: order.id, package_type_id: package_type.id};
//     let location = {id:12, building:'26Med', area:'B2', stockit_id:null};
//     mocks.push(
//       $.mockjax({url: 'api/v1/goodcity_requests/*', type:'PUT', status: 201,
//         responseText:{
//           code: [package_type.toJSON({includeId: true})],
//           goodcity_request: updated_gc_req,
//           locations: [location]
//         }
//       })
//     );
//     click('.package_name');
//   });
//   andThen(function(){
//     fillIn('.select-goods', package_type.get('name'));
//   });
//   andThen(function(){
//     fillIn('.add-quantity', "2")
//   });
//   andThen(function(){
//     fillIn('.add-description', "description")
//   });
//   andThen(function(){
//     let date = moment(new Date).format('YYYY-MM-DD');
//     let timestamp = moment(new Date).format();
//     let slots = [{id: null, isClosed: false, note: "", quota: 3, remaining: 3, timestamp }];
//     mocks.push(
//       $.mockjax({url: '/api/v1/appointment_slots/calenda*', type: 'GET', status: 200, responseText:{
//           appointment_calendar_dates: [{date: date, slots: slots, isClosed: false}]
//       }})
//     );
//    click('#goods-details-submit');
//   });
//   andThen(function(){
//     assert.equal(currentURL(), appointmentPageUrl);
//     assert.equal(Ember.$('.title').text().trim(), "Appointment Details");
//   });
// });

test("Appointment Details Page on incomplete sumission should not redirect to order confirm page", function(assert){
    let date = moment().format("YYYY-MM-DD"); // jshint ignore:line
    let timestamp = moment().format(); // jshint ignore:line
    let slots =  [{id: null, timestamp , quota: 3, isClosed: false, note: "", remaining: 3}];
  assert.expect(1);
  mocks.push(
  $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
        order: order,
        orders_purposes: [orderPurpose1],
        user: user.toJSON({includeId: true})}
  }),
  $.mockjax({url: '/api/v1/appointment_slots/calenda*', type: 'GET', status: 200,responseText: {
    appointment_calendar_dates: [{date: date, isClosed: false, slots: slots}]
  }}),
  mockFindAll('package_type').returns({ json: {package_types: [package_type.toJSON({includeId: true})]}})
  );
  visit('/');
  andThen(function(){
    visit(requestPurposeUrl);
  });
  andThen(function(){
    visit(appointmentPageUrl);
  });
  andThen(function(){
    click("#appointment-submit");
  });
  andThen(function(){
    assert.equal(currentURL(), appointmentPageUrl);
  });
});

test("confirm page on clicking submit should redirect to success page", function(assert){
  order.booking_type_id = BookingTypes.appointment.id;
  mocks.push(
    $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
        order: order,
        orders_purposes: [orderPurpose1],
        user: user.toJSON({includeId: true})}
    }),
    $.mockjax({url: 'api/v1/order_transport*', status: 201, type: 'POST', responseText:{
      order_transport: orderTransport
    }}),
    $.mockjax({url: '/api/v1/order*', type: 'PUT', status: 201,responseText: {
      order: order,
      orders_purposes: [orderPurpose1],
      user: user.toJSON({includeId: true})}
    })
  );
  visit('/');
  andThen(function(){
    visit(requestPurposeUrl);
  });
  andThen(function(){
    visit(confirmBookingUrl);
  });
  andThen(function(){
    click("#submit_pin");
  });
  andThen(function(){
    assert.equal(currentURL(), bookingSuccessUrl);
  });
});
