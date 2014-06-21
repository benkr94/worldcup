var Brazil2014 = (function() {
	
	this.groups = [];
	
	this.load = function () {
		var scores = prompt("Enter score string","");
		while (scores.length != 96) {
			scores = prompt("Enter a better score string","");
		}
		for (var g = 0; g < groups.length; g++) {
			Tournament.groups[g].load(scores.substring(g*12, g*12+12));
		}
	};
	
	this.init = function (countryNames, matchDetails) {
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
			for (var i=0; i < 4; i++) {
			    teams[i] = new this.Team(4*g+i, countryNames[4*g+i]);
			}
			this.groups[g] = new this.Group(g, teams);
		}
		for (var g = 0; g < 8; g++) {
			this.groups[g].drawTab();
			this.groups[g].drawMatches();
			this.groups[g].drawTable();
		}		
	};

	return this;
}());
