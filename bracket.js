var Brazil2014 = (function (Tournament) {
	Tournament.Bracket = function (rounds, matchDetails) {
		this.rounds = rounds;
		var nodeArr = [];							//Initialize array representing the entire bracket;
		for (var r = 0; r < rounds; r++) {  		
			nodeArr.push(new Array(Math.pow(2, rounds-r-1)));//Initialize rounds to contain the appropriate no. of matches;
			//console.log("I have pushed an array of size "+(Math.pow(2, rounds-r-1))+" to nodeArr["+r+"]");
			//console.log("nodeArr["+r+"].length: "+nodeArr[r].length);
		}
		for (var r = 0; r < rounds; r++) {
			for (var m = 0; m < nodeArr[r].length; m++)
			nodeArr[r][m] = new Array(2);			//Initialize matches to contain 2 teams.
		}
		this.champion = new Node(rounds, 0);
		var next;
		for (var r = rounds - 1; r >= 0; r--) {
			//console.log("r is "+r+", nodeArr[r].length is "+nodeArr[r].length);
			for (var m = 0; m < nodeArr[r].length; m++) {
				if (r === rounds - 1) {
					next = this.champion; 
				}
				else {
					//console.log("I am setting next to nodeArr["+(r+1)+"]["+(Math.floor(m/2))+"]["+(m%2)+"]");
					next = nodeArr[r+1][Math.floor(m/2)][m%2];
				}
				//console.log("Creating nodes for "+r+"-"+m);
				nodeArr[r][m][0] = new Node(next, 0);
				nodeArr[r][m][1] = new Node(next, 1);
			}
		}
		var times = [];
		for (var i = 0; i < matchDetails.length; i++) {
			var time = matchDetails[i][1];
			var matchTime = new Date(Date.UTC(2014,time[0],time[1],time[2],time[3]));
			times.push(matchTime);
			$('#Bracket .details').eq(i).html('<div class="kolocation">'+matchDetails[i][0]+',&nbsp;</div>'+'<div class="kotime">'+times[i].toUTCString().split(' ').splice(1).join(' ').split(':',2).join(':').replace('2014','')+'</div>');
		}
		this.updateTimes = function (offset) {
			//console.log("Doing this.");
			for (var i = 0; i < times.length; i++) {
				var localTime = new Date(times[i].getTime());
				localTime.setMinutes(localTime.getMinutes()+offset);
				$('#Bracket .details').eq(i).children('.kotime').text(localTime.toUTCString().split(' ').splice(1).join(' ').split(':',2).join(':').replace('2014',''));
			}
		}
		this.getSaveString = function () {
			var saveString = '';
			for (var r = nodeArr.length-1; r >= 0; r--) {
				for (var m = nodeArr[r].length-1; m >= 0; m--) {
					if (nodeArr[r][m][0].hasWon()) {
						saveString += 1;
					}
					else if (nodeArr[r][m][1].hasWon()) {
						saveString += 2;
					}
					else {
						saveString += 0;		//want this as zero so mostly-unset brackets have fewer characters
					}
				}
			}
			return saveString;
		};
		this.load = function (saveString) {
			saveString = saveString.split('').reverse().join('');
			for (var r = 0; r < nodeArr.length; r++) {
				for (var m = 0; m < nodeArr[r].length; m++) {
					if (saveString.charAt(0) == 0) {
						continue;
					}
					nodeArr[r][m][parseInt(saveString.charAt(0))-1].win();
					saveString = saveString.slice(1);
				}
			}
		};
		this.clear = function() {
			for (var m = 0; m < nodeArr[0].length; m++) {
				nodeArr[0][m][0].unWin();
				nodeArr[0][m][1].unWin();
			}
		}
		this.nodeArr = nodeArr;
	};

	Tournament.Node = function(next, teamNum) {
		if (typeof next === "number") {
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
		}
		this.clearForward = function (team) {
			if (teamAt.id === team.id) {
				won = false;
				this.setTeam({id: null});
			}
		};
		this.win = function () {
			won = true;
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
		}
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
		this.updateView = function () {
			if (this.next === null) {
				if (teamAt.id === null) {
					$('.champion').hide();
				}
				else {
					$('.champion').css('display','inline-block');
					$('.champion .flag').attr('src', "bigflags/"+teamAt.id+".png");
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
