# This Rakefile assists in creating Cordova app builds. It provides a consistent
# build process on dev machines, CI servers and is cross-platform.
#
# Tasks overview
#   rake app:build (default)
#   rake app:deploy (upload to Azure storage for live builds)
#   rake app:release (build and upload to Azure storage for live builds)
#
# Defaults:
#   ENV=staging PLATFORM=<based on host machine: darwin -> ios, linux -> android>
#
# Advanced usage
#   Specify ENVIRONMENT params or call special task
#     > rake android production app:build
#     > ENV=production PLATFORM=android rake app:build (equivalant to above)
#   Other tasks
#     > rake clean (removes dist, cordova/www and app files)
#     > rake clobber (also removes cordova/platforms and cordova/plugins)
#     > rake ember:install (multitask that does bower and npm in parallel)
#     > rake ember:build
#     > rake cordova:install
#     > rake cordova:prepare
#     > rake cordova:build
#
#     Cronjob entry
# * * * * * source /Users/developer/.bash_profile; rake -f /Users/developer/Workspace/app.goodcity/Rakefile app:release  >> /tmp/goodcity_app_ios_build.log 2>&1
#
# Signing Android releases
#   Gradle can sign the releases during the build process.
#   Set environment varibles: GOODCITY_KEYSTORE_PASSWORD and GOODCITY_KEYSTORE_ALIAS
#   You must also ensure the signing key exists at CORDOVA/goodcity.keystore

require "json"
require "fileutils"
require "rake/clean"

ROOT_PATH = File.dirname(__FILE__)
CORDOVA_PATH = "#{ROOT_PATH}/cordova"
CLEAN.include("dist", "cordova/www", "#{CORDOVA_PATH}/platforms/android/build",
  "#{CORDOVA_PATH}/platforms/ios/build")
CLOBBER.include("cordova/platforms", "cordova/plugins")
PLATFORMS = %w(android ios windows).freeze
ENVIRONMENTS = %w(staging production).freeze
TESTFAIRY_PLUGIN_URL = "https://github.com/testfairy/testfairy-cordova-plugin"
TESTFAIRY_PLUGIN_NAME = "com.testfairy.cordova-plugin"
KEYSTORE_FILE = "#{CORDOVA_PATH}/goodcity.keystore"
BUILD_JSON_FILE = "#{CORDOVA_PATH}/build.json"

# Default task
task default: %w(app:build)

# Main namespace
namespace :app do
  desc "Builds the app"
  task build: %w(ember:install ember:build cordova:install cordova:prepare cordova:build)
  desc "Uploads the app to Azure storage"
  task deploy: %w(azure:upload)
  desc "Equivalent to rake app:build app:deploy"
  task release: %w(app:build azure:upload)
end

ENVIRONMENTS.each do |env|
  task env do
    ENV["ENV"] = env
  end
end

PLATFORMS.each do |platform|
  task platform do
    ENV["PLATFORM"] = platform
  end
end

namespace :ember do
  multitask install_parallel: %w(bower_install yarn_install)
  desc "Ember install dependencies"
  task :install do
    Dir.chdir(ROOT_PATH) do
      Rake::MultiTask["ember:install_parallel"].invoke
    end
  end
  task :bower_install do
    sh %{ bower install }
  end
  task :yarn_install do
    sh %{ yarn install }
  end
  desc "Ember build with Cordova enabled"
  task :build do
    # Before starting Ember build clean up folders
    Rake::Task["clobber"].invoke
    Dir.chdir(ROOT_PATH) do
      system({
        "EMBER_CLI_CORDOVA" => "1",
        "APP_SHA" => app_sha,
        "staging" => is_staging.to_s,
        "VERSION" => app_version
        }, "ember build --environment=production")
    end
  end
end

