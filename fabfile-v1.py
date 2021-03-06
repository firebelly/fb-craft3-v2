from fabric.api import *
import os

env.hosts = ['stage.firebelly.co']
env.user = 'firebelly'
env.remotepath = '/home/firebelly/apps/fb-craft-staging'
env.git_branch = 'staging'
env.warn_only = True
env.forward_agent = True

def production():
  env.hosts = ['firebellydesign.com']
  env.git_branch = 'main'
  env.remotepath = '/home/firebelly/apps/fb-craft'

# def syncstaging():
#   with cd(env.remotepath):
#     run('/usr/bin/mysqldump --defaults-extra-file=/home/firebelly/etc/.my.cnf -u fb_craft_sql fb_craft3 | /usr/bin/mysql --defaults-extra-file=/home/firebelly/etc/.my.cnf -u fb_craft_sql fb_craft3_dev')
#     run('/usr/bin/rsync -av --delete /home/firebelly/webapps/fb_craft3/web/uploads/ /home/firebelly/webapps/fb_craft3_dev/web/uploads/')

def deploy(composer='y', assets='y'):
  update()
  if composer == 'y':
    composer_install()
  # build and sync production assets
  if assets != 'n':
    local('rm -rf web/assets/dist')
    local('yarn build:production')
    run('mkdir -p ' + env.remotepath + '/web/assets/dist')
    put('web/assets/dist', env.remotepath + '/web/assets/')

def update():
  with cd(env.remotepath):
    run('git pull origin {0}'.format(env.git_branch))

def composer_install():
  with cd(env.remotepath):
    run('php74 ~/bin/composer.phar install')
