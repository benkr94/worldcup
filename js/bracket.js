/* bracket.js
 * Expands Tournament module to include 2 more constructors, Bracket and Node.
 */

var Brazil2014 = (function (Tournament) {

/* Bracket
 *  model for the knockout stage of the tournament.
 * Arguments:
 *  rounds: The number of rounds in the bracket. This is 4 in the World Cup, but I wrote this more generally for re-use elsewhere
 *  matchDetails: An array whose members provide the location and time of each knockout match  
 * Attributes (private):
 *  nodeArr: A multidimensional array of Nodes. Top-level elements are arrays representing rounds of the tournament; second-level
 *    are arrays (length 2) representing matches; third-level are Nodes, each representing a competitor in a match.
 *  champion: A Node representing the champion of the tournament. Unlike the nodes in nodeArr, the champion has no opponent.
 *  times: The times of the matches, in UTC.
 * Methods:
 *  setFirstTeams: Given an array of teams, populates the first round of the bracket.
 *  nodeClicked: Allows clicking on a team in a knockout match to toggle whether it has won that match.
 *  updateTimes: Updates the view with the match times in the user's selected time zone.
 *  getWinnerString: returns a string that uniquely identifies the user's choices of match winners. (15-character string; compressed
 *    to 4 in encodeUtils)
 *  load: Given a winnerString, advances teams through the Bracket in accordance with the user's chosen winners.
 *  clear: Sets all matches as unplayed. Teams are filled in for first round, all other Nodes are empty.
 */
    Tournament.Bracket = function (rounds, matchDetails) {
        var nodeArr = [];							//Initialize array representing the entire bracket;
        for (var r = 0; r < rounds; r++) {  		
            nodeArr.push(new Array(Math.pow(2, rounds-r-1)));	//Initialize rounds to contain the appropriate no. of matches;
        }
        for (var r = 0; r < rounds; r++) {
            for (var m = 0; m < nodeArr[r].length; m++)
            nodeArr[r][m] = new Array(2);			//Initialize matches to contain 2 teams.
        }
        var champion = new Node(rounds, 0);
        var next;
        for (var r = rounds - 1; r >= 0; r--) {
            for (var m = 0; m < nodeArr[r].length; m++) {
                if (r === rounds - 1) {
                    next = champion; 
                }
                else {
                    next = nodeArr[r+1][Math.floor(m/2)][m%2];
                }
                nodeArr[r][m][0] = new Node(next, 0);
                nodeArr[r][m][1] = new Node(next, 1);
            }
        }
        var times = [];
        for (var i = 0; i < matchDetails.length; i++) { //initial setting of match details.
            var time = matchDetails[i][1];
            var matchTime = new Date(Date.UTC(2014,time[0],time[1],time[2],time[3]));
            times.push(matchTime);
            $('#Bracket .details').eq(i).html('<div class="kolocation">'+matchDetails[i][0]+',&nbsp;</div>'+'<div class="kotime"></div>');
        }
        
        this.setFirstTeams = function (teams) {
            for (var t = 0; t < teams.length; t++) {
                nodeArr[0][Math.floor(t/2)][t%2].setTeam(teams[t]);
            }
        };
        
        this.nodeClicked = function (r, m, t) {
            var node = nodeArr[r][m][t];
            var opponent = nodeArr[r][m][1-t];
            if (node.hasWon()) {
                node.unWin();
            }
            else {
                opponent.unWin();
                node.win();
            }
        };
        
        this.getWinnerString = function () {
            var winnerString = '';
            for (var r = nodeArr.length-1; r >= 0; r--) {
                for (var m = nodeArr[r].length-1; m >= 0; m--) {
                    if (nodeArr[r][m][0].hasWon()) {
                        winnerString += 1;
                    }
                    else if (nodeArr[r][m][1].hasWon()) {
                        winnerString += 2;
                    }
                    else {
                        winnerString += 0;		//want this as zero so mostly-unset brackets have fewer characters
                    }
                }
            }
            return winnerString;
        };
        
        this.load = function (winnerString) {
            winnerString = winnerString.split('').reverse().join('');
            for (var r = 0; r < nodeArr.length; r++) {
                for (var m = 0; m < nodeArr[r].length; m++) {
                    if (winnerString.charAt(0) === "0") {
                        winnerString = winnerString.slice(1);
                        continue;
                    }
                    nodeArr[r][m][parseInt(winnerString.charAt(0))-1].win();
                    winnerString = winnerString.slice(1);
                }
            }
        };
        
        this.clear = function() {
            for (var m = 0; m < nodeArr[0].length; m++) {
                nodeArr[0][m][0].unWin();
                nodeArr[0][m][1].unWin();
            }
        };
        
        this.updateTimes = function (offset) {
            for (var i = 0; i < times.length; i++) {
                var localTime = new Date(times[i].getTime());
                localTime.setMinutes(localTime.getMinutes()+offset);
                $('#Bracket .details').eq(i).children('.kotime').text(localTime.toUTCString().split(' ').splice(1).join(' ').split(':',2).join(':').replace('2014',''));
            }
        };
    };
    
/* Node
 * Model of a space in the bracket for one of the competitors in a particular knockout stage match.
 * Arguments:
 *  next: The Node where the competitor will advance to if they win. 
 *  teamNum: either 0 (top team in the view of the bracket) or 1 (bottom team)
 * Attributes:
 *  roundNum: which round of the tournament this Node is in (zero-indexed)
 *  matchNum: which match of the round this Node is in (zero-indexed, in order from top to bottom of the view)
 *  teamNum: either 0 (top team in the part of the view representing this Node's match) or 1 (bottom team)
 *  teamAt (private): a Team object, the competitor at this Node
 *  won (private): boolean, whether the team in this Node has won. Do not want this set without updating nodes dependent upon the 
 *                 outcome of this match
 * Methods:
 *  hasWon: getter for private member 'won'
 *  win: Called when a team is chosen to win its match. Sets the 'won' variable and sets passes the team to the 'next' Node
 *  unWin: Updates the bracket when the user decides not to predict this team as the winner. (Not the same thing as saying they've
 *         lost, or the other team has won). Removes 'winner' styling from view and removes this team from future rounds
 *  setTeam: sets the private teamAt member. If there was another team here, clears that one from future rounds
 *  clearForward: Called when a team loses, to clear them from the remainder of the bracket, if the user previously had them winning
 *  updateView: puts the teamAt's name and flag in the team-cell (see bracket.css) representing this node,
 *              and adds additional styling if 'won' is true
 */

    Tournament.Node = function(next, teamNum) {
        if (typeof next === "number") { //this condition is matched by the final match
            this.roundNum = next;
            this.matchNum = 0;
            this.next = null;
        }
        else {
            this.roundNum = next.roundNum - 1;
            this.matchNum = 2*next.matchNum + next.teamNum;
            this.next = next;
        }
        this.teamNum = teamNum;
        var teamAt = {id: null};
        var won = false;
        
        this.hasWon = function () {
            return won;
        };
        
        this.win = function () {
            if (teamAt.id !== null) {
                won = true;
            }
            if (this.next !== null) {
                this.next.setTeam(teamAt);
            }
            this.updateView();
        };
        
        this.unWin = function () {
            won = false;
            if (this.next !== null) {
                this.next.clearForward(teamAt);
            }
            this.updateView();
        };
        
        this.setTeam = function (team) {
            if (teamAt.id !== team.id) {
                if (this.next !== null) {
                    this.next.clearForward(teamAt);
                }
                won = false;
                teamAt = team;
                this.updateView();
            }
        };
        
        this.clearForward = function (team) {
            if (teamAt.id === team.id) {
                won = false;
                this.setTeam({id: null});
            }
        };
        
        this.updateView = function () {
            if (this.next === null) {		//condition matched by champion
                if (teamAt.id === null) {
                    $('.champion').hide();
                }
                else {
                    $('.champion').css('display','inline-block');
                    $('.champion .flag').attr('src', 'images/bigflags/'+teamAt.id+'.png');
                    $('.champion .countryName').text(teamAt.countryName.replace("& Herz.","and Herzegovina"));	//Font doesn't have &
                }
            }
            else {
                var cellString = '#r'+this.roundNum+'-m'+this.matchNum+'-t'+this.teamNum;
                if (teamAt.id === null) {
                    $(cellString).html('&#160;&#160;');
                }
                else {
                    $(cellString).html(teamAt.flagLeft());
                }
                if (won) {
                    $(cellString).addClass('winner');
                }
                else {
                    $(cellString).removeClass('winner');
                }
            }
        };
        
    };
    
    return Tournament;
}(Brazil2014));
