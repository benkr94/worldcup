/* groupUtils sub-module
 * Complex functions related to group reordering and clinching that I didn't want cluttering the group constructor and getting re-
 * declared with each new instance.
 */


var Brazil2014 = (function (Tournament) {

    /* teamCompare
     * The comparison function used to order groups' team-arrays by how the teams have performed, using the appropriate tiebreak
     * rules. It looks backwards (ie, better performance = "less than") so that I can just use it in Array.sort() without reversing it
     * and get the teams from first to last. If teams are tied on points, goalDifference, and goalsFor, it flags the teams as
     * requiring advanced tiebreaking (see function below)
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
    function advancedTiebreak(minigroup, matches) {
        for (var m = 0; m < matches.length; m++) {
            var matched1 = -1;
            var matched2 = -1;
            for (var t = 0; t < minigroup.length; t++) {
                if (matches[m].team1.id === minigroup[t].id) {
                    matched1 = t;
                }
                if (matches[m].team2.id === minigroup[t].id) {
                    matched2 = t;
                }
            }
            if (matched1 !== -1 && matched2 !== -1) {
                minigroup[matched1].play(matches[m].getScore(1), matches[m].getScore(2));
                minigroup[matched2].play(matches[m].getScore(2), matches[m].getScore(1));
            }
        }
        return minigroup.sort(teamCompare);
    }
    
    /* threat
     * Determines whether a team (threatener) is competing for qualification places with another team (evalTeam). False if threatener
     * either cannot catch up with evalTeam, or cannot be caught by evalTeam
     */
    function threat(threatener, evalTeam) {
        if (threatener.getStat("played") === 3 || evalTeam.getStat("points") < 2 || evalTeam.getStat("points") > 6) {
            throw new Error("ERROR: Improper use of threat function");
        }
        if (threatener.getStat("played") < 2) {
            return true;
        }
        if (threatener.isEliminated === 1 || threatener.hasClinched === 1) {
            return false;
        }
        var ptsBetween = evalTeam.getStat("points") - threatener.getStat("points");
        if (ptsBetween > 3 || ptsBetween < 0) {
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
                return [99, 99+loseBy];
                break;
        }
    }

    /* determineIfEliminated(teamIndex, matches, leagueTable)
     * Determines if the team at teamIndex in the leagueTable has been eliminated based on the matches remaining.
     */
    function determineIfEliminated(teamIndex, matches, teams) {
        var leagueTable = teams.slice(0);
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
        for (var m = 0; m < matches.length; m++) { //Next, make any non-contending teams win 99-0 to limit threat from their opponents.
            if (!threat(matches[m].team1, leagueTable[teamIndex])) {
                matches[m].play(99,0);
                alreadyPlayed.push(matches[m]);
                matches.splice(m,1);
                m--; //since we have removed the match at this index, need to retry this index on next iteration.
            }
            else if (!threat(matches[m].team2, leagueTable[teamIndex])) {
                matches[m].play(0,99);
                alreadyPlayed.push(matches[m]);
                matches.splice(m,1);
                m--;
            }
        }
        for (var m = 0; m < matches.length; m++) { //Finally, simulate remaining match(es) to minimize damage, per testEliminationMatch.
            if (matches[m].team1.getStat("played") === 2) {
                var result = testEliminationMatch(matches[m].team1, leagueTable[teamIndex]);
                matches[m].play(result[0], result[1]);
                alreadyPlayed.push(matches[m]);
                matches.splice(m,1);
                m--;
            }
            else if (matches[m].team2.getStat("played") === 2) {
                var result = testEliminationMatch(matches[m].team2, leagueTable[teamIndex]);
                matches[m].play(result[1], result[0]);
                alreadyPlayed.push(matches[m]);
                matches.splice(m,1);
                m--;
            }
        }
        if (matches.length != 0) {	//If all other teams have 2 games remaining and this team does not have <=1 pt, they cannot be eliminated 
            return false;
        }
        leagueTable.sort(teamCompare);
        var finalStatus = false;
        for (var t = 2; t < leagueTable.length; t++) {
            if (leagueTable[t].id === teamID) {
                if (leagueTable[t].requiresAdvancedTiebreak === leagueTable[1].requiresAdvancedTiebreak && leagueTable[t].requiresAdvancedTiebreak > -1) {
                    break; //Do not want to mark teams relying on lot-drawing as eliminated.
                }
                finalStatus = true;
            }
        }
        //We used shallow copy of the league table because the matches' 'play' method would not affect a deep one , so we need to
        //unplay the matches and reset rAT from the array sort, so when we return, the teams will be in the condition they came in
        for (var t = 0; t < leagueTable.length; t++) {
        	leagueTable[t].requiresAdvancedTiebreak = -1;
        }
        for (var m = 0; m < alreadyPlayed.length; m++) {
            alreadyPlayed[m].unplay();
            matches.push(alreadyPlayed[m]);
        }
        return finalStatus;
    }

    /* determineIfClinched(teamIndex, matches, leagueTable)
     * Determines if the team at teamIndex in the leagueTable has clinched a berth in the knockout stage based on the matches remaining.
     */
    function determineIfClinched(teamIndex, matches, teams) {
        var leagueTable = teams.slice(0);
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
        for (var m = 0; m < matches.length; m++) { //Next, make any non-contending teams lose 99-0 to maximize threat from their opponents.
            if (!threat(matches[m].team1, leagueTable[teamIndex])) {
                matches[m].play(0,99);
                alreadyPlayed.push(matches[m]);
                matches.splice(m,1);
                m--; //since we have removed the match at this index, need to retry this index on next iteration.
            }
            else if (!threat(matches[m].team2, leagueTable[teamIndex])) {
                matches[m].play(99,0);
                alreadyPlayed.push(matches[m]);
                matches.splice(m,1);
                m--;
            }
        }
        for (var m = 0; m < matches.length; m++) { //Finally, simulate remaining match(es) to maximize damage, per testClinchingMatch.
            if (matches[m].team1.getStat("played") === 2) {
                var result = testClinchingMatch(matches[m].team1, leagueTable[teamIndex]);
                matches[m].play(result[0], result[1]);
                alreadyPlayed.push(matches[m]);
                matches.splice(m,1);
                m--;
            }
            else if (matches[m].team2.getStat("played") === 2) {
                var result = testClinchingMatch(matches[m].team2, leagueTable[teamIndex]);
                matches[m].play(result[1], result[0]);
                alreadyPlayed.push(matches[m]);
                matches.splice(m,1);
                m--;
            }
        }
        if (matches.length != 0) {	//If all other teams have 2 games remaining and this team does not have 7 pts, they cannot have clinched 
            return false;
        }
        leagueTable.sort(teamCompare);
        var finalStatus = false;
        for (var t = 0; t < 2; t++) {
            if (leagueTable[t].id === teamID) {
                if (leagueTable[t].requiresAdvancedTiebreak === leagueTable[2].requiresAdvancedTiebreak && leagueTable[t].requiresAdvancedTiebreak > -1) {
                    break; //Do not want to mark teams relying on lot-drawing as clinched.
                }
                finalStatus = true;
            }
        }
        //We used shallow copy of the league table because the matches' 'play' method would not affect a deep one , so we need to
        //unplay the matches and reset rAT from the array sort, so when we return, the teams will be in the condition they came in
        for (var t = 0; t < leagueTable.length; t++) {
        	leagueTable[t].requiresAdvancedTiebreak = -1;
        }
        for (var m = 0; m < alreadyPlayed.length; m++) {
            alreadyPlayed[m].unplay();
            matches.push(alreadyPlayed[m]);
        }
        return finalStatus;
    }
    /*Methods revealed by module*/
    Tournament.groupUtils = {
        teamCompare:			teamCompare,
        advancedTiebreak:		advancedTiebreak,
        determineIfEliminated:	determineIfEliminated,
        determineIfClinched:	determineIfClinched
    };
    return Tournament;
}(Brazil2014));
