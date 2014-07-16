/* Team
 * Attributes:
 *  id: A unique numerical identifier for each team.
 *  countryName: the name of the country, sometimes a bit FIFA-ized.
 *  requiresAdvancedTiebreak: marked during the first run of Group.rankAll(). Indicates whether teams need
 *    to be reevaluated on only the matches played against those they're tied with.
 *  prevRank: used during league table animations to tell how much to move the team by
 *  eliminated, clinched: whether the team can make the knockout stage, or can't not. -1 if known to be false, 0 if still
      calculating, 1 if known to be true. 1 for one implies -1 for the other, but the converse is not true.
 *  eliminate(), clinch(), resetGroupStatus(): methods to set eliminated and clinched at the same time.
 *  play(): Updates a team's stats given the score of a match. Only composite stats are stored in this object, not individual
 *    scores, to avoid having to constantly re-sum total, or unnecessarily storing both.
 *  unplay(): Updates a team's stats (subtracts scores, decrements w/d/l) if the user decides to undo a match or change its score
      (implemented as unplay and then play with new scores)
 *  stats.played, won, drawn, lost, goalsFor, goalsAgainst: stats for display in the table. Private, so that they can be modified
 *    only by playing a match, resetting, or loading a save
 *  getStat(stat): Getter for above stats.
 *  reset(): sets stats to zero, but returns them from before they are zeroed so that they may be reloaded if the resetting is
      just for advanced tiebreak. 
 *  loadSave(): Sets the teams' stats to the values in the array passed as an argument.
 */
var Brazil2014 = (function (Tournament) {
	Tournament.Team = function (id, countryName) {
	    this.id = id;
	    this.countryName = countryName;
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
	    this.reset = function () {
	        var savedState = stats;
	        stats = {"played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0};
	        return savedState;
	    };
	    this.loadSave = function(save) {
	        stats = save;
	        requiresAdvancedTiebreak = -1;
	    };
	    this.flagLeft = function () {
	    	return '<div class="outerwrap"><div class="innerwrap"><img class="flag" src="flags/'+id+'.png"></div><div class="innerwrap">'+countryName+'</div></div>';
	    };
	    this.flagRight = function () {
	    	return '<div class="outerwrap"><div class="innerwrap">'+countryName+'</div><div class="innerwrap"><img class="flag" src="flags/'+id+'.png"></div></div>';
	    };
	};
	
	return Tournament;
}(Brazil2014));
