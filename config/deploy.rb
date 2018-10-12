lock '3.4.0'

set :application, 'browse.goodcity'
set :deploy_to, '/var/www/html/browse.goodcity.hk'
set :shared_repo, 'https://github.com/crossroads/shared.goodcity.git'
set :log_level, :info

namespace :deploy do
  desc "Locally build the ember site"
  task :build do
    run_locally do
      env = {"EMBER_CLI_CORDOVA" => "0"}
      env["staging"] = "true" if fetch(:stage) == :staging
      system(env, "ember build --environment=production")
    end
  end
  desc "Upload the ember build"
  task :upload do
    tarball = "#{fetch(:application)}.tar.gz"
    run_locally do
      within "dist" do
        execute :rm, "-f", tarball
        execute :tar, "-zcf", tarball, "*"
      end
    end
    on roles(:web) do
      remote_tarball_path = File.join(deploy_to, tarball)
      upload! File.join("dist", tarball), deploy_to
      within deploy_to do
        execute :tar, "-zxvf", remote_tarball_path
        execute :rm, "-f", remote_tarball_path
      end
    end
    run_locally do
      within "dist" do
        execute :rm, "-f", tarball
      end
    end
  end
end

task deploy: %w(deploy:build deploy:upload)
