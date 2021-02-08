from fabric import task
from invoke import run as local
from patchwork.transfers import rsync

remote_path = "/home/firebelly/apps/fb-craft-staging"
remote_hosts = ["firebelly@stage.firebelly.co"]
git_branch = "staging"
php_command = "php74"

# set to production
@task
def production(c):
  global remote_hosts, remote_path, git_branch
  remote_hosts = ["firebelly@firebellydesign.com"]
  git_branch = "main"
  remote_path = "/home/firebelly/apps/fb-craft"

# deploy
@task(hosts=remote_hosts)
def deploy(c, assets="y"):
  update(c)
  composer_install(c)
  # `fab deploy --assets=n` to skip assets
  if assets == "y":
    build_assets(c)
  clear_cache(c)

def update(c):
  c.run("cd {} && git pull origin {}".format(remote_path, git_branch))

def composer_install(c):
  c.run("cd {} && {} ~/bin/composer.phar install".format(remote_path, php_command))

def build_assets(c):
  local("rm -rf web/assets/dist")
  local("yarn build:production")
  c.run("mkdir -p {}/web/assets/dist".format(remote_path))
  rsync(c, "web/assets/dist", "{}/web/assets/".format(remote_path))

def clear_cache(c):
  c.run("cd {} && ./craft clear-caches/compiled-templates".format(remote_path))
  c.run("cd {} && ./craft clear-caches/data".format(remote_path))
