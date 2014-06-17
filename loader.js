function readAll() {
	var scores = '';
	for (var g = 0; g < 8; g++) {
	var groupName = String.fromCharCode(g+65);
		for (var m = 0; m < 6; m++) {
			var score1 = $("#"+groupName+" .matchRow"+m+" .score1").val();
			score1 = isNonNegativeNumber(score1) ? score1 : "-";
			var score2 = $("#"+groupName+" .matchRow"+m+" .score2").val();
			score2 = isNonNegativeNumber(score2) ? score2 : "-";
			scores = scores + score1 + score2;
		}
	}
	console.log(scores);








}
