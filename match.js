/* match.js
 *  Expands the Tournament module with a constructor for objects representing group-stage matches.
 * 
 * Attributes:
 *  id: The number of the match as defined by FIFA, following the sequence 1 = A1 vs A2, 2 = B1 vs B2, 3 = C1 vs C2, 4 = C3 vs C4,
 *    etc. Not necessarily the chronological order of the matches.
 *  team1, team2: The teams competing.
 *  location, time (private): Where and when the match is taking place.
 *  score1, score2 (private): Their scores.
 * Methods:
 *  draw: Writes the HTML for the element representing the match in the DOM.
 *  updateTime: Puts the time shown for this match in the user's time zone.
 *  getScore: Getter for score1 and score2, which are kept private in order to avoid accidentally setting them without the requisite
      updates to the teams.
 *  play: Called when the user changes one of the scores in the UI. Passes the scores to team.play, and the old scores to team.unplay,
 *    as appropriate. Returns a boolean telling the calling group whether it needs to update its table.
 *  played: returns whether the match has been played (ie, whether both scores are valid -- this.play calls team.unplay when they are
      not)
 *  unplay: Used to return the group to its actual state after running team clinching/elimination scenarios.
 */

var Brazil2014 = (function (Tournament) {
	Tournament.Match = function (id, team1, team2, location, time) {
		this.id = id;
		this.team1 = team1;
		this.team2 = team2;
		location = location;
		time = new Date(Date.UTC(2014,time[0],time[1],time[2],time[3]));
		var score1 = '';
		var score2 = '';
		
		this.draw = function () {
			return '<div id="match'+id+'" class="matchRow">'+
						'<div class="details">'+
			        		'<div class="location">'+location+'</div>'+
			        		'<div class="time"></div>'+
			        	'</div>'+
			        	'<div class="team1">'+team1.flagRight()+'</div>'+
			        	'<div class="result"><input class="score1" maxlength="1"> - <input class="score2" maxlength="1"></div>'+
			        	'<div class="team2">'+team2.flagLeft()+'</div>'+
			    	'</div>';
		};
		
		this.updateTime = function (offset) {
			var localTime = new Date(time.getTime());
			localTime.setMinutes(localTime.getMinutes()+offset);
			var timeString = localTime.toUTCString().split(':',2).join(':').replace('2014','');
			$('#match'+id+' .time').text(timeString);
		};
		
		this.getScore = function (which) {
			switch (which) {
				case 1:
					return score1;
				case 2:
					return score2;
				default:
					throw new Error("getScore called with an argument other than 1 or 2");
			}
		};
		
		/* IsNonNegativeInteger
		 * Does what it says on the tin. Used to verify that both score inputs are valid before playing a match.
		 */
		function isNonNegativeInteger(n) {
			return parseInt(n) === Number(n) && n >= 0;
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
		
		this.played = function () {
		    return (isNonNegativeInteger(score1) && isNonNegativeInteger(score2)); 
		};
		
		this.unplay = function () {
			team1.unplay(score1, score2);
		    team2.unplay(score2, score1);
			score1 = '-';
			score2 = '-';
		    //no updateTable; this is only used after simulations (used in tiebreaking),
		    //which never updated the table in the first place.
		};
		
	};
	
	return Tournament;
}(Brazil2014));
