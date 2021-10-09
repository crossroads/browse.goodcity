require 'json'
require 'colorize'
require 'fastlane'
require 'active_support/core_ext/numeric/time.rb'

module ReleaseUtils
  module_function

  def root_folder
    File.expand_path(
      File.join([File.dirname(__FILE__), '..'])
    )
  end

  def fastlane_folder
    File.join [root_folder, 'fastlane']
  end

  def package_json
    @@data_hash ||= begin
      file = File.read File.join(root_folder, './package.json')
      JSON.parse(file)
    end
  end

  def app_version
    package_json['version']
  end

  def copyright
    "#{Time.now.year} Crossroads Foundation Limited"
  end

  def get_env_var(key)
    assert_env_vars_exist!([key])
    ENV[key]
  end

  def ci_build_number
    ENV['BUILD_BUILDNUMBER'] || ENV['CIRCLE_BUILD_NUM']
  end

  def assert_env_vars_exist!(required_vars)
    missing_vars = required_vars.select { |key| !ENV[key] }

    if missing_vars.length > 0
      Shell.error("Missing Environment variables:")
      missing_vars.each { |key|  Shell.info("- #{key}") }
      exit(1)
    end
  end

  module Shell
    module_function

    def log(str)
      puts "[#{Time.now.strftime("%H:%M:%S")}] >> #{str}"
    end

    def info(str)
      log(str.colorize('light_blue'))
    end

    def error(str)
      log("Error: #{str}".colorize('red'))
    end

    def sh(cmd)
      Dir.chdir(ReleaseUtils.root_folder) { system(ENV, cmd) }
    end

    def read(prompt)
      Fastlane::Actions::PromptAction.run(text: prompt)
    end

    def xsh(cmd)
      unless sh(cmd)
        error('Shell command failed, exiting')
        exit(1)
      end
    end
  end

  module Azure
    module_function

    def logged_in?
      @@logged_in ||= Shell.sh %{ az account show }
    end

    def assert_logged_in!
      unless logged_in?
        Shell.error('You are not logged in to Azure')
        exit(1)
      end
    end

    def download_file(filepath, dest: ReleaseUtils.fastlane_folder)
      Shell.info %{ Downloading file #{filepath} from ci-store }
      Shell.xsh %{ az storage file download --dest #{dest} -s ci-store -p #{filepath} --account-name goodcitystorage }
    end

    def download_folder(folder, dest:)
      Shell.info %{ Downloading folder #{folder} from ci-store }
      Shell.xsh %{ az storage file download-batch -d #{dest} -s ci-store/#{folder} --account-name goodcitystorage }
    end

    def upload(storage:, local_folder:, remote_folder: '$web')
      Shell.xsh %{ az storage blob upload-batch -s '#{local_folder}' -d '#{remote_folder}' --account-name #{storage} }
    end

    def clean_folder(storage:, folder:, container: '$web')
      cutoff_date = (Time.now - 1.hour).utc.strftime("%Y-%m-%dT%H:%MZ")
      Shell.xsh %{ az storage blob delete-batch -s '#{container}'  --account-name #{storage} --pattern '#{folder}/*' --if-unmodified-since '#{cutoff_date}' }
    end
  end

  module Web
    module_function

    def upload(app:, stage:, storage: ReleaseUtils.get_env_var('AZURE_GOODCITY_STORAGE_NAME'))
      dist_folder = File.join(ReleaseUtils.root_folder, 'dist')
      Shell.info %{ Pushing web build to the #{stage} folder }
      Azure.upload(storage: storage, local_folder: dist_folder, remote_folder: "$web/#{app}-#{stage}-goodcity")
      Azure.clean_folder(storage: storage, container: '$web', folder: "#{app}-#{stage}-goodcity")
    end
  end
end
