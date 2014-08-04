/* encodeUtils sub-module
 * functions that take the basic save strings provided by the Group and Bracket objects, and compress them into as few characters
 * as possible */

var Brazil2014 = (function (Tournament) {
    var groupKeyString = 'OPQRSTU|VWX}YZ&;@,:(0123456789abcde)fghijklmnopqrst{uvwxyzABCDEFGHI=JKL]MN^/$*!\\[`?<~.\'>"#';
    var bracketKeyString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var encodeUtils = {};
    
    /* groupEncode
     * The concatenated scoreString generated by Group objects is a sequence of single-digit numerals representing teams' scores in
     * matches, and dashes representing where the user has not filled in a (valid) score. There are 96 score spaces in the group stage.
     * Using a few assumptions about the most likely usage of this tool -- scores will usually be from 0 to 3, and blank spaces are
     * likely to appear in 'runs' where matches haven't been played or the user hasn't finished predicting -- this encoding scheme
     * compresses most 'realistic' group stage states down to about 40 ASCII characters. Best-case-scenario is 2 chars, worst is 96.
     * Algorithm:
     *  -Each character in groupKeyString represents either a digit from 4 to 9, or a 1-, 2-, or 3-digit sequence using the digits
     *   0, 1, 2, and 3. Thus, it has 90 characters (4 1-digit sequences, 16 2-digit sequences, 64 3-digit sequences, 6 large digits)
     *  -Sequences are composed greedily -- will only stop if a blank space or a digit larger than 3 is encountered, or if it's
     *   already three digits long
     *  -Single blank spaces (dashes) are represented by a dash
     *  -If all subsequent characters in the string are dashes, this is represented by '__'.
     *  -If not, multiple blanks are represented by the character _, followed by the character in groupKeyString at the index which is
     *   the number of consecutive blanks, minus 2 (so charaters at index 0 and 1 will be used). For example, this condenses 50
     *   consecutive dashes to '_r'. In the presumably rare case where there are, say, 93 consecutive blanks with a filled-in score
     *   after, the blanks would be represented like '_#_O' (91 then 2), since there are only 90 characters in the keyString.
     */
    function groupEncode(scoreString) {
        if (scoreString.length === 0) {
            return '';
        }
        var miniString = '';
        switch(scoreString.charAt(0)) {
            case '0':
            case '1':
            case '2':
            case '3':
                miniString += scoreString.charAt(0);
                for (var i = 1; i < 3; i++) {
                    if ($.inArray(scoreString.charAt(i).toString(), ['0','1','2','3']) === -1) { //JQuery used as IE<9 does not have array.indexOf
                        break;
                    }
                    miniString += scoreString.charAt(i);
                }
                var baseConverted = 0;
                var offset = -1;
                for (var i = 0; i < miniString.length; i++) {
                    baseConverted += miniString.charAt(i)*Math.pow(4, miniString.length - 1 - i);
                    offset += Math.pow(4, i);
                }
                return groupKeyString.charAt(offset + baseConverted) + groupEncode(scoreString.slice(miniString.length));
                break;
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                return groupKeyString.charAt(80 + parseInt(scoreString.charAt(0))) + groupEncode(scoreString.slice(1));
                break;
            case '-':
                var counter = 1;
                while (counter < scoreString.length) {
                    if (scoreString.charAt(counter) !== '-') {
                        break;
                    }
                    counter++;
                }
                if (counter === 1) {
                    return '-'+groupEncode(scoreString.slice(counter));
                }
                else if (counter === scoreString.length) {
                    return '__';
                }
                else if (counter > groupKeyString.length+1) {	//allow counting spaces past what can encoded into 2 chars so that
                	counter = (groupKeyString.length+1);		//spaces-till-end can be detected, but resume encoding from no further
                }												//if it is not detected
                return '_'+groupKeyString.charAt(counter-2)+groupEncode(scoreString.slice(counter));
                break;
            default:
                var message = "ERROR: Invalid character "+scoreString.charAt(0)+" in group's scoreString; only digits and dashes are acceptable";
                console.log(message);
                throw new Error(message);
        }
    }
    
    /* groupDecode
     * Undoes groupEncode. Given an encoded scoreString, returns the digit-and-dash sequence of scores that can be split and loaded
     * into the groups.
     */
    function groupDecode(encodedString) {
        var decodedString = '';
        for (var i = 0; i < encodedString.length; i++) {
            switch (encodedString.charAt(i)) {
                case '-':
                    decodedString += '-';
                    break;
                case '_':
                    if (encodedString.charAt(i+1) === '_') {
                        while (decodedString.length < 96) {
                            decodedString += '-';
                        }
                        return decodedString;
                    }
                    var numSpaces = groupKeyString.indexOf(encodedString.charAt(i+1)) + 2;
                    for (var j = 0; j < numSpaces; j++) {
                        decodedString += '-';
                    }
                    i++; //skip next character, as it's been interpreted
                    break;
                default:
                    var keyStringIndex = groupKeyString.indexOf(encodedString.charAt(i));
                    if (keyStringIndex === -1) {
                        var message = "Invalid character "+encodedString.charAt(i)+" at position "+i+" in encoded group string";
                        console.log(message);
                        throw new Error(message);
                    }
                    if (keyStringIndex >= 84) {
                        decodedString += '' + (keyStringIndex - 80);
                    }
                    else {
                        var digits = 1;
                        var nextOffset = 4;
                        while (keyStringIndex - nextOffset >= 0) {
                            keyStringIndex = keyStringIndex - nextOffset;
                            digits++;
                            nextOffset = Math.pow(4, digits);
                        }
                        var score;
                        var scores = [];
                        for (var j = digits-1; j >= 0; j--) {
                            score = Math.floor((keyStringIndex)/Math.pow(4,j));
                            scores.push(score);
                            keyStringIndex -= score * Math.pow(4,j);
                        }
                        decodedString += scores.join('');
                    }
            }
        }
        return decodedString;	
    }
    
    /* bracketEncode
     * The winnerString generated by the Bracket object is just a 15-digit ternary number. This converts it to a 4-digit base-62
     * number.
     */
     function bracketEncode(winnerString) {
        var decimal = 0;
        for (var i = 0; i < winnerString.length; i++) {
            decimal += Math.pow(3, winnerString.length-i-1)*parseInt(winnerString.charAt(i));
        }
        var numDigits = 1;
        while (true) {
            if (Math.pow(62, numDigits) > decimal) {
                break;
            }
            numDigits++;
        }
        var encodedString = '';
        var nextDigit;
        for (var i = numDigits-1; i >= 0; i--) {
            nextDigit = Math.floor(decimal/Math.pow(62,i));
            encodedString += bracketKeyString.charAt(nextDigit);
            decimal -= nextDigit*Math.pow(62,i);
        }
        return encodedString;
    }
    
    /* bracketDecode
     * Takes strings generated by the above method and creates the ternary strings required to populate brackets.
     */
    function bracketDecode(encodedString) {
    	var message;
        if (!encodedString) {
            message = "Bracket string not supplied.";
            console.log(message);
            throw new Error(message);
        }
        var decimal = 0;
        for (var i = 0; i < encodedString.length; i++) {
            if (bracketKeyString.indexOf(encodedString.charAt(i)) === -1) {
                message = "Invalid character "+encodedString.charAt(i)+" at position "+i+" in encoded bracket string. Only alphanumerics acceptable.";
                console.log(message);
                throw new Error(message);
            }
            decimal += bracketKeyString.indexOf(encodedString.charAt(i))*Math.pow(62,encodedString.length-i-1);
        }
        if (decimal >= Math.pow(3,15)) {
            message = "Bracket string decodes to a number which cannot be expressed in 15 digits in ternary.";
            console.log(message);
            throw new Error(message);
        }
        var decodedString = '';
        var nextDigit;
        for (var i = 14; i >= 0; i--) {
            nextDigit = Math.floor(decimal/Math.pow(3,i));
            decodedString += nextDigit;
            decimal -= nextDigit*Math.pow(3,i);
        }
        return decodedString;
    }
    
    /*Methods revealed by module*/
    
    /* encodeUtils.encode
     * Given a groupString and a bracketString, encodes both and returns them separated by the character '+'. This string is what is
     * prompted for by the 'load' button; inputting it at this prompt will load the tournament with all user predictions.
     */
    encodeUtils.encode = function(groupString, bracketString) {
        return groupEncode(groupString)+'+'+bracketEncode(bracketString);
    };
    
    /* encodeUtils.decode
     * Given an encoded tournamentString, will return an object containing decoded strings for the group and knockout stages, to be
     * loaded by the Group's and Bracket's load methods, respectively.
     */
    encodeUtils.decode = function(encodedString) {
    	if (encodedString === "empty") {
    		encodedString = '__+0';
    	}
        var stageSplit = encodedString.split('+');
        return { groupString: groupDecode(stageSplit[0]), bracketString: bracketDecode(stageSplit[1]) };
    };
    
    Tournament.encodeUtils = encodeUtils;
    return Tournament;
}(Brazil2014));