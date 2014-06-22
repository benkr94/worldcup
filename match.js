/* Match
 * Attributes:
 *  id: the number of the match as defined by FIFA, following the sequence 1 = A1 vs A2, 2 = B1 vs B2,
 *      3 = C1 vs C2, 4 = C3 vs C4, etc. Not necessarily the chronological order of the matches.
 *  team1, team2: the teams competing.
 *  score1, score2: their scores.
 *  play: Called when the user changes one of the scores in the UI. Passes the scores to team.play, and
 *        the old scores to team.unplay, as appropriate (see respective methods).
 *  unplay: Used to return the group to its actual state after running team clinching/elimination scenarios.
 */

var Brazil2014 = (function (Tournament) {
	Tournament.Match = function (id, team1, team2) {
		this.id = id;
		this.team1 = team1;
		this.team2 = team2;
		var score1 = '';
		var score2 = '';
		this.getScore = function (which) {
			switch (which) {
				case 1:
					return score1;
				case 2:
					return score2;
				default:
					console.log("Invalid score selection.");
					return false;
			}
		}
		/* IsNonNegativeInteger
		 * Does what it says on the tin. Used to verify that both score inputs are valid before playing a match.
		 */
		function isNonNegativeInteger(n) {
			return parseInt(n) === Number(n) && n >= 0;
		};
		this.played = function () {
		    return (isNonNegativeInteger(score1) && isNonNegativeInteger(score2)); 
		};
		this.play = function (goals1, goals2) {
		    var updateTable = false;
		    if (this.played()) {
		        team1.unplay(score1, score2);
		        team2.unplay(score2, score1);
		        updateTable = true;
		    }
		    if (isNonNegativeInteger(goals1) && isNonNegativeInteger(goals2)) {
		        team1.play(parseInt(goals1), parseInt(goals2));
		        team2.play(parseInt(goals2), parseInt(goals1));
		        updateTable = true;
		    }
		    score1 = isNonNegativeInteger(goals1) ? goals1 : '-';
		    score2 = isNonNegativeInteger(goals2) ? goals2 : '-';
		    return updateTable;
		};
		this.unplay = function () {
			team1.unplay(score1, score2);
		    team2.unplay(score2, score1);
			score1 = '-';
			score2 = '-';
		    //no updateTable since this is only used after simulations, which never updated the table in the first place
		};
	};
	
	return Tournament;
}(Brazil2014));