namespace :cordova do
  desc "Install cordova package globally"
  task :install do
    sh %{ npm list --depth 1 --global cordova; if [ $? -ne 0 ]; then npm install -g cordova; fi }
    sh %{ npm list --depth 1 --global cordova-update-config; if [ $? -ne 0 ]; then npm install -g cordova-update-config; fi }
  end
  desc "Cordova prepare {platform}"
  task :prepare do
    # Before cordova prepare build ember app that will auto update the dist folder too
    Rake::Task["ember:build"].invoke
    create_build_json_file
    sh %{ ln -s "#{ROOT_PATH}/dist" "#{CORDOVA_PATH}/www" } unless File.exists?("#{CORDOVA_PATH}/www")
    build_details.map{|key, value| log("#{key.upcase}: #{value}")}
    sh %{ cd #{CORDOVA_PATH}; cordova-update-config --appname "#{app_name}" --appid #{app_id} --appversion #{app_version} }

    log("Preparing app for #{platform}")
    Dir.chdir(CORDOVA_PATH) do
      system({"ENVIRONMENT" => environment}, "cordova prepare #{platform}")
    end

    if platform == "ios"
      Dir.chdir(CORDOVA_PATH) do
        sh %{ cordova plugin add #{TESTFAIRY_PLUGIN_URL} } if environment == "staging"
        sh %{ cordova plugin remove #{TESTFAIRY_PLUGIN_NAME}; true } if environment == "production"
      end
    end
  end

  desc "Cordova build {platform}"
  task build: :prepare do
    Dir.chdir(CORDOVA_PATH) do
      team_id = ENV['IOS_DEVELOPMENT_TEAM_ID']
      provisioning_profile = ENV['PROVISIONING_PROFILE_STAGING']
      provisioning_profile = ENV['PROVISIONING_PROFILE_PROD'] if(environment === "production")
      build = (environment == "staging" && platform == 'android') ? "debug" : "release"
      system({"ENVIRONMENT" => environment}, "cordova compile #{platform} --#{build} --device --codeSignIdentity='iPhone Developer' --developmentTeam=#{team_id} --provisioningProfile=#{provisioning_profile}")
    end
    # Copy build artifacts
    if ENV["CI"]
      sh %{ if [ -e "#{app_file}" ]; then cp "#{app_file}" "${CIRCLE_ARTIFACTS:-$BUILD_STAGINGDIRECTORY}/"; fi }
    end
  end
end

namespace :azure do
  task :upload do
    if environment != "production"
      log("Environment: #{environment}. Skipping Azure upload")
      next
    end
    raise(BuildError, "#{app_file} does not exist!") unless File.exists?(app_file)
    raise(BuildError, "AZURE_HOST not set.") unless env?("AZURE_HOST")
    raise(BuildError, "AZURE_SHARE not set.") unless env?("AZURE_SHARE")
    raise(BuildError, "AZURE_SAS_TOKEN not set.") unless env?("AZURE_SAS_TOKEN")
    if ENV["CI"]
      sh %{ source ~/.circlerc; PATH=$(npm bin):$PATH; azure-filestore upload -d #{platform} -f "#{app_file}" -t #{azure_file} }
    end
    log("Uploaded app to azure...")
    build_details.map{|key, value| log("#{key.upcase}: #{value}")}
  end
end

def app_sha
  Dir.chdir(ROOT_PATH) do
    `git rev-parse --short HEAD`.chomp
  end
end

def environment
  environment = ENV["ENV"]
  raise(BuildError, "Unsupported environment: #{environment}") if (environment || "").length > 0 and !ENVIRONMENTS.include?(environment)
  ENV["ENV"] || "staging"
end

def platform
  env_platform = ENV["PLATFORM"]
  raise(BuildError, "Unsupported platform: #{env_platform}") if (env_platform || "").length > 0 and !PLATFORMS.include?(env_platform)
  env_platform || begin
    case Gem::Platform.local.os
    when /mswin|windows|mingw32/i
      "windows"
    when /linux|arch/i
      "android"
    when /darwin/i
      "ios"
    else
      raise(BuildError, "Unsupported build os: #{env_platform}")
    end
  end
end

def env?(env)
  (ENV[env] || "") != ""
end

def app_file
  case platform
  when /ios/
    "#{CORDOVA_PATH}/platforms/ios/build/device/#{app_name}.ipa"
  when /android/
    build = is_staging ? "debug" : "release"
    "#{CORDOVA_PATH}/platforms/android/build/outputs/apk/android-#{build}.apk"
  when /windows/
    raise(BuildError, "Need to get Windows app path")
  end
end

def azure_file
  case platform
  when /ios/
    extn = "ipa"
  when /android/
    extn = "apk"
  end
  "#{app_id}-#{app_version}.#{extn}"
end

def app_name
  is_staging ? "S. Browse" : "Browse"
end

def app_id
  is_staging ? "hk.goodcity.browsestaging" : "hk.goodcity.browse"
end

def app_version
  if ENV["CI"]
    is_staging ? "#{ENV['APP_VERSION']}.#{ENV['CIRCLE_BUILD_NUM']||ENV['BUILD_BUILDNUMBER']}" : ENV['APP_VERSION']
  elsif @ver
    @ver
  else
    print "Enter Browse app version: "
    @ver = STDIN.gets.strip
  end
end

def is_staging
  environment == "staging"
end

def build_details
  {app_name: app_name, env: environment, platform: platform, app_version: app_version}
end

def log(msg="")
  puts(Time.now.to_s << " " << msg)
end

# Cordova uses build.json to create gradle release-signing.properties file
# Expects CORDOVA_PATH/goodcity.keystore to exist
# Requires ENV vars: GOODCITY_KEYSTORE_PASSWORD and GOODCITY_KEYSTORE_ALIAS
def create_build_json_file
  FileUtils.rm(BUILD_JSON_FILE) if File.exists?(BUILD_JSON_FILE)
  return unless (environment == "production" and platform == "android")
  raise(BuildError, "Keystore file not found: #{KEYSTORE_FILE}") unless File.exists?("#{KEYSTORE_FILE}")
  %w(GOODCITY_KEYSTORE_PASSWORD GOODCITY_KEYSTORE_ALIAS).each do |key|
    raise(BuildError, "#{key} environment variable not set.") unless env?(key)
  end
  build_json_hash = {
    android: {
      release: {
        keystore: "#{KEYSTORE_FILE}",
        storePassword: ENV["GOODCITY_KEYSTORE_PASSWORD"],
        alias: ENV["GOODCITY_KEYSTORE_ALIAS"],
        password: ENV["GOODCITY_KEYSTORE_PASSWORD"]
      }
    }
  }
  File.open(BUILD_JSON_FILE, "w"){|f| f.puts JSON.pretty_generate(build_json_hash)}
end

class BuildError < StandardError; end
