import { helper as buildHelper } from "@ember/component/helper";

// Date Format used in App:
// "12 Feb '16" => "DD MMM 'YY"

export default buildHelper(function(value, params) {
  const parseDate = Date.parse(value);
  const { format = "DD MM YY" } = params;

  if (parseDate) {
    if (format === "preset:timeago") {
      return moment(parseDate).fromNow();
    }
    return moment(parseDate).format(params.format);
  } else {
    return "";
  }
});
