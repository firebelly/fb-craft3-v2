from fabric.api import *
import os

env.hosts = ['firebelly.webfactional.com']
env.user = 'firebelly'
env.remotepath = '/home/firebelly/webapps/fb_craft3_dev'
env.git_branch = 'master'
env.warn_only = True

def production():
  env.hosts = ['firebellydesign.com']
  env.remotepath = '/home/firebelly/webapps/fb_craft3'

# def syncstaging():
#   with cd(env.remotepath):
#     run('/usr/bin/mysqldump --defaults-extra-file=/home/firebelly/etc/.my.cnf -u fb_craft_sql fb_craft3 | /usr/bin/mysql --defaults-extra-file=/home/firebelly/etc/.my.cnf -u fb_craft_sql fb_craft3_dev')
#     run('/usr/bin/rsync -av --delete /home/firebelly/webapps/fb_craft3/web/uploads/ /home/firebelly/webapps/fb_craft3_dev/web/uploads/')

def devsetup():
  print "Composing and yarning...\n"
  local('composer install')
  local('yarn')
  local('test -f .env || cp .env.example .env')
  print "OK DONE! Hello? Are you still awake?\nEdit your .env file with local credentials\nRun `yarn start` to compile & watch assets"

def deploy(composer='y', assets='y'):
  update()
  if composer == 'y':
    composer_install()
  # build and sync production assets
  if assets != 'n':
    local('yarn build:production')
    run('mkdir -p ' + env.remotepath + '/web/assets/dist')
    put('web/assets/dist', env.remotepath + '/web/assets/')

def update():
  with cd(env.remotepath):
    run('git pull origin {0}'.format(env.git_branch))

def composer_install():
  with cd(env.remotepath):
    run('~/bin/composer install')
