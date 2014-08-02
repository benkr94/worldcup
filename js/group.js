/* group.js
 *  Expands the Tournament module with a constructor for objects representing groups.
 * 
 * Attributes (private):
 *  idChar: The letter used to refer to the group. World Cup groups are named from A to H.
 *  teams: An array of Team objects. The teams in this group, kept in rank order.
 *  matches: An array of Match objects. The matches played between the teams in this group during the group stage of the tournament.
 * Methods:
 *  drawTab, drawMatches, drawTable: Create the elements in the DOM for the tab to select the group, the matches with text boxes for
 *    the user to set the scores, and the group table. Called by Tournament.init()
 *  updateTimes: Updates the view of the matches to show times in the user's time zone.
 *  getScoreString: Gets a string with the scores of the matches in this group, to be added to the other groups' and encoded/
 *    compressed into a string from which the entire tournament can be loaded.
 *  submitAdvancers: Puts the top two teams of this group into the array of teams advancing to the knockout stage, to be passed to the
 *    Bracket object.
 *  load: Loads the scores for this group from the given string.
 *  play: Sets one of the matches to have a certain result. Calls that match's "play" method, then updates the table.
 *  updateTable (private): called by the load and play methods. Decomposed into:
 *    rankAll: Sorts the teams array by performance according to the Cup rules.
 *    reorderTable: Animates the rows in the on-screen table to keep them in rank order.
 *    colorRows: Colors table rows green if teams have clinched or red if they have been eliminated. More info below.
 */

