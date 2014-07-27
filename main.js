var Brazil2014 = (function() {
	
	this.groups = [];
	this.realScores = '';
	
	/* save
	 * Produces a string which the user can paste in at the "Load" screen, or put at the end of the URL, in order to set the scores
	 * of all group stage matches and the winners of all knockout stage matches. Useful for sharing your predictions. Uses a
	 * compression algorithm to reduce what would otherwise be an 111-character string to around 40.
	 */
	this.save = function() {
		var groupString = '';
		for (var g = 0; g < this.groups.length; g++) {
			groupString += this.groups[g].getScoreString();
		}
		encodedString = this.encodeUtils.encode(groupString, this.knockout.getSaveString());
		console.log(encodedString);
	};
	
	/* load
	 * Given an encoded scoreString produced by the save method, sets the tournament to the state when the string was produced.
	 */
	this.load = function (encodedString) {
		if (encodedString === '') { 
			encodedString = prompt("Enter your save code","");
		}
		var decodedStrings = this.encodeUtils.decode(encodedString);
		console.log(decodedStrings.groupString.length+" "+decodedStrings.bracketString.length);
		while (decodedStrings.groupString.length !== 96 || decodedStrings.bracketString.length !== 15) { 
			encodedString = prompt("That string is invalid. Please try again, or enter '__+0' for an empty tournament",encodedString);
			decodedStrings = this.encodeUtils.decode(encodedString);
		}
		for (var g = 0; g < groups.length; g++) {
			this.groups[g].load(decodedStrings.groupString.substring(g*12, g*12+12));
		}
		this.populateBracket();
		this.knockout.clear();
		this.knockout.load(decodedStrings.bracketString);
		return decodedStrings.groupString;
	};

	
	this.init = function (countryNames, matchDetails, realScores) {
		if (countryNames.length !== 32) {
			console.log("ERROR: Wrong number of teams for constructing World Cup tournament");
			return false;
		}
		if (matchDetails.length !== 63) {
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
		this.knockout = new this.Bracket(4, matchDetails.slice(48));
		this.realScores = realScores;
		for (var g = 0; g < 8; g++) {
			this.groups[g].drawTab();
			this.groups[g].drawMatches();
			this.groups[g].drawTable();
		}
		var userTime = new Date();
		var userOffset = 0 - userTime.getTimezoneOffset();
		$('#tzwrapper select').val(userOffset);
		if ($('#tzwrapper select').val() === null) {
			$('#tzwrapper select').val("");
			this.updateTimes(-180); //default to Rio time if user's browser gives us a funky offset
		}
		else {
			this.updateTimes(userOffset);
		}
		this.decodedGroupStage = this.load(realScores);
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
	
	this.updateTimes = function (offset) {
		console.log(offset);
		if (isNaN(offset)) {
			return false;
		}
		for (var g = 0; g < 8; g++) {
			this.groups[g].updateTimes(offset);
		}
		this.knockout.updateTimes(offset);
	};

	return this;
}());
