import { helper as buildHelper } from "@ember/component/helper";

// Date Format used in App:
// "12 Feb '16" => "DD MMM 'YY"

export default buildHelper(function(value, params) {
  var parseDate = Date.parse(value);

  if (parseDate) {
    return moment(parseDate).format(params.format);
  } else {
    return "";
  }
});
