function readAll() {
	var scores = '';
	for (var g = 0; g < 8; g++) {
	var groupName = String.fromCharCode(g+65);
		for (var m = 0; m < 6; m++) {
			var score1 = $("#"+groupName+" .match"+m+" .score1").val();
			score1 = isNonNegativeNumber(score1) ? score1 : "-";
			var score2 = $("#"+groupName+" .match"+m+" .score2").val();
			score2 = isNonNegativeNumber(score2) ? score2 : "-";
			scores = scores + score1 + score2;
		}
	}
	console.log(scores);
}

function loadTournament() {
	var scores = prompt("Enter score string","");
	while (scores.length != 96) {
		scores = prompt("Enter a better score string","");
	}
	for (var g = 0; g < Groups.length; g++) {
		Brazil2014.groups[g].load(scores.substring(g*12, g*12+12));
	}
}


function encodeScoreString() {

}

function decodeScoreString() {

}
