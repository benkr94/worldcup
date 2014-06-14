/* IsNonNegativeInteger
 * Does what it says on the tin. Used to verify that both score inputs are valid before playing a match.
 */
function isNonNegativeNumber(n) {
    return parseInt(n) === Number(n) && n >= 0;
}

/* teamCompare
 * The comparison function used to order groups' team arrays by how the teams have performed,
 * using the appropriate tiebreak rules. It looks backwards (ie, better performance = "less than") 
 * so that I can just use it in Array.sort() without reversing it and get them from first to last.
 */ 

function teamCompare(a, b) {
    if (a.getStat("points") > b.getStat("points")) {
        return -1;
    }
    else if (b.getStat("points") > a.getStat("points")) {
        return 1;
    }
    else if (a.getStat("goalDifference") > b.getStat("goalDifference")) {
        return -1;
    }
    else if (b.getStat("goalDifference") > a.getStat("goalDifference")) {
        return 1;   
    }
    else if (a.getStat("goalsFor") > b.getStat("goalsFor")) {
        return -1;
    }
    else if (b.getStat("goalsFor") > a.getStat("goalsFor")) {
        return 1;
    }
    else if (a.getStat("played") > 0) {
        a.requiresAdvancedTiebreak = a.getStat("points");
        b.requiresAdvancedTiebreak = b.getStat("points");
    }
    return 0;
}

/* advancedTiebreak
 * If teams have identical points, goal difference, and goals scored, the rules dictate that you compare them
 * again using only the matches between the teams in question. Yet to be implemented is the case where they are
 * still tied after this, and the rules call for a drawing of lots by FIFA (!).
 */
function advancedTiebreak(teams, matches) {
    for (var m = 0; m < matches.length; m++) {
        var matched1 = -1;
        var matched2 = -1;
        for (var t = 0; t < teams.length; t++) {
            if (matches[m].team1.id === t.id) {
                matched1 = t;
            }
            if (matches[m].team2.id === t.id) {
                matched2 = t;
            }
        }
        if (matched1 !== -1 && matched2 !== -1) {
            teams[matched1].play(matches[m].score1, Matches[m].score2);
            teams[matched2].play(matches[m].score2, Matches[m].score1);
        }
    }
    return teams.sort(teamCompare);
}

/* Match
 * Attributes:
 *  id: the number of the match as defined by FIFA, following the sequence 1 = A1 vs A2, 2 = B1 vs B2,
 *      3 = C1 vs C2, 4 = C3 vs C4, etc. Not necessarily the chronological order of the matches.
 *  team1, team2: the teams competing.
 *  score1, score2: their scores.
 *  play: Called when the user changes one of the scores in the UI. Passes the scores to team.play, and
 *        the old scores to team.unplay, as appropriate (see respective methods).
 */
