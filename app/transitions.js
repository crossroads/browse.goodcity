export default function() {
  this.transition(
    this.fromRoute("browse"),
    this.toRoute("package_category"),
    this.use("toUp", { duration: 800 }),
    this.reverse("toDown", { duration: 800 })
  );

  this.transition(
    this.fromRoute("package_category"),
    this.toRoute("package_set"),
    this.use("fade", { duration: 500 }),
    this.reverse("fade", { duration: 500 })
  );

  this.transition(
    this.fromRoute("browse"),
    this.toRoute("package_set"),
    this.use("toUp", { duration: 800 }),
    this.reverse("toDown", { duration: 800 })
  );

  this.transition(
    this.childOf(".view-item.moveLeft"),
    this.use(
      "explode",
      {
        pickOld: ".complete_item_view",
        use: ["toLeft", { duration: 200 }]
      },
      {
        use: ["fade", { duration: 200 }]
      }
    ),
    this.includingInitialRender()
  );

  this.transition(
    this.childOf(".view-item.moveRight"),
    this.use(
      "explode",
      {
        pickOld: ".complete_item_view",
        use: ["toRight", { duration: 200 }]
      },
      {
        use: ["fade", { duration: 200 }]
      }
    ),
    this.includingInitialRender()
  );
}
