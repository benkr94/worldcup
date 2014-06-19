function Tournament(teamNames, matchDetails) {
	if (teamNames.length !== 32) {
		console.log("ERROR: Wrong number of teams for constructing World Cup tournament");
		return false;
	}
	if (matchDetails.length !== 48) {
		console.log("ERROR: Wrong number of match details for constructing World Cup tournament");
		return false;
	}
	this.groups = [];
	for (var group=0; group<8; group++) {
    	var teams = [];
    	for (var i=0; i < 4; i++) {
    	    teams[i] = new Team(4*group+i, countrynames[4*group+i]);
    	}
    	this.groups[group] = new Group(group, teams);
	}
	this.load = function () {
		var scores = prompt("Enter score string","");
		while (scores.length != 96) {
			scores = prompt("Enter a better score string","");
		}
		for (var g = 0; g < groups.length; g++) {
			this.groups[g].load(scores.substring(g*12, g*12+12));
		}
	};
	this.populateBracket = function () {
	
	
	};
	
}


NAMES = ["Brazil", "Croatia", "Mexico", "Cameroon", "Spain", "Netherlands", "Chile", "Australia", "Colombia", "Greece", "Ivory Coast", "Japan", "Uruguay", "Costa Rica", "England", "Italy", "Switzerland", "Ecuador", "France", "Honduras", "Argentina", "Bosnia & Herz.", "Iran", "Nigeria", "Germany", "Portugal", "Ghana", "United States", "Belgium", "Algeria", "Russia", "Korea Republic"];
MATCH_DETAILS = new Array(48); //will build this out later

Brazil2014 = new Tournament(NAMES, MATCH_DETAILS);
