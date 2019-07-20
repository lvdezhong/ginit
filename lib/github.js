const Octokit = require('@octokit/rest');
const Configstore = require('configstore');
const pkg = require('../package.json');
const _ = require('lodash');
const CLI = require('clui');

const inquirer = require('./inquirer');

const Spinner = CLI.Spinner;
const conf = new Configstore(pkg.name);

module.exports = {
  getInstance: () => {
    return global.octokit;
  },

  githubAuth: (token) => {
    global.octokit = new Octokit({
      auth: token
    });
  },

  getStoredGithubToken: () => {
    return conf.get('github.token');
  },

  setGithubCredentials: async () => {
    const credentials = await inquirer.askGithubCredentials();
    const result = _.extend(
      {
        type: 'basic'
      },
      credentials
    );

    global.octokit = new Octokit({
      auth: result
    });
  },

  registerNewToken: async () => {
    const status = new Spinner('Authenticating you, please wait...');
    status.start();

    try {
      const response = await global.octokit.oauthAuthorizations.createAuthorization({
        scopes: ['user', 'public_repo', 'repo', 'repo:status'],
        note: 'ginits, the command-line tool for initalizing Git repos'
      });
      const token = response.data.token;
      if (token) {
        conf.set('github.token', token);
        return token;
      } else {
        throw new Error(
          'Missing Token',
          'GitHub token was not found in the response'
        );
      }
    } catch (err) {
      throw err;
    } finally {
      status.stop();
    }
  },
}
