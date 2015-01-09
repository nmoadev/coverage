/**
 * Created by akuchta on 12/8/14.
 */
var _ = require('lodash'),
    Match = require('./match'),
    MatchManager;

module.exports  = MatchManager = function MatchManager(config) {
  var matchManager = {},
      matches = {};

  matchManager.getMatch = function getMatch(code) {
    var existingMatch = matches[code];
    if (!existingMatch) {
      existingMatch = matches[code] = Match(_.extend({matchCode: code}, config.matchConfig));
    }
    return existingMatch;
  };

  return matchManager;
};
