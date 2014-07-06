var Brazil2014 = (function() {
	
	this.groups = [];
	this.realScores = '';
	
	/* save
	 * Produces a string which the user can paste in at the "Load" screen, or put at the end of the URL, in order to set the scores
	 * of all group stage matches and the winners of all knockout stage matches. Useful for sharing your predictions. Uses a
	 * compression algorithm to reduce what would otherwise be an 111-character string to around 40.
	 */
	this.save = function() {
		var scoreString = '';
		for (var g = 0; g < this.groups.length; g++) {
			scoreString += this.groups[g].getScoreString();
		}
		scoreString = this.encodeUtils.encode(scoreString);
		console.log(scoreString);
	};
	
	/* load
	 * Given an encoded scoreString produced by the save method, sets the tournament to the state when the string was produced.
	 */
	this.load = function (encodedString) {
		if (encodedString === '') { 
			encodedString = prompt("Enter your save code","");
		}
		var decodedString = this.encodeUtils.decode(encodedString);
		while (decodedString.length != 96) { 
			encodedString = prompt("That string is invalid. Please try again, or enter '__' for an empty tournament",encodedString);
			decodedString = this.encodeUtils.decode(encodedString);
		}
		for (var g = 0; g < groups.length; g++) {
			this.groups[g].load(decodedString.substring(g*12, g*12+12));
		}
		this.populateBracket();
		this.knockout.clear();
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
		this.knockout = new this.Bracket(4);
		this.realScores = realScores;
		for (var g = 0; g < 8; g++) {
			this.groups[g].drawTab();
			this.groups[g].drawMatches();
			this.groups[g].drawTable();
		}
		this.load(realScores);
		$("#group-tab-links").children().unwrap();
		$("#group-tab-content").children().unwrap();
	};
	
	this.populateBracket = function () {
		for (var g = 0; g < 8; g++) {
			for (var i = 0; i < 2; i++) {
				var matchIndex = Math.floor(g/2) + 4 * Math.abs((i - (g % 2)));
				this.knockout.nodeArr[0][matchIndex][i].setTeam(groups[g].getTeam(i));
			}
		}
	};

	return this;
}());
