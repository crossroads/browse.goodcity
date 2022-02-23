// Sets the following parameters in config.xml and package.json
//
// app id = hk.goodcity.(<AppName>|<AppName>staging)
// app name = (<AppName>|S. <AppName>)
// app version = <main project package.json>
// app android-versionCode = <CIRCLE_BUILD_NUM> + <seed>
// app ios-CFBundleVersion = <CIRCLE_BUILD_NUM>
//
// ENVIRONMENT VARIABLES
//   process.env.ENVIRONMENT = (staging|production)
//   process.env.CIRCLE_BUILD_NUM = <numeric>

let android_build_version_seed = 80000;
let androidversionCode = "";
let iosCFBundleVersion = "";

// staging or production?
let staging = process.env.ENVIRONMENT !== "production";

let path = require("path");
let pkg = require("../package.json");
let cordovaCommon = require("cordova-common");

// Must be X.Y.Z
app_version = pkg.version;

// Specific build number for iOS and Android store uploads
circle_build_num = parseInt(process.env.CIRCLE_BUILD_NUM);
if (!isNaN(circle_build_num)) {
  androidversionCode = android_build_version_seed + circle_build_num;
  iosCFBundleVersion = circle_build_num;
}

// Update Cordova package.json
const fs = require("fs");
const filename = path.join(__dirname, "package.json");
const file = require(filename);
let app_name = file.name;
let displayName = file.displayName;
if (staging) {
  if (!app_name.endsWith("staging")) {
    app_name = app_name + "staging";
  }
  if (!displayName.startsWith("S. ")) {
    displayName = "S. " + displayName;
  }
} else {
  app_name = app_name.replace(/staging/, "");
  displayName = displayName.replace(/S\. /, "");
}
file.name = app_name;
file.version = app_version;
file.displayName = displayName;
fs.writeFileSync(filename, JSON.stringify(file, null, 2));

//config.xml
let configPath = path.join(__dirname, "config.xml");
let config = new cordovaCommon.ConfigParser(configPath);
config.setPackageName(app_name);
config.setName(displayName);
config.setVersion(app_version);
if (iosCFBundleVersion != "") {
  config.doc.getroot().set("ios-CFBundleVersion", iosCFBundleVersion);
}
if (androidversionCode != "") {
  config.doc.getroot().set("android-versionCode", androidversionCode);
}
config.write();

// output changes
console.log("Set app id: " + app_name);
console.log("Set app name: " + displayName);
console.log("Set app version: " + app_version);
console.log("Set Android version code: " + androidversionCode);
console.log("Set iOS bundle version: " + iosCFBundleVersion);
