var Brazil2014 = (function (Tournament) {
	Tournament.Bracket = function (rounds) {
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
				console.log("Creating nodes for "+r+"-"+m);
				nodeArr[r][m][0] = new Node(next, 0);
				nodeArr[r][m][1] = new Node(next, 1);
			}
		}
		/*this.setTeams = function (teams) {
			if (teams.length !== 2^(this.rounds) {
				console.log("Invalid number of teams supplied to bracket");
				return false;
			}
			for (var i = 0; i < teams.length; i++) {
				nodeArr[0][floor(i/2)][i%2].setTeam(teams[i]);
			}
		}*/ //Constructing the teams array would be wasteful due to weird ordering in bracket; instead, set one-by-one in main
		this.clear = function() {
			for (var m = 0; m < nodeArr[1].length; i++) {
				nodeArr[1][m][0].setTeam(null);
				nodeArr[1][m][1].setTeam(null);
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
		var teamAt = null;
		var won = false;
		this.clearForward = function (team) {
			if (this.next === null) {
				return false;
			}
			won = false;
			if (this.next.teamAt.id === team.id) {
				this.next.setTeam(null);
			}
		};
		this.win = function () {
			if (this.next === null) {
				return false;
			}
			won = true;
			this.next.setTeam(this.teamAt);
			this.updateView();
		};
		this.setTeam = function (team) {
			if (this.teamAt.id !== team.id) {
				this.clearForward(this.teamAt);
				teamAt = team;
				this.updateView();
			}
		};
		this.updateView = function () {
			var cellString = this.roundNum+'-'+this.matchNum+'-'+this.teamNum;
			$('#'+cellString).html('<img src="flags/'+this.teamAt.id+'.png">'+this.teamAt.countryName);
			if (this.won) {
				$('#'+cellString).addClass('won');
			}
			else {
				$('#'+cellString).removeClass('won');
			}
		}
	};
	
	return Tournament;
}(Brazil2014));
