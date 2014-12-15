/**
 * Created by akuchta on 12/11/14.
 */
var Match = require(__dirname + '/../lib/Match.js'),
    should = require('should');
describe(__filename, function() {
  describe('getMatchCode()', function() {
    it('should return the value passed via \'config\' parameter', function() {
      var matchCode,
        match;
      matchCode = '1122GXYF'
      match = Match({matchCode: matchCode});
      match.getMatch().should.be.equal(matchCode);
    });

    it('should return a string even if a number is passed', function() {
        var matchCode,
          match;
        matchCode = 12345;
        match = Match({matchCode: matchCode});
        match.getMatch().should.be.String;
        match.getMatch().should.be.equal('' + matchCode);
    });
  });
});
