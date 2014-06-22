var Brazil2014 = (function (Tournament) {
	Tournament.Group = function (id, teams) {
		this.id = String.fromCharCode(id+65);
		//this.teams = teams;
		var matches = [];
		matches[0] = new Tournament.Match(2 * id + 1, teams[0], teams[1]);
		matches[1] = new Tournament.Match(2 * id + 2, teams[2], teams[3]);
		matches[2] = new Tournament.Match(16 + 2 * id + 1, teams[0], teams[2]);
		matches[3] = new Tournament.Match(16 + 2 * id + 2, teams[3], teams[1]);
		matches[4] = new Tournament.Match(32 + 2 * id + 1, teams[3], teams[0]);
		matches[5] = new Tournament.Match(32 + 2 * id + 2, teams[1], teams[2]);
		this.play = function (matchIndex, goals1, goals2) {
		    if (matches[matchIndex].play(goals1, goals2)) {
		        this.reorderTable();
		        //alert("Current table: "+teams[0].countryName+teams[0].getStat("points")+teams[1].countryName+teams[1].getStat("points")+teams[2].countryName+teams[2].getStat("points")+teams[3].countryName+teams[3].getStat("points"));
		        this.colorRows();
		    }
		};
		this.played = function () {
			var matchesPlayed = 0;
			for (var j = 0; j < matches.length; j++) {
				if (matches[j].played()) {
					matchesPlayed++;
				}
			}
			return matchesPlayed;
		};
		this.getScoreString = function () {
			var scoreString = '';
			for (var j = 0; j < matches.length; j++) {
				scoreString += matches[j].getScore(1) + matches[j].getScore(2);
			}
			return scoreString;
		}
		this.load = function (scoreString) {
			console.log("Group "+this.id+" is getting "+scoreString)
			for (var j = 0; j < matches.length; j++) {
				var score1 = (scoreString.charAt(j*2) !== '-') ? scoreString.charAt(j*2) : '';
		   		var score2 = (scoreString.charAt(j*2+1) !== '-') ? scoreString.charAt(j*2+1) : '';
				$("#"+this.id+" .match"+j+" .score1").val(score1);
				$("#"+this.id+" .match"+j+" .score2").val(score2);
				matches[j].play(score1, score2);
			}
			this.reorderTable();
			this.colorRows();
		};
		this.rankAll = function () {
		    teams.sort(Tournament.groupUtils.teamCompare);
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
		            var correctOrder = Tournament.groupUtils.advancedTiebreak(minigroup, matches);
		            for (var k = 0; k < minigroup.length; k++) {
		                teams[i+k] = minigroup[k];
		                teams[i+k].loadSave(saves[teams[i+k].id]);
		            }
		            i = i+minigroup.length-1;
		        }
		    }
		    return teams;
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
					console.log("2 or fewer games played, not evaluating.");
					throw this.played();
				}
				if (this.played() === 6) {//If all games have been played, the top 2 teams have clinched and the bottom 2 are eliminated.
					console.log("All games played, clinching top 2 and eliminating bottom two.");
					teams[0].clinch();
					teams[1].clinch();
					teams[2].eliminate();
					teams[3].eliminate();
					throw this.played();
				}
				var teamsClinched = 0;
				var teamsEliminated = 0;
				var teamsKnownStatus = 0;
				for (var i = 0; i < teams.length; i++) {
					if (teams[i].getStat("points") >= 7) { //7 points clinches. (There are only 18 points up for grabs.)
						console.log("Clinching "+teams[i].countryName+" for having 7 or more points");
						teams[i].clinch();
						teamsClinched++;
						teamsKnownStatus++;
					}
					else if (teams[i].getStat("played") === 3 && teams[i].getStat("points") <= 1) {
						console.log("Eliminating "+teams[i].countryName+" for finishing with 1 or fewer points");
						teams[i].eliminate(); //Finishing with 2 points eliminates.
						teamsEliminated++;
						teamsKnownStatus++;
					}
					else if (teams[i].getStat("played") <= 1) { //You cannot be eliminated, or clinch, after only one match.
						console.log(teams[i].countryName+" has played only one game, marking status known");
						teams[i].isEliminated = -1;
						teams[i].hasClinched = -1;
						teamsKnownStatus++;
					}
					else if (teams[i].getStat("played") === 2) {
						if (teams[i].getStat("points") <= 3) {
							console.log(teams[i].countryName+" has at most 3 points through 2 matches so has not clinched");
							teams[i].hasClinched = -1; //If you've only scored 3 points through 2 matches, you haven't clinched.	    				
						}
						if (teams[i].getStat("points") >= 3) {
							console.log(teams[i].countryName+" has at least 3 points through 2 matches so is not eliminated");
							teams[i].isEliminated = -1; //If you've scored at least 3 points through 2 matches, you aren't eliminated.
						}
						if (teams[i].isEliminated == -1 && teams[i].hasClinched == -1) {
							teamsKnownStatus++;
						}
					}
				}
				/* This is where it gets complicated. To decide the status of the remaining teams, we simulate the remaining matches.
				 * To decide whether a team is eliminated, we make the sims as favorable to that team as possible and see if they can
			   	 * finish in 1st or 2nd.  To determine whether a team has clinched, we make the sims as unfavorable to that team as
			   	 * possible and see if they can finish in 3rd or 4th. More info is in groupStatus.js.
			   	 */
			   	//alert("Reading this line");
				for (var i = teams.length-1; i >= 0; i--) {
					console.log("Evaluating team: "+teams[i].countryName+", which has "+teams[i].getStat("points")+" points");
					if (!teams[i].knownStatus()) {
						var matchesLeft = [];
						//var leagueTable = teams.slice(0);
						for (var j = 0; j < matches.length; j++) {
							if (!matches[j].played()) {
								if (matches[j].team1.id === teams[i].id || matches[j].team2.id === teams[i].id) {
									matchesLeft.unshift(matches[j]);	//when we pass to helper function, we want to sim
								}										//the team in question's matches first.
								else {
									matchesLeft.push(matches[j]);
								}
							}
						}
						//console.log("The team at leagueTable index i is: "+leagueTable[i].countryName);
						if (teams[i].isEliminated !== -1 && Tournament.groupUtils.determineIfEliminated(i, matchesLeft, teams)) {
							//teams[i].eliminate();
							console.log("Match sims have determined that "+teams[i].countryName+" is eliminated.");
							teamsEliminated++;
						}
						//console.log("The team at leagueTable index i is: "+leagueTable[i].countryName);
						else if (teams[i].hasClinched !== -1 && Tournament.groupUtils.determineIfClinched(i, matchesLeft, teams)) {
							console.log("Match sims have determined that "+teams[i].countryName+" has clinched.");
							teamsClinched++;
						}
						else {
							teams[i].isEliminated = -1;
							teams[i].hasClinched = -1;
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
					for (var i = 0; i < teams.length; i++) {
						if (!teams[i].knownStatus()) {
							console.log("2 teams eliminated, clinching remainder (including "+teams[i].countryName+")");
							teams[i].clinch();
						}
					}
				}
				else if (e === "eliminateRest") {
					for (var i = 0; i < teams.length; i++) {
						if (!teams[i].knownStatus()) {
							console.log("2 teams clinched, eliminating remainder (including "+teams[i].countryName+")");
							teams[i].eliminate();
						}
					}
				}
			}
			//Finally, after having decided the status of every team, color the rows.
			finally {
				for (var i = 0; i < teams.length; i++) {
					if (teams[i].hasClinched === 1) {
						//alert("I got to here too!");
						$("#"+this.id+" .groupTable #row"+teams[i].id+" div").removeClass("eliminated");
						$("#"+this.id+" .groupTable #row"+teams[i].id+" div").addClass("clinched");
					}
					else if (teams[i].isEliminated === 1) {
						$("#"+this.id+" .groupTable #row"+teams[i].id+" div").removeClass("clinched");
						$("#"+this.id+" .groupTable #row"+teams[i].id+" div").addClass("eliminated");
					}
					else {
						$("#"+this.id+" .groupTable #row"+teams[i].id+" div").removeClass("clinched");
						$("#"+this.id+" .groupTable #row"+teams[i].id+" div").removeClass("eliminated");
					}
				}
			}
		};
		
		/* drawTab, drawTable, drawMatches
		 * Called by Tournament.init(), create the group stage UI for this group.
		 */
		
		this.drawTab = function() {
			var groupTab = '<li><a href="#'+this.id+'">'+
								'<img src="flags/'+teams[0].id+'.png">'+
								'<img src="flags/'+teams[1].id+'.png">'+
								this.id+
								'<img src="flags/'+teams[2].id+'.png">'+
								'<img src="flags/'+teams[3].id+'.png">'+
						   '</a></li>';
			$('.tab-links').append(groupTab);
			var groupContent = '<div id="'+this.id+'" class="tab">'+
										'<div class="matches"></div>'+
									'<div class="groupTable"></div>'+
						   		'</div>';
			$('.tab-content').append(groupContent);
		};
		this.drawTable = function () {
			//this.rankAll();
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
	};
	
	return Tournament;
}(Brazil2014));
