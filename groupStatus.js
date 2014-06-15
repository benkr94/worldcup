function threat(threatener, evalTeam) {
	if (threatener.isEliminated === 1 || threatener.hasClinched === 1) {
		return false;
	}
	ptsBetween = evalTeam.getStat("points") - threatener.getStat("points");
	goalDifferenceBetween = evalTeam.getStat("goalDifference") - threatener.getStat("goalDifference");
	goalsForBetween = evalTeam.getStat("goalsFor") - threatener.getStat("goalsFor");
	if (ptsBetween > 3 || ptsBetween < 0) {
		return false;
	} //below tests should never be entered; should not be evaluating team with no games to play. Will put in error handling.
	if (ptsBetween === 3 && goalDifferenceBetween > 0 && threatener.getStat("played") === 3) {
		return false;
	}
	if (ptsBetween === 0 && goalDifferenceBetween < 0 && threatener.getStat("played") === 3) {
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
	if (!threat(threatener, evalTeam)) { //"Threatener" is no such thing. Return heavy loss for opponent.
			return [99,0];
	}
	ptsBetween = evalTeam.getStat("points") - threatener.getStat("points");
	goalDifferenceBetween = evalTeam.getStat("goalDifference") - threatener.getStat("goalDifference");
	goalsForBetween = evalTeam.getStat("goalsFor") - threatener.getStat("goalsFor");
	var winBy = 0;
	var loseBy = 0;
	switch (ptsBetween) {
		case 3: //If the threatener trails by 3 points, they can safely win by as many points as they are behind in goal difference.
			winBy = (goalDifferenceBetween < goalsForBetween) ? goalDifferenceBetween : goalDifferenceBetween - 1;
			winBy = (winBy > 0) ? winBy : 0; //If the threatener leads in goal difference, they cannot safely win. Return 0-0 draw.
			return [winBy, 0];
			break;
		case 2: //If the threatener trails by only 2 points, they cannot win without passing the evalTeam. Return 0-0 draw.
			return [0,0];
			break;         
		case 1: //If the threatener trails by one point, return a 0-0 draw, unless they would win the tiebreak. Then return 0-1 loss.
			if (goalDifferenceBetween < 0 || (goalDifferenceBetween === 0 && goalsForBetween <= 0)) {
				return [0,1]
			}
			else {
				return [0,0];
			}
			break;
		case 0: //If the threatener is tied, in order to not finish above the evalTeam, they must lose by enough to lose the tiebreak.
			if (goalDifferenceBetween < 0) {
				loseBy = 0 - goalDifferenceBetween;
				if (goalsForBetween <= 0) {
					loseBy++;
				}
			}
			else { //If the threatener is already losing the tiebreak, just lose by 1.
				loseBy = 1;
			}
			return [loseBy, 0];
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
	if (!threat(threatener, evalTeam)) { //"Threatener" is no such thing. Return heavy win for opponent.
		return [0,99];
	}
	ptsBetween = evalTeam.getStat("points") - threatener.getStat("points");
	goalDifferenceBetween = evalTeam.getStat("goalDifference") - threatener.getStat("goalDifference");
	goalsForBetween = evalTeam.getStat("goalsFor") - threatener.getStat("goalsFor");
	winBy = 0;
	switch (ptsBetween) {
		case 3: //If the threatener trails by 3 points, have them win by enough to win the GD tiebreak, while allowing tons of goals.
			winBy = (goalDifferenceBetween < 1) ? 1 : goalDifferenceBetween;
			return [99, 99-winBy];
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
			return [99 - loseBy, 99];
			break;
	}
}

/* determineIfEliminated(teamIndex, matches, leagueTable)
 * Determines if the team at teamIndex in the leagueTable has been eliminated based on the matches remaining.
 */
function determineIfEliminated(teamIndex, matches, leagueTable) {
	var teamID = leagueTable[teamIndex].id;
	var alreadyPlayed = [];
	if (matches[0].team1.id === teamID) { //First, if the team has a match remaining, make it a landslide win. 
		matches[0].play(99,0);
		alreadyPlayed.push(matches.shift());
	}
	else if (matches[0].team2.id === teamID) {
		matches[0].play(0,99);
		alreadyPlayed.push(matches.shift());
	}
	for (var j = 0; j < matches.length; j++) { //Next, make any non-contending teams win 99-0 to limit threat from their opponents.
		if (!threat(matches[j].team1, leagueTable[teamIndex]) {
			matches[j].play(99,0);
			alreadyPlayed.push(matches[j]);
			matches.splice(j,1);
			j--; //since we have removed the match at this index, need to retry this index on next iteration.
		}
		else if (!threat(matches[j].team2, leagueTable[teamIndex]) {
			matches[j].play(0,99);
			alreadyPlayed.push(matches[j]);
			matches.splice(j,1);
			j--;
		}
	}
	for (var j = 0; j < matches.length; j++) { //Finally, simulate remaining match(es) to minimize damage, per testEliminationMatch.
		if (matches[j].team1.getStat("played") === 2)) {
			var result = testEliminationMatch(matches[j].team1, leagueTable[teamIndex]);
			matches[j].play(result[0], result[1]);
			alreadyPlayed.push(matches[j]);
			matches.splice(j,1);
			j--;
		}
		else if (matches[j].team2.getStat("played") === 2)) {
			var result = testEliminationMatch(matches[j].team1, leagueTable[teamIndex]);
			matches[j].play(result[1], result[0]);
			alreadyPlayed.push(matches[j]);
			matches.splice(j,1);
			j--;
		}
	}
	leagueTable.sort(teamCompare);
	var finalStatus = false;
	for (var i = 2; i < leagueTable.length; i++) {
		if (leagueTable[i].id === teamID) {
			leagueTable[i].eliminate();
			finalStatus = true;
		}
	}
	for (var j = 0; j < alreadyPlayed.length; j++)
		alreadyPlayed[j].unplay();
	}
	return finalStatus;
}

/* determineIfClinched(teamIndex, matches, leagueTable)
 * Determines if the team at teamIndex in the leagueTable has clinched a berth in the knockout stage based on the matches remaining.
 */
function determineIfEliminated(teamIndex, matches, leagueTable) {
	var teamID = leagueTable[teamIndex].id;
	var alreadyPlayed = [];
	if (matches[0].team1.id === teamID) { //First, if the team has a match remaining, make it a landslide loss. 
		matches[0].play(0, 99);
		alreadyPlayed.push(matches.shift());
	}
	else if (matches[0].team2.id === teamID) {
		matches[0].play(99,0);
		alreadyPlayed.push(matches.shift());
	}
	for (var j = 0; j < matches.length; j++) { //Next, make any non-contending teams lose 99-0 to maximize threat from their opponents.
		if (!threat(matches[j].team1, leagueTable[teamIndex]) {
			matches[j].play(0,99);
			alreadyPlayed.push(matches[j]);
			matches.splice(j,1);
			j--; //since we have removed the match at this index, need to retry this index on next iteration.
		}
		else if (!threat(matches[j].team2, leagueTable[teamIndex]) {
			matches[j].play(99,0);
			alreadyPlayed.push(matches[j]);
			matches.splice(j,1);
			j--;
		}
	}
	for (var j = 0; j < matches.length; j++) { //Finally, simulate remaining match(es) to maximize damage, per testClinchingMatch.
		if (matches[j].team1.getStat("played") === 2)) {
			var result = testClinchingMatch(matches[j].team1, leagueTable[teamIndex]);
			matches[j].play(result[0], result[1]);
			alreadyPlayed.push(matches[j]);
			matches.splice(j,1);
			j--;
		}
		else if (matches[j].team2.getStat("played") === 2)) {
			var result = testClinchingMatch(matches[j].team1, leagueTable[teamIndex]);
			matches[j].play(result[1], result[0]);
			alreadyPlayed.push(matches[j]);
			matches.splice(j,1);
			j--;
		}
	}
	leagueTable.sort(teamCompare);
	var finalStatus = false;
	for (var i = 0; i < 2; i++) {
		if (leagueTable[i].id === teamID) {
			leagueTable[i].clinch();
			finalStatus = true;
		}
	}
	for (var j = 0; j < alreadyPlayed.length; j++)
		alreadyPlayed[i].unplay();
	}
	return finalStatus;
}