var Brazil2014 = (function (Tournament) {
    Tournament.Group = function (id, teams, matchDetails) {
        var idChar = String.fromCharCode(id+65);
        var matches = [];
        matches[0] = new Tournament.Match(2 * id + 1, teams[0], teams[1], matchDetails[0][0], matchDetails[0][1]);
        matches[1] = new Tournament.Match(2 * id + 2, teams[2], teams[3], matchDetails[1][0], matchDetails[1][1]);
        matches[2] = new Tournament.Match(16 + 2 * id + 1, teams[0], teams[2], matchDetails[2][0], matchDetails[2][1]);
        matches[3] = new Tournament.Match(16 + 2 * id + 2, teams[3], teams[1], matchDetails[3][0], matchDetails[3][1]);
        matches[4] = new Tournament.Match(32 + 2 * id + 1, teams[3], teams[0], matchDetails[4][0], matchDetails[4][1]);
        matches[5] = new Tournament.Match(32 + 2 * id + 2, teams[1], teams[2], matchDetails[5][0], matchDetails[5][1]);
        function matchTimeCompare(a, b) {
            return a.time - b.time;
        }
        matches.sort(matchTimeCompare);
        
        this.drawTab = function() {
            var groupTab = '<div><a href="#'+idChar+'">'+
                                '<div class="leftflags">'+
                                    '<img src="images/flags/'+teams[0].id+'.png"><br>'+
                                    '<img src="images/flags/'+teams[1].id+'.png">'+
                                '</div>'+
                                idChar+
                                '<div class="rightflags">'+
                                    '<img src="images/flags/'+teams[2].id+'.png"><br>'+
                                    '<img src="images/flags/'+teams[3].id+'.png"><br>'+
                                '</div>'+
                           '</a></div>';
            $('#group-tab-links').append(groupTab);
            var groupContent = '<div id="'+idChar+'" class="under-tab">'+
                                        '<div class="matches"></div>'+
                                    '<div class="groupTable"></div>'+
                                   '</div>';
            $('#group-tab-content').append(groupContent);
        };
        
        this.drawTable = function () {
            var statKeys = ["played", "won", "drawn", "lost", "goalsFor", "goalsAgainst", "goalDifference", "points"]; //avoiding forEach for the benefit of IE8 users
            var html = '<table cellspacing="0"><tr>'+
                           '<th width="130">Team</th>'+
                           '<th width="28"><abbr title="Played">Pld</abbr></th>'+
                           '<th width="28"><abbr title="Won">W</abbr></th>'+
                           '<th width="28"><abbr title="Drawn">D</abbr></th>'+
                           '<th width="28"><abbr title="Lost">L</abbr></th>'+
                           '<th width="28"><abbr title="Goals For">GF</abbr></th>'+
                           '<th width="28"><abbr title="Goals Against">GA</abbr></th>'+
                           '<th width="28"><abbr title="Goal Difference">GD</abbr></th>'+
                           '<th width="28"><abbr title="Points">Pts</abbr></th>'+
                       '</tr>';
            for (var t = 0; t < teams.length; t++) {
                html += '<tr id="row'+teams[t].id+'">'+
                           '<td><div class="countryName"><div class="heightfix"></div><div class="content">'+teams[t].flagLeft()+'</div></div></td>'; //wrapping div necessary for animations, which cannot work on table rows or cells
                for (var s = 0; s < statKeys.length; s++) {
                    html+= '<td><div class="'+statKeys[s]+' stat"><div class="heightfix"></div><div class="content">'+teams[t].getStat(statKeys[s])+'</div></div></td>';
                }
                html += '</tr>';
            }
            html += "</table>";
            $("#"+idChar+" .groupTable").html(html);
        };
        
        this.drawMatches = function () {
            var html = '';
            for (var m = 0; m < matches.length; m++) {
                html += matches[m].draw();
            }
            $("#"+idChar+" .matches").html(html);
        };
        
        this.updateTimes = function (offset) {
            for (var m = 0; m < matches.length; m++) {
                matches[m].updateTime(offset);
            }
        };
        
        this.submitAdvancers = function (advanceList) {
            for (var t = 0; t < 2; t++) {
                var matchIndex = Math.floor(id/2) + 4 * Math.abs((t - (id % 2)));
                if (teams[t].getStat("played") === 0) {
                    advanceList[matchIndex*2+t] = {id: null};
                }
                else {
                    advanceList[matchIndex*2+t] = teams[t];
                }
            }
        };

        this.getScoreString = function () {
            var scoreString = '';
            if (id % 2 === 0) {
                for (var m = 0; m < matches.length; m++) {
                    scoreString += matches[m].getScore(1) + matches[m].getScore(2);
                }
            }
            else {	//reverse score string for every other group. Since scores are likely to be filled in chronologically, this will
                for (var m = matches.length-1; m >= 0; m--) { //put most blanks next to each other for a shorter compressed string.
                    scoreString += matches[m].getScore(2) + matches[m].getScore(1);
                }
            }
            return scoreString;
        };
        
        this.load = function (scoreString) {
            if (id % 2 === 1) {
                scoreString = scoreString.split('').reverse().join('');
            }
            for (var m = 0; m < matches.length; m++) {
                var score1 = (scoreString.charAt(m*2) !== '-') ? scoreString.charAt(m*2) : '';
                   var score2 = (scoreString.charAt(m*2+1) !== '-') ? scoreString.charAt(m*2+1) : '';
                $("#"+idChar+" #match"+matches[m].id+" .score1").val(score1);
                $("#"+idChar+" #match"+matches[m].id+" .score2").val(score2);
                matches[m].play(score1, score2);
            }
            updateTable();
        };
        
        this.play = function (matchIndex, goals1, goals2) {
            if (matches[matchIndex].play(goals1, goals2)) {
                updateTable();
            }
        };
        
        function updateTable() {
            rankAll();
            reorderTable();
            colorRows();
        };
        
        /* rankAll
         * First tries to sort the teams array just using teamCompare, which places teams with more points above those with less and
         * uses goalDifference and then goalsFor as tiebreakers. If teamCompare flags teams as requiring advanced tiebreak, the teams
         * tied at a certain point total have their stats reset to 0 and are then passed to the advancedTiebreak method, which 
         * compares them based only on matches among themselves. Once advancedTiebreak returns their proper order, their stats are 
         * restored.
         */
        function rankAll() {
            teams.sort(Tournament.groupUtils.teamCompare);
            for (var t = 0; t < teams.length; t++) {
                if (teams[t].requiresAdvancedTiebreak !== -1) {
                    saves = {};
                    saves[teams[t].id] = teams[t].reset();
                    minigroup = [teams[t]];
                    for (var u = t+1; u < teams.length; u++) {
                        if (teams[u].requiresAdvancedTiebreak === teams[t].requiresAdvancedTiebreak) {
                            saves[teams[u].id] = teams[u].reset();
                            minigroup.push(teams[u]);
                        }
                        else {
                            break;
                        }
                    }
                    var correctOrder = Tournament.groupUtils.advancedTiebreak(minigroup, matches);
                    for (var v = 0; v < minigroup.length; v++) {
                        teams[t+v] = minigroup[v];
                        teams[t+v].loadStats(saves[teams[t+v].id]);
                    }
                    t = t+minigroup.length-1;
                }
            }
            return teams;
        };
        
        function reorderTable() {
            var statKeys = ["played", "won", "drawn", "lost", "goalsFor", "goalsAgainst", "goalDifference", "points"];
               for (var t = 0; t < teams.length; t++) {
                for (var s = 0; s < statKeys.length; s++) {
                    $("#"+idChar+" .groupTable #row"+teams[t].id+" ."+statKeys[s]+" .content").text(teams[t].getStat(statKeys[s]));
                }
            }
            for (var t = 0; t < teams.length; t++) { //two iterations over same array intentional; want to change stats before beginning animation
                var rankChange = t - teams[t].prevRank;
                $("#"+idChar+" .groupTable #row"+teams[t].id+" td > div").css('z-index',rankChange);
                   $("#"+idChar+" .groupTable #row"+teams[t].id+" td > div").animate({"top":"+="+(rankChange*31)+"px"});
                   teams[t].prevRank = t;
            }
        };
        
        /* colorRows
         * Colors the table green for teams that have clinched a berth in the knockout round, red for those that have been eliminated.
         * Uses helper functions in groupUtils.js. I couldn't come up with a nice, graph-theoretic proof, so I just tried a bunch of
         * scenarios and coded the heuristics that I, as a human, used to determine who had clinched and who was eliminated.
         * Try/catch/finally statements are primarily used as general control flow statements, to make skipping to the end easy.
         */
        function colorRows () {
            var matchesPlayed = 0;
            for (var m = 0; m < matches.length; m++) {
                if (matches[m].played()) {
                    matchesPlayed++;
                }
            }
            for (var t = 0; t < teams.length; t++) {
                teams[t].resetGroupStatus();
            }
            try {
                if (matchesPlayed <= 2) { //If 2 or fewer games have been played, no team can have clinched or been eliminated.
                    throw matchesPlayed;
                }
                if (matchesPlayed === 6) {//If all games have been played, the top 2 teams have clinched and the bottom 2 are eliminated.
                    teams[0].clinch();
                    teams[1].clinch();
                    teams[2].eliminate();
                    teams[3].eliminate();
                    throw matchesPlayed;
                }
                var teamsClinched = 0;
                var teamsEliminated = 0;
                var teamsKnownStatus = 0;
                for (var t = 0; t < teams.length; t++) {
                    if (teams[t].getStat("points") >= 7) { //7 points clinches. (There are only 18 points up for grabs.)
                        teams[t].clinch();
                        teamsClinched++;
                        teamsKnownStatus++;
                    }
                    else if (teams[t].getStat("played") === 3 && teams[t].getStat("points") <= 1) {
                        teams[t].eliminate(); //Finishing with 2 points eliminates.
                        teamsEliminated++;
                        teamsKnownStatus++;
                    }
                    else if (teams[t].getStat("played") <= 1) { //You cannot be eliminated, or clinch, after only one match.
                        teams[t].isEliminated = -1;
                        teams[t].hasClinched = -1;
                        teamsKnownStatus++;
                    }
                    else if (teams[t].getStat("played") === 2) {
                        if (teams[t].getStat("points") <= 3) {
                            teams[t].hasClinched = -1; //If you've only scored 3 points through 2 matches, you haven't clinched.	    				
                        }
                        if (teams[t].getStat("points") >= 3) {
                            teams[t].isEliminated = -1; //If you've scored at least 3 points through 2 matches, you aren't eliminated.
                        }
                        if (teams[t].isEliminated == -1 && teams[t].hasClinched == -1) {
                            teamsKnownStatus++;
                        }
                    }
                }
                /* This is where it gets complicated. To decide the status of the remaining teams, we simulate the remaining matches.
                 * To decide whether a team is eliminated, we make the sims as favorable to that team as possible and see if they can
                 * finish in 1st or 2nd.  To determine whether a team has clinched, we make the sims as unfavorable to that team as
                 * possible and see if they can finish in 3rd or 4th. More info is in groupUtils.js.
                 */
                for (var t = teams.length-1; t >= 0; t--) {
                    if (!teams[t].knownStatus()) {
                        var matchesLeft = [];
                        for (var m = 0; m < matches.length; m++) {
                            if (!matches[m].played()) {
                                if (matches[m].team1.id === teams[t].id || matches[m].team2.id === teams[t].id) {
                                    matchesLeft.unshift(matches[m]);	//when we pass to helper function, we want to sim
                                }										//the team in question's matches first.
                                else {
                                    matchesLeft.push(matches[m]);
                                }
                            }
                        }
                        if (teams[t].isEliminated !== -1 && Tournament.groupUtils.determineIfEliminated(t, matchesLeft, teams)) {
                            teams[t].eliminate();
                            teamsEliminated++;
                        }
                        else if (teams[t].hasClinched !== -1 && Tournament.groupUtils.determineIfClinched(t, matchesLeft, teams)) {
                            teams[t].clinch();
                            teamsClinched++;
                        }
                        else {
                            teams[t].isEliminated = -1;
                            teams[t].hasClinched = -1;
                        }
                        teamsKnownStatus++;
                    }
                    if (teamsEliminated === 2) {
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
                //alert(e);
                if (e === "clinchRest") {	//If two teams are eliminated, the other two have clinched.
                    for (var t = 0; t < teams.length; t++) {
                        if (!teams[t].knownStatus()) {
                            teams[t].clinch();
                        }
                    }
                }
                else if (e === "eliminateRest") {
                    for (var t = 0; t < teams.length; t++) {
                        if (!teams[t].knownStatus()) {
                            teams[t].eliminate();
                        }
                    }
                }
                else if (e instanceof Error){
                    alert("There was a problem running clinching/elimination scenarios: "+e.message+". Please take a screenshot and email administrator@fantagraphy.net.");
                }
            }
            //Finally, after having decided the status of every team, color the rows.
            finally {
                for (var t = 0; t < teams.length; t++) {
                    if (teams[t].hasClinched === 1) {
                        $("#"+idChar+" .groupTable #row"+teams[t].id+" div").removeClass("eliminated");
                        $("#"+idChar+" .groupTable #row"+teams[t].id+" div").addClass("clinched");
                    }
                    else if (teams[t].isEliminated === 1) {
                        $("#"+idChar+" .groupTable #row"+teams[t].id+" div").removeClass("clinched");
                        $("#"+idChar+" .groupTable #row"+teams[t].id+" div").addClass("eliminated");
                    }
                    else {
                        $("#"+idChar+" .groupTable #row"+teams[t].id+" div").removeClass("clinched");
                        $("#"+idChar+" .groupTable #row"+teams[t].id+" div").removeClass("eliminated");
                    }
                }
            }
        };
        
    };
    
    return Tournament;
}(Brazil2014));
