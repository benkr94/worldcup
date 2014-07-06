var Brazil2014 = (function (Tournament) {
	var groupCodeString = 'OPQRSTU|VWX}YZ&;@,:(0123456789abcde)fghijklmnopqrst{uvwxyzABCDEFGHI=JKL]MN^/$*!\\[`?<~.\'>"%';
	var bracketCodeString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
	var encodeUtils = {};
	
	groupEncode = function (scoreString) {
		console.log("String to encode: "+scoreString);
		if (scoreString.length === 0) {
			return '';
		}
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
				console.log("miniString is "+miniString);
				var baseConverted = 0;
				var offset = -1;
				for (var i = 0; i < miniString.length; i++) {
					baseConverted += miniString.charAt(i)*Math.pow(4, miniString.length - 1 - i);
					offset += Math.pow(4, i);
				}
				console.log("baseConverted: "+baseConverted+" offset: "+offset+" yields: "+groupCodeString.charAt(offset+baseConverted));
				return groupCodeString.charAt(offset + baseConverted) + groupEncode(scoreString.slice(miniString.length));
				break;
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				console.log("index "+(80+parseInt(scoreString.charAt(0)))+" yields "+groupCodeString.charAt(80 + parseInt(scoreString.charAt(0))));
				return groupCodeString.charAt(80 + parseInt(scoreString.charAt(0))) + groupEncode(scoreString.slice(1));
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
					console.log("One space");
					return "-"+groupEncode(scoreString.slice(counter));
				}
				else if (counter === scoreString.length) {
					console.log("spaces till end");
					return "__";
				}
				else {
					console.log(counter+" spaces yields _"+groupCodeString.charAt(counter));
					return "_"+groupCodeString.charAt(counter)+groupEncode(scoreString.slice(counter));
				}
				break;
			default:
				console.log("ERROR: Invalid score string: "+scoreString);
				return false;
		}
	};
	
	groupDecode = function (encodedString) {
		var decodedString = '';
		for (var i = 0; i < encodedString.length; i++) {
			console.log("Found "+encodedString.charAt(i));
			switch (encodedString.charAt(i)) {
				case '-':
					decodedString += '-';
					console.log("Adding '-'.");
					break;
				case '_':
					if (encodedString.charAt(i+1) === '_') {
						while (decodedString.length < 96) {
							decodedString += '-';
						}
						console.log("Found __. Filling with '-'.");
						return decodedString;
					}
					var codeStringIndex = groupCodeString.indexOf(encodedString.charAt(i+1));
					if (codeStringIndex === -1) {
						console.log("ERROR: Invalid score string: "+encodedString);
						return false;
					}
					for (var j = 0; j < codeStringIndex; j++) {
						decodedString += '-';
					}
					console.log("Found _"+encodedString.charAt(i+1)+". Adding "+codeStringIndex+" -'s. ");
					i++; //skip next character, as it's been interpreted
					break;
				default:
					var codeStringIndex = groupCodeString.indexOf(encodedString.charAt(i));
					console.log("codeStringIndex is "+codeStringIndex);
					if (codeStringIndex === -1) {
						console.log("ERROR: Invalid score string: "+encodedString);
						return false;
					}
					if (codeStringIndex >= 84) {
						decodedString += '' + (codeStringIndex - 80);
						console.log("Adding "+(codeStringIndex - 80));
					}
					else {
						var digits = 1;
						var nextOffset = 4;
						while (codeStringIndex - nextOffset >= 0) {
							codeStringIndex = codeStringIndex - nextOffset;
							digits++;
							nextOffset = Math.pow(4, digits);
						}
						console.log("Indicates a "+digits+"-digit number representing "+codeStringIndex);
						var scores = [];
						for (var j = digits-1; j >= 0; j--) {
							score = Math.floor((codeStringIndex)/Math.pow(4,j))
							console.log("Got a score of "+score);
							scores.push(score);
							codeStringIndex -= score * Math.pow(4,j);
						}
						decodedString += scores.join('');
						console.log("Adding "+scores.join(''));
					}
				console.log("Decoded string is now "+decodedString);
			}
		console.log("Length is "+decodedString.length);
		}
		return decodedString;	
	};
	
	/* bracketEncode
	 * The bracket's saveString is just a 15-digit ternary number. This converts it to a 4-digit base-62 number.
	 */
	bracketEncode = function(saveString) {
		var decimal = 0;
		for (var i = 0; i < saveString.length; i++) {
			decimal += Math.pow(3, saveString.length-i-1)*parseInt(saveString.charAt(i));
		}
		var numDigits = 1;
		while (true) {
			if (Math.pow(62, numDigits) > decimal) {
				break;
			}
			numDigits++;
		}
		var encodedString = '';
		for (var i = numDigits-1; i >= 0; i--) {
			nextDigit = Math.floor(decimal/Math.pow(62,i));
			encodedString += bracketCodeString.charAt(nextDigit);
			decimal -= nextDigit*Math.pow(62,i);
		}
		return encodedString;
	};
	
	/* bracketDecode
	 * takes strings generated by the above method and creates the ternary strings required to populate brackets.
	 */
	bracketDecode = function(encodedString) {
		if (!encodedString) {
			return false;
		}
		var decimal = 0;
		for (var i = 0; i < encodedString.length; i++) {
			if (bracketCodeString.indexOf(encodedString.charAt(i)) === -1) {
				return false;
			}
			decimal += bracketCodeString.indexOf(encodedString.charAt(i))*Math.pow(62,encodedString.length-i-1);
		}
		if (decimal >= Math.pow(3,15)) {
			return false;
		}
		var decodedString = '';
		for (var i = 14; i >= 0; i--) {
			nextDigit = Math.floor(decimal/Math.pow(3,i));
			decodedString += nextDigit;
			decimal -= nextDigit*Math.pow(3,i);
		}
		return decodedString;
	};
	
	encodeUtils.encode = function(groupString, bracketString) {
		return groupEncode(groupString)+'+'+bracketEncode(bracketString);
	};
	
	encodeUtils.decode = function(encodedString) {
		var stageSplit = encodedString.split('+');
		return { groupString: groupDecode(stageSplit[0]), bracketString: bracketDecode(stageSplit[1]) };
	};
	
	Tournament.encodeUtils = encodeUtils;
	return Tournament;
}(Brazil2014));
