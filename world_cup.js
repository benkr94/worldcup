function Match(id, team1, team2) {
    this.id = id;
    this.team1 = team1;
    this.team2 = team2;
    var score1 = '';
    var score2 = '';
    this.played = function () {
        return (isPositiveInteger(score1) && isPositiveInteger(score2)); 
    };
    this.play = function (goals1, goals2) {
        if (isPositiveInteger(goals1) && isPositiveInteger(goals2)) {
            team1.play(goals1, goals2);
            team2.play(goals2, goals1);
        } else if (played) {
            team1.unplay(goals1, goals2);
            team2.unplay(goals2, goals1);
        }
        score1 = goals1;
        score2 = goals2;
    };
}

function Team(id, countryName) {
    this.id = id;
    this.countryName = countryName;
    this.requiresAdvancedTiebreak = -1;
    var played, won, lost, drew, goalsFor, goalsAgainst;
    played = won = lost = drew = goalsFor = goalsAgainst = 0;
    this.play = function (gfor, against) {
        played++;
        goalsFor += gfor;
        goalsAgainst += against;
        if (gfor > against) {
            won++;
        } else if (gfor === against) {
            drew++;
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
            drew--;
        } else {
            lost--;
        }
    };
    this.getPoints = function () {
        return 3 * won + drew;
    };
    this.getWon = function () {
        return won;
    };
    this.getDrew = function () {
        return drew;
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
}

function Group(id, Teams) {
    this.id = id;
    this.Teams = Teams;
    var matches = [];
    matches[0] = new Match(2 * id + 1, Teams[0], Teams[1]);
    matches[1] = new Match(2 * id + 2, Teams[2], Teams[3]);
    matches[2] = new Match(16 + 2 * id + 1, Teams[0], Teams[2]);
    matches[3] = new Match(16 + 2 * id + 2, Teams[3], Teams[1]);
    matches[4] = new Match(32 + 2 * id + 1, Teams[3], Teams[0]);
    matches[5] = new Match(32 + 2 * id + 2, Teams[1], Teams[2]);
    this.play = function (match, goals1, goals2) {
        matches[match].play(goals1, goals2);
    };
    this.unplay = function (match, goals1, goals2) {
        matches[match].unplay(goals1, goals2);
    };
    this.rankAll = function () {
        rankedTeams = this.Teams;
        rankedTeams.sort(TeamCompare);
        for (var i = 0; i < rankedTeams.length; i++) {
            if (rankedTeams[i].requiresAdvancedTiebreak !== -1) {
                Minigroup = [rankedTeam[i]];
                for (var j = i+1; j < rankedTeams.length; j++) {
                    if (j.requiresAdvancedTiebreak === i.requiresAdvancedTiebreak) {
                    Minigroup.push(rankedTeams[j]);
                    }
                    else {
                        break;
                    }
                }
                var correctOrder = AdvancedTiebreak(Minigroup);
                for (var k = 0; k < Minigroup.length; k++) {
                    rankedTeams[i+k] = Minigroup[k];
                }
                i = i+Minigroup.length-1;
            }
        }
        return rankedTeams;
    };
    this.drawTable = function () {
        var html = '';
        
    };
}

function TeamCompare(a, b) {
    if (a.getPoints() < b.getPoints()) {
        return -1;
    }
    else if (b.getPoints() < a.getPoints()) {
        return 1;
    }
    else if (a.getGoalDifference() < b.getGoalDifference()) {
        return -1;
    }
    else if (b.getGoalDifference() < a.getGoalDifference()) {
        return 1;   
    }
    else if (a.getPoints() < b.getPoints()) {
        return -1;
    }
    else if (b.getPoints() < a.getPoints()) {
        return 1;
    }
    else {
        a.requiresAdvancedTiebreak = a.getPoints();
        b.requiresAdvancedTiebreak = b.getPoints();
        return 0;
    }
}

function AdvancedTiebreak(Teams) {
    var Shadow = [];
    for (var i = 0; i < Teams.length; i++) {
        Teams[i].requiresAdvancedTiebreak = -1;
        Shadow[i] = new Team(Teams[i].id, Teams[i].countryName);
    }
    for (var m = 0; m < Matches.length; i++) {
        var matched1 = -1;
        var matched2 = -1;
        for (var t = 0; t < Teams.length; teams++) {
            if (m.team1.id === t.id) {
                matched1 = t;
            }
            if (m.team2.id === t.id) {
                matched2 = t;
            }
        }
        if (matched1 !== -1 && matched2 !== -1) {
            Shadow[matched1].play(Matches[m].score1, Matches[m].score2);
            Shadow[matched2].play(Matches[m].score2, Matches[m].score1);
        }
    }
    return Shadow.sort(teamCompare);
}

function isPositiveInteger(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && (n > 0);
}
