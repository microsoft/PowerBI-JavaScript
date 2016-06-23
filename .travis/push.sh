#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_dist_files() {
  git checkout $TRAVIS_BRANCH
  git add dist/ -f
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin-dist https://$GITHUBKEY@github.com/Microsoft/PowerBI-JavaScript.git > /dev/null 2>&1
  git push --quiet --set-upstream origin-dist $TRAVIS_BRANCH
}

tag_release() {
  export GIT_TAG=build-$TRAVIS_BRANCH-$(date -u "+%Y-%m-%d")-$TRAVIS_BUILD_NUMBER
  echo -n $GIT_TAG

  git tag $GIT_TAG -a -m "Generated tag from TravisCI build $TRAVIS_BUILD_NUMBER"
  git push --quiet origin $TRAVIS_BRANCH $GIT_TAG > /dev/null 2>&1
}

setup_git
commit_dist_files
upload_files
tag_release