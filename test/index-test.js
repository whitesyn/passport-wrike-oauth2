var vows    = require('vows'),
    assert  = require('assert'),
    wrike   = require('passport-wrike-oauth2');


vows.describe('passport-wrike-oauth2').addBatch({

    'module': {
        'should report a version': function () {
            assert.isString(wrike.version);
        },
        'should export OAuth 2.0 strategy': function () {
            assert.isFunction(wrike.OAuth2Strategy);
        }
    }

}).export(module);