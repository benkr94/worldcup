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
	
	this.init = function (countryNames, matchDetails) {
		if (countryNames.length !== 32) {
			throw new Error("ERROR: Wrong number of teams for constructing World Cup tournament");
		}
		if (matchDetails.length !== 63) {
			throw new Error("ERROR: Wrong number of match details for constructing World Cup tournament");
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
		$("#group-tab-links").children().unwrap();
		$("#group-tab-content").children().unwrap();
		//this.load(realScores);
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
		var encodedString = this.encodeUtils.encode(groupString, this.knockout.getWinnerString());
		var urlSafeEncodedString = encodeURIComponent(encodedString);
		alert("To recover this tournament, click \"Load scores\" and enter this string:\n\n"+encodedString+"\n\nor enter this into the address bar:\n\nhttp://www.fantagraphy.net/worldcup?"+urlSafeEncodedString); 
	};
	
	this.load = function (encodedString) {
		var decodedStrings, message;
		while (true) {
			message = "Sorry, the provided save code is invalid. Please try again, or enter 'empty' for an empty tournament";
			if (encodedString === null) {
				console.log("Load cancelled.");
				return false;
			}
			if (encodedString.indexOf('%') !== -1) {
				encodedString = decodeURIComponent(encodedString);
			}			
			try {
				decodedStrings = this.encodeUtils.decode(encodedString);
			}
			catch (e) {
				if (encodedString === '') {
					message = "Please enter a code to load a saved tournament";
				}
				decodedStrings = {groupString: "", bracketString: ""};
			}
			if (decodedStrings.groupString.length === 96 || decodedStrings.bracketString.length === 15) {
				break;
			}
			encodedString = prompt(message, encodedString);
		}
		for (var g = 0; g < groups.length; g++) {
			this.groups[g].load(decodedStrings.groupString.substring(g*12, g*12+12));
		}
		this.populateBracket();
		this.knockout.clear();
		this.knockout.load(decodedStrings.bracketString);
	};
	
	this.updateTimes = function (offset) {
		if (isNaN(offset)) {
			throw new Error("Invalid time offset");
		}
		for (var g = 0; g < 8; g++) {
			this.groups[g].updateTimes(offset);
		}
		this.knockout.updateTimes(offset);
	};

	return this;
}());
