/* groupUtils sub-module
 * Complex functions related to group reordering and clinching that I didn't want cluttering the group constructor and getting re-
 * declared with each new instance.
 */


var Brazil2014 = (function (Tournament) {

	/* teamCompare
	 * The comparison function used to order groups' team-arrays by how the teams have performed,
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
		        if (matches[m].team1.id === teams[t].id) {
		            matched1 = t;
		        }
		        if (matches[m].team2.id === teams[t].id) {
		            matched2 = t;
		        }
		    }
		    if (matched1 !== -1 && matched2 !== -1) {
		        teams[matched1].play(matches[m].getScore(1), matches[m].getScore(2));
		        teams[matched2].play(matches[m].getScore(2), matches[m].getScore(1));
		    }
		}
		return teams.sort(teamCompare);
	}
	
	/* threat
	 * Determines whether a team (threatener) is competing for qualification places with another team (evalTeam). False if threatener
	 * either cannot catch up with evalTeam, or cannot be caught by evalTeam
	 */
	function threat(threatener, evalTeam) {
		if (threatener.getStat("played") < 2) {	//Will have already filtered out teams that have > 6 points
			return true;
		}
		if (threatener.isEliminated === 1 || threatener.hasClinched === 1) {
			console.log("Deciding non-threat based on known eliminated/clinching status.");
			return false;
		}
		ptsBetween = evalTeam.getStat("points") - threatener.getStat("points");
		goalDifferenceBetween = evalTeam.getStat("goalDifference") - threatener.getStat("goalDifference");
		goalsForBetween = evalTeam.getStat("goalsFor") - threatener.getStat("goalsFor");
		if (ptsBetween > 3 || ptsBetween < 0) {
			console.log("Deciding non-threat based on points differential: "+threatener.countryName+" has "+threatener.getStat("points")+", "+evalTeam.countryName+" has "+evalTeam.getStat("points"));
			return false;
		} //below tests should never be entered; should not be evaluating team with no games to play. Will put in error handling.
		if (ptsBetween === 3 && goalDifferenceBetween > 0 && threatener.getStat("played") === 3) {
			console.log("You shouldn't be here!");
			return false;
		}
		if (ptsBetween === 0 && goalDifferenceBetween < 0 && threatener.getStat("played") === 3) {
			console.log("You shouldn't be here!");
			return false;
		}
		return true;
	}

	/* testEliminationMatch(threatener, evalTeam)
	 * Returns the scoreline of a simulated match used in testing whether or not a team is eliminated.
	 * threatener: A team with only one game remaining.
	 * evalTeam: The team which you are evaluating whether or not they have been eliminated.
	 * The guiding principle is that the threatener should do as well as possible without passing the evalTeam -- that is, they
	 * should cede as few points and goals as possible to their opponent, so the opponent might not pass the evalTeam either.
	 * Assumes evalTeam has played all games -- determineIfEliminated is written so that this is only called once that's so.
	 * ptsBetween, goalDifferenceBetween, goalsForBetween: positive if the evalTeam is leading.
	 */
	function testEliminationMatch(threatener, evalTeam) {
		if (!threat(threatener, evalTeam)) { //"Threatener" doesn't actually threaten evalTeam. Return heavy loss for opponent.
				return [99,0];
		}
		ptsBetween = evalTeam.getStat("points") - threatener.getStat("points");
		goalDifferenceBetween = evalTeam.getStat("goalDifference") - threatener.getStat("goalDifference");
		goalsForBetween = evalTeam.getStat("goalsFor") - threatener.getStat("goalsFor");
		var winBy = 0;
		var loseBy = 0;
		switch (ptsBetween) {
			case 3: //If the threatener trails by 3 points, they can safely win by as many points as they are behind in goal difference.
				winBy = (goalDifferenceBetween <= goalsForBetween) ? goalDifferenceBetween : goalDifferenceBetween - 1;
				winBy = (winBy > 0) ? winBy : 0; //If the threatener leads in goal difference, they cannot safely win. Return 0-0 draw.
				return [winBy, 0];
				break;
			case 2: //If the threatener trails by only 2 points, they cannot win without passing the evalTeam. Return 0-0 draw.
				return [0,0];
				break;         
			case 1: //If the threatener trails by one point, return a 0-0 draw, unless they would win the tiebreak. Then return 0-1 loss.
				if (goalDifferenceBetween < 0 || (goalDifferenceBetween === 0 && goalsForBetween < 0)) {
					return [0,1]
				}
				else {
					return [0,0];
				}
				break;
			case 0: //If the threatener is tied, in order to not finish above the evalTeam, they must lose by enough to lose the tiebreak.
				if (goalDifferenceBetween < 0) {
					loseBy = 0 - goalDifferenceBetween;
					if (goalsForBetween < 0) {
						loseBy++;
					}
				}
				else { //If the threatener is already losing the tiebreak, just lose by 1.
					loseBy = 1;
				}
				return [0, loseBy];
				break;
		}
	}

	/* testClinchingMatch(threatener, evalTeam)
	 * Returns the scoreline of a simulated match used in testing whether or not a team has clinched a berth in the knockout stage.
	 * threatener: A team with only one game remaining.
	 * evalTeam: The team which you are evaluating whether or not they have been eliminated.
	 * The guiding principle is that the threatener should do as poorly as possible while still passing the evalTeam -- that is, they
	 * should cede as many points and goals as possible to their opponent, so the opponent might also pass the evalTeam.
	 * Assumes evalTeam has played all games -- determineIfClinched is written so that this is only called once that's so.
	 * ptsBetween, goalDifferenceBetween, goalsForBetween: positive if the evalTeam is leading.
	 */
	function testClinchingMatch(threatener, evalTeam) {
		if (!threat(threatener, evalTeam)) { //"Threatener" doesn't actually threaten evalTeam. Return heavy win for opponent.
			return [0,99];
		}
		ptsBetween = evalTeam.getStat("points") - threatener.getStat("points");
		goalDifferenceBetween = evalTeam.getStat("goalDifference") - threatener.getStat("goalDifference");
		goalsForBetween = evalTeam.getStat("goalsFor") - threatener.getStat("goalsFor");
		winBy = 0;
		switch (ptsBetween) {
			case 3: //If the threatener trails by 3 points, have them win by enough to win the GD tiebreak, while allowing tons of goals.
				winBy = (goalDifferenceBetween < 1) ? 1 : goalDifferenceBetween;
				return [99+winBy, 99];
				break;
			case 2: //If the threatener trails by 2 points, have them win by one and allow tons of goals.
				return [99, 98];
				break;       
			case 1: //If the threatener trails by 1 point, have them tie if they're winning the goal difference tiebreak, or win if not.
				if (goalDifferenceBetween <= 0) {
					return [99, 99];
				}
				else {
					return [99, 98];
				}
				break;
			case 0: //If the threatener is tied, have them lose by enough to just win the tiebreak, or tie if that's not possible.
				loseBy = (goalDifferenceBetween < 0) ? 0 - goalDifferenceBetween : 0
				//alert(loseBy);
				return [99, 99+loseBy];
				break;
		}
	}

	/* determineIfEliminated(teamIndex, matches, leagueTable)
	 * Determines if the team at teamIndex in the leagueTable has been eliminated based on the matches remaining.
	 */
	function determineIfEliminated(teamIndex, matches, teams) {
		var leagueTable = teams.slice(0);
		console.log("Successfully called determineIfEliminated");
		var teamID = leagueTable[teamIndex].id;
		var alreadyPlayed = [];
		if (matches[0].team1.id === teamID) { //First, if the team has a match remaining, make it a landslide win. 
			console.log("Simming 99-0 win for team's remaining match");
			matches[0].play(99,0);
			alreadyPlayed.push(matches.shift());
		}
		else if (matches[0].team2.id === teamID) {
			console.log("Simming 99-0 win for team's remaining match");
			matches[0].play(0,99);
			alreadyPlayed.push(matches.shift());
		}
		for (var j = 0; j < matches.length; j++) { //Next, make any non-contending teams win 99-0 to limit threat from their opponents.
			if (!threat(matches[j].team1, leagueTable[teamIndex])) {
				console.log(matches[j].team1.countryName+" doesn't threaten "+leagueTable[teamIndex].countryName+". Simming 99-0 win.");
				matches[j].play(99,0);
				alreadyPlayed.push(matches[j]);
				matches.splice(j,1);
				j--; //since we have removed the match at this index, need to retry this index on next iteration.
			}
			else if (!threat(matches[j].team2, leagueTable[teamIndex])) {
				console.log(matches[j].team1.countryName+" doesn't threaten "+leagueTable[teamIndex].countryName+". Simming 99-0 win.");
				matches[j].play(0,99);
				alreadyPlayed.push(matches[j]);
				matches.splice(j,1);
				j--;
			}
		}
		for (var j = 0; j < matches.length; j++) { //Finally, simulate remaining match(es) to minimize damage, per testEliminationMatch.
			if (matches[j].team1.getStat("played") === 2) {
				console.log("Calling testEliminationMatch");
				var result = testEliminationMatch(matches[j].team1, leagueTable[teamIndex]);
				console.log("testEliminationMatch. The result of this sim is "+matches[j].team1.countryName+result[0]+matches[j].team2.countryName+result[1]);
				matches[j].play(result[0], result[1]);
				alreadyPlayed.push(matches[j]);
				matches.splice(j,1);
				j--;
			}
			else if (matches[j].team2.getStat("played") === 2) {
				console.log("Calling testEliminationMatch");
				var result = testEliminationMatch(matches[j].team2, leagueTable[teamIndex]);
				console.log("testEliminationMatch. The result of this sim is "+matches[j].team1.countryName+result[0]+matches[j].team2.countryName+result[1]);
				matches[j].play(result[1], result[0]);
				alreadyPlayed.push(matches[j]);
				matches.splice(j,1);
				j--;
			}
		}
		if (matches.length != 0) {	//If all other teams have 2 games remaining and this team does not have <=1 pt, they cannot be eliminated 
			return false;
		}
		leagueTable.sort(teamCompare);
		var finalStatus = false;
		for (var i = 2; i < leagueTable.length; i++) {
			if (leagueTable[i].id === teamID) {
				if (leagueTable[i].requiresAdvancedTiebreak === leagueTable[1].requiresAdvancedTiebreak && leagueTable[i].requiresAdvancedTiebreak > -1) {
					break; //Do not want to mark teams relying on lot-drawing as eliminated.
				}
				teams[teamIndex].eliminate();
				console.log("Eliminating "+teams[teamIndex].countryName);
				finalStatus = true;
			}
		}
		for (var j = 0; j < alreadyPlayed.length; j++) {
			alreadyPlayed[j].unplay();
			matches.push(alreadyPlayed[j]);
			console.log("Unplaying the match between "+alreadyPlayed[j].team1.countryName+" and "+alreadyPlayed[j].team2.countryName);
		}
		return finalStatus;
	}

	/* determineIfClinched(teamIndex, matches, leagueTable)
	 * Determines if the team at teamIndex in the leagueTable has clinched a berth in the knockout stage based on the matches remaining.
	 */
	function determineIfClinched(teamIndex, matches, teams) {
		var leagueTable = teams.slice(0);
		//console.log(matches.length);
		console.log("Successfully called determineIfClinched");
		var teamID = leagueTable[teamIndex].id;
		//console.log("TeamID being evaluated: "+leagueTable[teamIndex].id);
		//console.log("First match is between "+matches[0].team1.id+" and "+matches[0].team2.id);
		var alreadyPlayed = [];
		if (matches[0].team1.id === teamID) { //First, if the team has a match remaining, make it a landslide loss. 
			console.log("Simming 99-0 loss for "+matches[0].team1.countryName+"'s remaining match against "+matches[0].team2.countryName);
			matches[0].play(0, 99);
			alreadyPlayed.push(matches.shift());
		}
		else if (matches[0].team2.id === teamID) {
			console.log("Simming 99-0 loss for "+matches[0].team2.countryName+"'s remaining match against "+matches[0].team1.countryName);
			matches[0].play(99,0);
			alreadyPlayed.push(matches.shift());
		}
		for (var j = 0; j < matches.length; j++) { //Next, make any non-contending teams lose 99-0 to maximize threat from their opponents.
			if (!threat(matches[j].team1, leagueTable[teamIndex])) {
				console.log(matches[j].team1.countryName+" doesn't threaten "+leagueTable[teamIndex].countryName+". Simming 99-0 loss.");
				matches[j].play(0,99);
				alreadyPlayed.push(matches[j]);
				matches.splice(j,1);
				j--; //since we have removed the match at this index, need to retry this index on next iteration.
			}
			else if (!threat(matches[j].team2, leagueTable[teamIndex])) {
				console.log(matches[j].team2.countryName+" doesn't threaten "+leagueTable[teamIndex].countryName+". Simming 99-0 loss.");
				matches[j].play(99,0);
				alreadyPlayed.push(matches[j]);
				matches.splice(j,1);
				j--;
			}
		}
		for (var j = 0; j < matches.length; j++) { //Finally, simulate remaining match(es) to maximize damage, per testClinchingMatch.
			if (matches[j].team1.getStat("played") === 2) {
				var result = testClinchingMatch(matches[j].team1, leagueTable[teamIndex]);
				//alert(result);
				//console.log("testClinchingMatch. The result of this sim is "+matches[j].team1.countryName+result[0]+matches[j].team2.countryName+result[1]);
				matches[j].play(result[0], result[1]);
				alreadyPlayed.push(matches[j]);
				matches.splice(j,1);
				j--;
			}
			else if (matches[j].team2.getStat("played") === 2) {
				var result = testClinchingMatch(matches[j].team2, leagueTable[teamIndex]);
				//alert(result);
				//console.log("testClinchingMatch. The result of this sim is "+matches[j].team1.countryName+result[0]+matches[j].team2.countryName+result[1]
				matches[j].play(result[1], result[0]);
				alreadyPlayed.push(matches[j]);
				matches.splice(j,1);
				j--;
			}
		}
		if (matches.length != 0) {	//If all other teams have 2 games remaining and this team does not have 7 pts, they cannot have clinched 
			return false;
		}
		console.log("In this simulation, "+leagueTable[teamIndex].countryName+" gets "+leagueTable[teamIndex].getStat("points")+" points");
		leagueTable.sort(teamCompare);
		var finalStatus = false;
		for (var i = 0; i < 2; i++) {
			if (leagueTable[i].id === teamID) {
				if (leagueTable[i].requiresAdvancedTiebreak === leagueTable[2].requiresAdvancedTiebreak && leagueTable[i].requiresAdvancedTiebreak > -1) {
					break; //Do not want to mark teams relying on lot-drawing as clinched.
				}
				teams[teamIndex].clinch();
				console.log("Clinching "+teams[teamIndex].countryName);
				finalStatus = true;
			}
		}
		for (var j = 0; j < alreadyPlayed.length; j++) {
			alreadyPlayed[j].unplay();
			console.log("Unplaying the match between "+alreadyPlayed[j].team1.countryName+" and "+alreadyPlayed[j].team2.countryName);
			matches.push(alreadyPlayed[j]);
		}
		return finalStatus;
	}
	/*Methods revealed by module*/
	Tournament.groupUtils = {
		teamCompare: 			teamCompare,
		advancedTiebreak: 		advancedTiebreak,
		determineIfEliminated: 	determineIfEliminated,
		determineIfClinched:	determineIfClinched
	};
	return Tournament;
}(Brazil2014));
