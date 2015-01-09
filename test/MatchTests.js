/**
 * Created by akuchta on 12/11/14.
 */
var Match = require(__dirname + '/../lib/match.js'),
    should = require('should'),
    sinon = require('sinon');

describe(__filename, function() {
  describe('getMatchCode()', function() {
    it('should return the value passed via \'config\' parameter', function() {
      var matchCode,
        match;
      matchCode = '1122GXYF'
      match = Match({matchCode: matchCode, boardConfig: {rows:5, cols:5}});
      match.getMatchCode().should.equal(matchCode);
    });

    it('should return a string even if a number is passed', function() {
        var matchCode,
          match;
        matchCode = 12345;
        match = Match({matchCode: matchCode, boardConfig: {rows:5, cols:5}});
        (match.getMatchCode()).should.equal('' + matchCode);
    });
  });

  describe('Happy Path Game Flow', function () {
    it('should make all the right state transitions and emit the right events', function() {
      var match,
          playerBobColor = null,
          playerJimColor = null,
          eventSpy;
      match = Match(
        {
          matchCode: '1122GXYF',
          maxPlayers: 2,
          boardConfig: {
            rows: 5,
            cols: 5
          }
        }
      );

      // Assert that the intial state is correct
      match.getState().should.equal(Match.MatchStates.wait_players);

      // Add the first player, checking for events
      eventSpy = sinon.spy();
      match.once(Match.MatchEvents.add_player, eventSpy);
      playerBobColor = match.addPlayer('bob');
      playerBobColor.should.be.String;
      
      // Assert add_player was emitted
      eventSpy.should.have.property('called', true);

      eventSpy = sinon.spy();
      match.once(Match.MatchEvents.add_player, eventSpy);
      playerJimColor = match.addPlayer('jim');
      playerJimColor.should.be.String;

      // Assert add_player was emitted
      eventSpy.should.have.property('called', true);

    });
  });
});
