/* main.js
 * Defines the top-level module for the World Cup final tournament.
 * 
 * Attributes:
 *  groups: An array of the Group objects representing the 8 groups in the World Cup.
 *  knockout: A Bracket object representing the knockout stage.
 * Methods:
 *  init: Given the names of the participating countries, the details of where and when each match will take place, and a string 
 *    representing group stage match scores and knockout winners, creates the tournament UI and puts it in that state.
 *  populateBracket: takes the top two teams from each group and puts them in the appropriate space in the first round of the bracket.
 *  save: Produces a string which the user can paste in at the "Load" screen, or put at the end of the URL, in order to set the scores
 *    of all group stage matches and the winners of all knockout stage matches. Uses a compression algorithm to reduce what would
 *    otherwise be a 110-character string to around 40.
 *  load: Given an encoded scoreString produced by the save method, sets the tournament to the state when the string was produced.
 *  updateTimes: Puts match times in the user's chosen time zone.
 */
var Brazil2014 = (function() {
	
	this.init = function (countryNames, matchDetails, realScores) {
		if (countryNames.length !== 32) {
			console.log("ERROR: Wrong number of teams for constructing World Cup tournament");
			return false;
		}
		if (matchDetails.length !== 63) {
			console.log("ERROR: Wrong number of match details for constructing World Cup tournament");
			return false;
		}
		this.groups = [];
		for (var g=0; g<8; g++) {
			var teams = [];
			var groupMatchDetails = [];
			groupMatchDetails.push(matchDetails[2*g]);
			groupMatchDetails.push(matchDetails[2*g+1]);
			groupMatchDetails.push(matchDetails[16+2*g]);
			groupMatchDetails.push(matchDetails[16+2*g+1]);
			groupMatchDetails.push(matchDetails[32+2*g]);
			groupMatchDetails.push(matchDetails[32+2*g+1]);
			for (var t=0; t < 4; t++) {
			    teams[t] = new this.Team(4*g+t, countryNames[4*g+t]);
			}
			this.groups[g] = new this.Group(g, teams, groupMatchDetails);
		}
		this.knockout = new this.Bracket(4, matchDetails.slice(48));
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
		var advanceList = [];
		for (var g = 0; g < 8; g++) {
			this.groups[g].submitAdvancers(advanceList);
		}
		this.knockout.setFirstTeams(advanceList);
	};

	this.save = function() {
		var groupString = '';
		for (var g = 0; g < this.groups.length; g++) {
			groupString += this.groups[g].getScoreString();
		}
		encodedString = this.encodeUtils.encode(groupString, this.knockout.getSaveString());
		console.log(encodedString);
	};
	
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
