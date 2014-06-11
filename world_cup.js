/* teamCompare
 * The comparison function used to order groups' team arrays by how the teams have performed,
 * using the appropriate tiebreak rules. It looks backwards (ie, better performance = "less than") 
 * so that I can just use it in Array.sort() without reversing it and get them from first to last.
 */ 

function teamCompare(a, b) {
    if (a.getPoints() > b.getPoints()) {
        return -1;
    }
    else if (b.getPoints() > a.getPoints()) {
        return 1;
    }
    else if (a.getGoalDifference() > b.getGoalDifference()) {
        return -1;
    }
    else if (b.getGoalDifference() > a.getGoalDifference()) {
        return 1;   
    }
    else if (a.getGoalsFor() > b.getGoalsFor()) {
        return -1;
    }
    else if (b.getGoalsFor() > a.getGoalsFor()) {
        return 1;
    }
    else if (a.getPlayed() > 0) {
        a.requiresAdvancedTiebreak = a.getPoints();
        b.requiresAdvancedTiebreak = b.getPoints();
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

/* IsNonNegativeInteger
 * Does what it says on the tin. Used to verify that both score inputs are valid before playing a match.
 */
function isNonNegativeNumber(n) {
    return parseInt(n) === Number(n) && n >= 0;
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
 *  play: Updates a team's stats given the score of a match. Only composite stats are stored in this object, not individual
 *    scores, to avoid having to constantly re-sum total, or unnecessarily storing both.
 *  unplay: Updates a team's stats (subtracts scores, decrements w/d/l) if the user decides to undo a match or change its score
      (implemented as unplay and then play with new scores)
 *  played, won, drawn, lost, goalsFor, goalsAgainst: stats for display in the table. Private, so that they can be modified
 *    only by playing a match, resetting, or loading a save
 *  getPlayed, getWon, getDrawn, getGoalsFor, getGoalsAgainst, getGoalDifference: Getters for above stats.
 *  reset: sets stats to zero, but returns them from before they are zeroed so that they may be reloaded if the resetting is
      just for advanced tiebreak. 
 *  loadSave: Sets the teams' stats to the values in the array passed as an argument.
 */
function Team(id, countryName) {
    this.id = id;
    this.countryName = countryName;
    this.requiresAdvancedTiebreak = -1;
    var played, won, drawn, lost, goalsFor, goalsAgainst;
    played = won = drawn = lost = goalsFor = goalsAgainst = 0;
    this.play = function (gfor, against) {
        played++;
        goalsFor += gfor;
        goalsAgainst += against;
        if (gfor > against) {
            won++;
        } else if (gfor === against) {
            drawn++;
        } else {
            lost++;
        }
    };
    this.unplay = function (gfor, against) {
        played--;
        goalsFor -= gfor;
        goalsAgainst -= against;
        if (gfor > against) {
            won--;
        } else if (gfor === against) {
            drawn--;
        } else {
            lost--;
        }
    };
    this.getPlayed = function () {
        return played;
    }
    this.getPoints = function () {
        return 3 * won + drawn;
    };
    this.getWon = function () {
        return won;
    };
    this.getDrawn = function () {
        return drawn;
    };
    this.getLost = function () {
        return lost;
    };
    this.getGoalsFor = function () {
        return goalsFor;
    };
    this.getGoalsAgainst = function () {
        return goalsAgainst;
    };
    this.getGoalDifference = function () {
        return goalsFor - goalsAgainst;
    };
    this.reset = function () {
        var savedState = [played, won, drawn, lost, goalsFor, goalsAgainst];
        played = won = drawn = lost = goalsFor = goalsAgainst = 0;
        return savedState;
    }
    this.loadSave = function(save) {
        played = save[0];
        won = save[1];
        drawn = save[2];
        lost = save[3];
        goalsFor = save[4];
        goalsAgainst = save[5];
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
            this.drawTable();
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
    this.drawTable = function () {
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
        this.rankAll();
        for (var i = 0; i < teams.length; i++) {
            html += '<tr id="row'+teams[i].id+'">'+
                       '<td>'+teams[i].countryName+'</td>'+
                       '<td>'+teams[i].getPlayed()+'</td>'+
                       '<td>'+teams[i].getWon()+'</td>'+
                       '<td>'+teams[i].getDrawn()+'</td>'+
                       '<td>'+teams[i].getLost()+'</td>'+
                       '<td>'+teams[i].getGoalsFor()+'</td>'+
                       '<td>'+teams[i].getGoalsAgainst()+'</td>'+
                       '<td>'+teams[i].getGoalDifference()+'</td>'+
                       '<td>'+teams[i].getPoints()+'</td>'+
                   '</tr>';
        }
        html += "</table>";
        $("#"+this.id+" .groupTable").html(html);
    };
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
