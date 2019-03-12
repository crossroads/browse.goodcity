export default function() {
  QUnit.test(arguments[0] + " (SKIPPED)", function() {
    QUnit.expect(0); //dont expect any tests
    var li = document.getElementById(
      "qunit-test-output-" + QUnit.config.current.testId
    );
    QUnit.done(function() {
      li.style.background = "#FFFF99";
    });
  });
}
