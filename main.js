var Brazil2014 = (function() {
	
	this.groups = [];
	this.realScores = '';
	
	this.save = function() {
		var scoreString = '';
		for (var g = 0; g < this.groups.length; g++) {
			scoreString += this.groups[g].getScoreString();
		}
		//console.log(scoreString);
	}
	
	this.load = function (scoreString) {
		if (scoreString === '') { 
			scoreString = prompt("Enter score string","");
			while (scoreString.length != 96) { //not moving this to the outside; this is placeholder version of function
				scoreString = prompt("Enter a better score string","");
			}
		}
		for (var g = 0; g < groups.length; g++) {
			this.groups[g].load(scoreString.substring(g*12, g*12+12));
		}
	};

	
	this.init = function (countryNames, matchDetails, realScores) {
		if (countryNames.length !== 32) {
			console.log("ERROR: Wrong number of teams for constructing World Cup tournament");
			return false;
		}
		if (matchDetails.length !== 48) {
			console.log("ERROR: Wrong number of match details for constructing World Cup tournament");
			return false;
		}
		for (var g=0; g<8; g++) {
			var teams = [];
			var groupMatchDetails = [];
			groupMatchDetails.push(matchDetails[2*g]);
			groupMatchDetails.push(matchDetails[2*g+1]);
			groupMatchDetails.push(matchDetails[16+2*g]);
			groupMatchDetails.push(matchDetails[16+2*g+1]);
			groupMatchDetails.push(matchDetails[32+2*g]);
			groupMatchDetails.push(matchDetails[32+2*g+1]);
			for (var i=0; i < 4; i++) {
			    teams[i] = new this.Team(4*g+i, countryNames[4*g+i]);
			}
			this.groups[g] = new this.Group(g, teams, groupMatchDetails);
		}
		this.realScores = realScores;
		for (var g = 0; g < 8; g++) {
			this.groups[g].drawTab();
			this.groups[g].drawMatches();
			this.groups[g].drawTable();
			this.groups[g].load(realScores.substring(g*12, g*12+12));
		}
		//console.log(this.Bracket);
		this.knockout = new this.Bracket(4);
	};
	
	this.populateBracket = function () {
		for (var g = 0; g < 8; g++) {
			for (var i = 0; i < 2; i++) {
				var matchIndex = Math.floor(g/2) + 4 * Math.abs((i - (g % 2)));
				//console.log("matchIndex is "+matchIndex);
				this.knockout.nodeArr[0][matchIndex][i].setTeam(groups[g].getTeam(i));
			}
		}
	};

	return this;
}());
