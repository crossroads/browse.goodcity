import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  model() {
    return {
      data: [
        {
          id: "3",
          type: "offer",
          attributes: {
            id: 3,
            state: "receiving",
            notes: null,
            created_at: "2020-10-09T10:30:53.771+08:00",
            public_uid: "0f96bb6b-2f4c-36ff-6fc5-1bf289f92de2"
          },
          relationships: {}
        }
      ],
      included: [
        {
          id: "11",
          type: "item",
          attributes: {
            id: 11,
            donor_description: "Baby bath / toilet + Baby bath / toilet",
            state: "accepted",
            offer_id: 3,
            created_at: "2020-10-09T10:30:57.482+08:00",
            package_type_id: 310,
            public_uid: "d7f2d85b-ebfc-44b3-eec1-1228ce670330"
          },
          relationships: {}
        },
        {
          id: "123",
          type: "image",
          attributes: {
            id: 123,
            favourite: true,
            cloudinary_id: "1602210661/sxn3busci5tguu0lkmqh.png",
            angle: 0,
            imageable_type: "Item",
            imageable_id: 11,
            public_uid: null
          }
        }
      ],
      meta: {
        page: 1,
        per_page: 25
      }
    };
  }
});
