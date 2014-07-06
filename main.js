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
		scoreString = encode(scoreString);
		console.log(scoreString);
	};
	
	encode = function (scoreString) {
		if (scoreString.length === 0) {
			return '';
		}
		var codeString = '0123456789abcde)fghijklmnopqrst{uvwxyzABCDEFGHI=JKL]MNO/PQR\\[`\'<STU|VWX.YZ~;@,:(^$*!}&?>"%';
		var miniString = '';
		switch(scoreString.charAt(0)) {
			case "0":
			case "1":
			case "2":
			case "3":
				miniString += scoreString.charAt(0);
				for (var i = 1; i < 3; i++) {
					if ($.inArray(scoreString.charAt(i).toString(), ["0","1","2","3"]) === -1) { //JQuery used as IE<9 does not have array.indexOf
						break;
					}
					miniString += scoreString.charAt(i);
				}
				switch(miniString.length) {
					case 3: 
						var baseConverted = miniString.charAt(0)*16 + miniString.charAt(1)*4 + miniString.charAt(2);
						return codeString.charAt(baseConverted) + encode(scoreString.slice(3));
					case 2:
						var baseConverted = miniString.charAt(0)*4 + miniString.charAt(1);
						return codeString.charAt(64 + baseConverted) + encode(scoreString.slice(2));
					case 1:
						return codeString.charAt(80 + miniString) + encode(scoreString.slice(1));
				}
				break;
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				return codeString.charAt(80 + scoreString.charAt(0)) + encode(scoreString.slice(1));
				break;
			case "-":
				var counter = 1;
				while (counter < scoreString.length) {
					if (counter >= 89 || scoreString.charAt(counter) !== '-') {
						break;
					}
					counter++;
				}
				if (counter === 1) {
					return "-"+encode(scoreString.slice(counter));
				}
				else if (counter === scoreString.length) {
					return "__";
				}
				else {
					return "_"+codeString.charAt(counter)+encode(scoreString.slice(counter));
				}
				break;
			default:
				console.log("ERROR: Invalid score string: "+scoreString);
				return false;
		}
	};
	
	decode = function (scoreString) {
		var decodedString = '';
		var codeString = '0123456789abcde)fghijklmnopqrst{uvwxyzABCDEFGHI=JKL]MNO/PQR\\[`?<STU|VWX.YZ~;@,:(^$*!}&\'>"%';
		for (var i = 0; i < scoreString.length; i++) {
			switch (scoreString.charAt(i)) {
				case '-':
					decodedString += '-';
					break;
				case '_':
					if (scoreString.charAt(i+1) === '_') {
						while (decodedString.length < 96) {
							decodedString += '-';
							return decodedString;
						}
					}
					var codeStringIndex = codeString.indexOf(scoreString.charAt(i+1));
					if (codeStringIndex === -1) {
						console.log("ERROR: Invalid score string: "+scoreString);
						return false;
					}
					for (var j = 0; j < codeStringIndex; j++) {
						decodedString += '-';
					}
					i++; //skip next character, as it's been interpreted
					break;
				default:
					var codeStringIndex = codeString.indexOf(scoreString.charAt(i));
					if (codeStringIndex === -1) {
						console.log("ERROR: Invalid score string: "+scoreString);
						return false;
					}
					if (codeStringIndex >= 80) {
						decodedString += '' + (codeStringIndex - 80);
					}
					else if (codeStringIndex >= 64) {		//I'd write a general case for zero-padded base 4 conversions if I had to
						var base10 = codeStringIndex - 64;	//do any more than this, but as it stands, I think it's clearer this way.
						var firstDigit = Math.floor(base10/4);
						var secondDigit = base10 - 4 * firstDigit;
						decodedString += '' + firstDigit + secondDigit;
					}
					else {
						var firstDigit = Math.floor(codeStringIndex/16);
						var secondDigit = Math.floor((codeStringIndex - 16 * firstDigit)/4);
						var thirdDigit = codeStringIndex - 16 * firstDigit - 4 * secondDigit;
						decodedString = '' + firstDigit + secondDigit + thirdDigit;
					}
			}
		return decodedString;	
		}
	};
	
	/* load
	 * Given a scoreString produced by the save method, sets the tournament to the state when the string was produced.
	 */
	this.load = function (scoreString) {
		if (scoreString === '') { 
			scoreString = prompt("Enter score string","");
			var decoded = decode(scoreString);
			while (decoded.length != 96) { 
				scoreString = prompt("That scorestring is invalid. Please try again, or enter '__' for an empty tournament",scoreString);
				decoded = decode(scoreString);
			}
		}
		for (var g = 0; g < groups.length; g++) {
			this.groups[g].load(decoded.substring(g*12, g*12+12));
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
		this.realScores = realScores;
		for (var g = 0; g < 8; g++) {
			this.groups[g].drawTab();
			this.groups[g].drawMatches();
			this.groups[g].drawTable();
			this.groups[g].load(realScores.substring(g*12, g*12+12));
		}
		$("#group-tab-links").children().unwrap();
		$("#group-tab-content").children().unwrap();
		//console.log(this.Bracket);
		this.knockout = new this.Bracket(4);
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