function Match(id, team1, team2) {
    this.id = id;
    this.team1 = team1;
    this.team2 = team2;
    var score1 = '';
    var score2 = '';
    this.played = function () {
        return (isNonNegativeNumber(score1) && isNonNegativeNumber(score2)); 
    };
    this.play = function (goals1, goals2) {
        var updateTable = false;
        if (this.played()) {
            team1.unplay(score1, score2);
            team2.unplay(score2, score1);
            updateTable = true;
        }
        if (isNonNegativeNumber(goals1) && isNonNegativeNumber(goals2)) {
            team1.play(parseInt(goals1), parseInt(goals2));
            team2.play(parseInt(goals2), parseInt(goals1));
            updateTable = true;
        }
        score1 = goals1;
        score2 = goals2;
        return updateTable;
    };
}

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
function Team(id, countryName) {
    this.id = id;
    this.countryName = countryName;
    this.requiresAdvancedTiebreak = -1;
    this.prevRank = id % 4;
    this.isEliminated = 0;
    this.hasClinched = 0;
    this.eliminate = function () {
    	isEliminated = 1;
    	hasClinched = -1;
    };
    this.clinch = function () {
    	isEliminated = -1;
    	hasClinched = 1;
    }
    this.resetGroupStatus = function() {
    	isEliminated = 0;
    	hasClinched = 0;
    }
    this.knownStatus = function() {
    	return (isEliminated === 1 || hasClinched === 1);
    }
    var stats = {"played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0};
    //var played, won, drawn, lost, goalsFor, goalsAgainst;
    //played = won = drawn = lost = goalsFor = goalsAgainst = 0;
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
    }
    this.reset = function () {
        var savedState = stats;
        stats = {"played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0};
        return savedState;
    }
    this.loadSave = function(save) {
        stats = save;
        requiresAdvancedTiebreak = -1;
    }
}

function Group(id, teams) {
    this.id = id;
    this.teams = teams;
    var matches = [];
    matches[0] = new Match(2 * id + 1, teams[0], teams[1]);
    matches[1] = new Match(2 * id + 2, teams[2], teams[3]);
    matches[2] = new Match(16 + 2 * id + 1, teams[0], teams[2]);
    matches[3] = new Match(16 + 2 * id + 2, teams[3], teams[1]);
    matches[4] = new Match(32 + 2 * id + 1, teams[3], teams[0]);
    matches[5] = new Match(32 + 2 * id + 2, teams[1], teams[2]);
    this.play = function (matchIndex, goals1, goals2) {
        if (matches[matchIndex].play(goals1, goals2)) {
            this.reorderTable();
            this.colorRows();
        }
    };
    this.played = function () {
    	var matchesPlayed = 0;
    	for (var i = 0; i < matches.length; i++) {
    		if (matches[i].played) {
    			matchesPlayed++;
    		}
    	return matchesPlayed;
    	}
    };
    this.rankAll = function () {
        teams.sort(teamCompare);
        for (var i = 0; i < teams.length; i++) {
            if (teams[i].requiresAdvancedTiebreak !== -1) {
                saves = {};
                saves[teams[i].id] = teams[i].reset();
                minigroup = [teams[i]];
                for (var j = i+1; j < teams.length; j++) {
                    if (teams[j].requiresAdvancedTiebreak === teams[i].requiresAdvancedTiebreak) {
                        saves[teams[j].id] = teams[j].reset();
                        minigroup.push(teams[j]);
                    }
                    else {
                        break;
                    }
                }
                var correctOrder = advancedTiebreak(minigroup, matches);
                for (var k = 0; k < minigroup.length; k++) {
                    teams[i+k] = minigroup[k];
                    teams[i+k].loadSave(saves[teams[i+k].id]);
                }
                i = i+minigroup.length-1;
            }
        }
        return teams;
    };
    this.firstTable = function () {
    	this.rankAll();
    	var statKeys = ["played", "won", "drawn", "lost", "goalsFor", "goalsAgainst", "goalDifference", "points"]; //avoiding forEach for the benefit of IE8 users
        var html = '<table><tr>'+
                       '<th width="190">Team</th>'+
                       '<th width="28"><abbr title="Played">Pld</abbr></th>'+
                       '<th width="28"><abbr title="Won">W</abbr></th>'+
                       '<th width="28"><abbr title="Drawn">D</abbr></th>'+
                       '<th width="28"><abbr title="Lost">L</abbr></th>'+
                       '<th width="28"><abbr title="Goals For">GF</abbr></th>'+
                       '<th width="28"><abbr title="Goals Against">GA</abbr></th>'+
                       '<th width="28"><abbr title="Goal Difference">GD</abbr></th>'+
                       '<th width="28"><abbr title="Points">Pts</abbr></th>'+
                   '</tr>';
        for (var i = 0; i < teams.length; i++) {
            html += '<tr id="row'+teams[i].id+'">'+
                       '<td><div class="countryName">'+teams[i].countryName+'</div></td>'; //wrapping div necessary for animations, which cannot work on table rows or cells
            for (var j = 0; j < statKeys.length; j++) {
            	html+= '<td><div class="'+statKeys[j]+'">'+teams[i].getStat(statKeys[j])+'</div></td>';
            }
            html += '</tr>';
        }
        html += "</table>";
        //alert(html);
        $("#"+this.id+" .groupTable").html(html);
    };
    this.reorderTable = function () {
    	this.rankAll();
    	var statKeys = ["played", "won", "drawn", "lost", "goalsFor", "goalsAgainst", "goalDifference", "points"];
       	for (var i = 0; i < teams.length; i++) {
    		for (var j = 0; j < statKeys.length; j++) {
				//alert($("#"+this.id+" .groupTable #row"+teams[i].id+" ."+statKeys[j]).text());
				$("#"+this.id+" .groupTable #row"+teams[i].id+" ."+statKeys[j]).text(teams[i].getStat(statKeys[j]));
			}
    	}
    	for (var i = 0; i < teams.length; i++) { //two iterations over same array intentional; want to change stats before beginning animation
    		var rankChange = i - teams[i].prevRank;
       		$("#"+this.id+" .groupTable #row"+teams[i].id+" div").animate({"top":"+="+(rankChange*22)+"px"});
       		teams[i].prevRank = i;
    	}
    }
    this.drawMatches = function () {
        var html = '';
        for (var i = 0; i < matches.length; i++) {
            html += '<div class="match'+i+' matchRow">'+
                        '<p class="team1">'+matches[i].team1.countryName+'<img src="flags/'+matches[i].team1.id+'.png"></p>'+
                        '<p class="result"><input class="score1" maxlength="1"> - <input class="score2" maxlength="1"></p>'+
                        '<p class="team2"><img src="flags/'+matches[i].team2.id+'.png">'+matches[i].team2.countryName+'</p>'+
                    '</div>';
        }
        $("#"+this.id+" .matches").html(html);
    };
    
    /* colorRows
     * Colors the table green for teams that have clinched a berth in the knockout round, red for those that have been eliminated.
     * Uses helper functions in groupStatus.js. I couldn't come up with a nice, graph-theoretic proof, so I just tried a bunch of
     * scenarios and coded the heuristics that I, as a human, used to determine who had clinched and who was eliminated.
     * Try/catch/finally statements are used as general control flow statements, rather than for error handling, to make skipping
     * to the end easy.
     */
    this.colorRows = function() {
    	try {
	    	for (var i = 0; i < teams.length; i++) {
	    		teams[i].resetGroupStatus();
	    	}
	    	if (this.played() <= 2) { //If 2 or fewer games have been played, no team can have clinched or been eliminated.
	    		throw "done";
	    	}
	    	if (this.played() === 6) {//If all games have been played, the top 2 teams have clinched and the bottom 2 are eliminated.
	    		teams[0].clinch();
	    		teams[1].clinch();
	    		teams[2].eliminate();
	    		teams[3].eliminate();
	    		throw "done";
	    	}
	    	var teamsClinched = 0;
	    	var teamsEliminated = 0;
	    	var teamsKnownStatus = 0;
	    	for (var i = 0; i < teams.length; i++) {
	    		if (teams[i].getStat("points") >= 7) { //7 points clinches. (There are only 18 points up for grabs.)
	    			teams[i].clinch();
	    			teamsClinched++;
	    			teamsKnownStatus++;
	    		}
	    		else if (teams[i].getStat("played") === 3 && teams[i].getStat("points") <= 2) {
	    			teams[i].eliminate(); //Finishing with 2 points eliminates.
	    			teamsEliminated++;
	    			teamsKnownStatus++;
	    		}
	    		else if (teams[i].getStat("played") <= 1) { //You cannot be eliminated, or clinch, after only one match.
	    			teams[i].isEliminated = -1;
	    			teams[i].hasClinched = -1;
	    			teamsKnownStatus++;
	    		}
	    		else if (teams[i].getStat("played") === 2 && teams[i].getStat("points") >= 3) {
	    			teams[i].isEliminated = -1; //If you've scored at least 3 points through 2 matches, you aren't eliminated.
	    		}
	    	}
	    	/* This is where it gets complicated. To decide the status of the remaining teams, we simulate the remaining matches.
	    	 * To decide whether a team is eliminated, we make the sims as favorable to that team as possible and see if they can
	       	 * finish in 1st or 2nd.  To determine whether a team has clinched, we make the sims as unfavorable to that team as
	       	 * possible and see if they can finish in 3rd or 4th. More info is in groupStatus.js.
	       	 */
	    	for (var i = teams.length; i >= 0; i--) {
	    		if (!teams[i].knownStatus()) {
	    			var matchesLeft = [];
	    			var leagueTable = teams;
	    			for (var i = 0; i < matches.length; i++) {
	    				if (!this.matches[i].played()) {
	    					if ((matches[i].team1.id === teams[i].id || matches[i].team2.id === teams[i].id) {
	    						matchesLeft.unshift(matches[i]);	//when we pass to helper function, we want to sim
	    					}										//the team in question's matches first.
	    					else {
	    						matchesLeft.push(matches[i]);
	    					}
	    				}
	    			}
	    			if (teams[i].isEliminated !== -1 && determineIfEliminated(i, leagueTable, matchesLeft)) {
	    				teams[i].eliminate();
	    				teamsEliminated++;
	    				teamsKnownStatus++;
	    			}
	    			else if (determineIfClinched(i, leagueTable, matchesLeft)) {
	    				teams[i].clinch();
	    				teamsClinched++;
	    				teamsKnownStatus++;
	    			}
	    		}
	    		if (teamsEliminated === 2) {	//Perform checks again in case previous sims have made you cross a threshold
	    			throw "clinchRest";
	    		}
	    		if (teamsClinched === 2) {		
	    			throw "eliminateRest";
	    		}
	    		if (teamsKnownStatus === 4) {
	    			throw "done";
	    		}
	    	}
	    }
	    catch (e) {
    		if (e === "clinchRest") {	//If two teams are eliminated, the other two have clinched.
    			for (var i = 0; i < teams.length; i++) {
    				if (!teams[i].knownStatus()) {
    					teams[i].clinch();
    				}
    			}
    		}
    		else if (e === "eliminateRest") {
    			for (var i = 0; i < teams.length; i++) {
    				if (!teams[i].knownStatus()) {
    					teams[i].eliminate();
    				}
    			}
    		}
    	}
    	//Finally, after having decided the status of every team, color the rows.
    	finally {
			for (var i = 0; i < teams.length; i++) {
				if (teams[i].hasClinched === 1) {
					$("#"+this.id+" .groupTable #row"+teams[i].id+" div").addClass("clinched");
				}
				if (teams[i].isEliminated === 1) {
					$("#"+this.id+" .groupTable #row"+teams[i].id+" div").addClass("eliminated");
				}
			}
		}
    };
}

countrynames = ["Brazil", "Croatia", "Mexico", "Cameroon", "Spain", "Netherlands", "Chile", "Australia", "Colombia", "Greece", "Ivory Coast", "Japan", "Uruguay", "Costa Rica", "England", "Italy", "Switzerland", "Ecuador", "France", "Honduras", "Argentina", "Bosnia & Herz.", "Iran", "Nigeria", "Germany", "Portugal", "Ghana", "United States", "Belgium", "Algeria", "Russia", "Korea Republic"];
Groups = [];
for (var group=0; group<8; group++) {
    var teams = [];
    for (var i=0; i < 4; i++) {
        teams[i] = new Team(4*group+i, countrynames[4*group+i]);
    }
    Groups[group] = new Group(String.fromCharCode(group+65), teams);
}
