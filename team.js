/* team.js
 *  Expands the Tournament module with a constructor for objects representing teams.
 * 
 * Attributes:
 *  id: A unique numerical identifier for each team.
 *  countryName: The name of the country, sometimes a bit FIFA-ized.
 *  requiresAdvancedTiebreak: Marked during the first run of Group.rankAll(). Indicates whether teams need
 *    to be reevaluated on only the matches played against those they're tied with.
 *  prevRank: Used during league table animations to tell how much to move the team by
 *  eliminated, clinched: Whether the team can make the knockout stage, or can't not. -1 if known to be false, 0 if still
 *    calculating, 1 if known to be true. 1 for one implies -1 for the other, but the converse is not true, so these need to be
 *    changeable independently, as well as together in the methods below.
 *  stats.played, won, drawn, lost, goalsFor, goalsAgainst (private): stats for display in the table. Private so they can be modified
 *    only by playing a match, resetting, or loading a save
 * Methods  
 *  flagLeft: returns HTML for a the team's flag to the left of its countryName.
 *  flagRight: returns HTML for a the team's flag to the right of its countryName.
 *  eliminate, clinch, resetGroupStatus: Set eliminated and clinched at once in the ways implied by the method names.
 *  knownStatus: False if we don't know whether the team has clinched or been eliminated; true if otherwise (including if we know for
      sure it hasn't done either)
 *  play: Updates a team's stats given the score of a match. Only composite stats are stored in this object, not individual
 *    scores, to avoid having to constantly re-sum total, or unnecessarily storing both.
 *  unplay: Updates a team's stats (subtracts scores, decrements w/d/l) if the user decides to undo a match or change its score
      (implemented as unplay and then play with new scores)
 *  getStat: Getter for private stats attributes
 *  reset: Sets stats to zero, but returns an array of their values from before they are zeroed so that they may be reloaded if the
      resetting is just for advanced tiebreak. 
 *  loadSave: Sets the teams' stats to the values in the array passed as an argument.
 */
var Brazil2014 = (function (Tournament) {
	Tournament.Team = function (id, countryName) {
	    this.id = id;
	    this.countryName = countryName;
	    this.flagLeft = function () {
	    	return '<div class="outerwrap"><div class="innerwrap flagwrap"><img class="flag" src="flags/'+this.id+'.png"></div><div class="innerwrap">&nbsp;'+this.countryName+'</div></div>';
	    };
	    this.flagRight = function () {
	    	return '<div class="outerwrap"><div class="innerwrap">'+this.countryName+'&nbsp;</div><div class="innerwrap flagwrap"><img class="flag" src="flags/'+this.id+'.png"></div></div>';
	    };
	    
	    this.requiresAdvancedTiebreak = -1;
	    this.prevRank = id % 4;
	    this.isEliminated = 0;
	    this.hasClinched = 0;
	    this.eliminate = function () {
	    	this.isEliminated = 1;
	    	this.hasClinched = -1;
	    };
	    this.clinch = function () {
	    	this.isEliminated = -1;
	    	this.hasClinched = 1;
	    };
	    this.resetGroupStatus = function() {
	    	this.isEliminated = 0;
	    	this.hasClinched = 0;
	    };
	    this.knownStatus = function() {
	    	return (this.isEliminated !== 0 && this.hasClinched !== 0);
	    };
	    
	    var stats = {"played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0};
	    this.getStat = function (stat) {
	    	if (stat === "points") {
	    		return 3 * stats.won + stats.drawn;
	    	}
	    	else if (stat === "goalDifference") {
	    		return stats.goalsFor - stats.goalsAgainst;
	    	}
	    	else {
	    		return stats[stat];
	    	}
	    };
	    this.play = function (gfor, against) {
	        stats.played++;
	        stats.goalsFor += gfor;
	        stats.goalsAgainst += against;
	        if (gfor > against) {
	            stats.won++;
	        } else if (gfor === against) {
	            stats.drawn++;
	        } else {
	            stats.lost++;
	        }
	    };
	    this.unplay = function (gfor, against) {
	        stats.played--;
	        stats.goalsFor -= gfor;
	        stats.goalsAgainst -= against;
	        if (gfor > against) {
	            stats.won--;
	        } else if (gfor === against) {
	            stats.drawn--;
	        } else {
	            stats.lost--;
	        }
	    };
	    this.reset = function () {
	        var savedState = stats;
	        stats = {"played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0};
	        return savedState;
	    };
	    this.loadSave = function(save) {
	        stats = save;
	        requiresAdvancedTiebreak = -1;
	    };
	};
	
	return Tournament;
}(Brazil2014));
