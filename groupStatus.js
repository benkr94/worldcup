threat(threatener, threatenee) {
	if (threatener.isEliminated === 1 || threatener.hasClinched === 1) {
		return false;
	}
	ptsBetween = threatenee.getStat("points") - threatener.getStat("points");
	goalDifferenceBetween = threatenee.getStat("goalDifference") - threatener.getStat("goalDifference");
	goalsForBetween = threatenee.getStat("goalsFor") - threatener.getStat("goalsFor");
	if (ptsBetween > 3 || ptsBetween < 0) {
		return false;
	} //below tests should never be entered; should not be evaluating team with no games to play. Will put in error handling.
	if (ptsBetween === 3 && goalDifferenceBetween > 0 && threatener.getStat("played") === 3) {
		return false;
	}
	if (ptsBetween === 0 && goalDifferenceBetween < 0 && threatener.getStat("played") === 3) {
		return false;
	}
	return true;
}

testMatchResult(threatener, threatenee, test) {
	if (!threat(threatener, threatenee)) {
		if (test === eliminated) {
			return [99,0];
		}
		else {
			return [0,99];
		}
	}
	ptsBetween = threatenee.getStat("points") - threatener.getStat("points");
	goalDifferenceBetween = threatenee.getStat("goalDifference") - threatener.getStat("goalDifference");
	goalsForBetween = threatenee.getStat("goalsFor") - threatener.getStat("goalsFor");
	winBy = 0;
	switch (ptsBetween) {
		case 3:
			if (test === eliminated) {
				winBy = (goalDifferenceBetween < goalsForBetween) ? goalDifferenceBetween : goalDifferenceBetween - 1;
				winBy = (winBy > 0) ? winBy : 0;
				return [winBy, 0];
			}
			else {
				winBy = (goalDifferenceBetween < 1) ? 1 : goalDifferenceBetween;
				return [99, 99-winBy];
			}
			break;
		case 2:
			if (test === eliminated) {
				return [0,0];
			}
			else {
				return [99, 98];
			}
			break;
		               
		case 1:
			if (test === eliminated) {
				if (goalDifferenceBetween < 0 || (goalDifferenceBetween === 0 && goalsForBetween < 0)) {
					return [0,1]
				}
				else {
					return [0,0];
				}
			}
			else {
				if (goalDifferenceBetween <= 0) {
					return [99, 99];
				}
				else {
					return [99, 98];
				}
			}
			break;
		case 0:
			if (test === eliminated) {
				loseBy = (goalDifferenceBetween >= 0) ? 1 : 0 - goalDifferenceBetween;
				return [loseBy, 0];
			}
			else {
				loseBy = (goalDifferenceBetween < 0) ? 0 - goalDifferenceBetween : 0
				return [99 - loseBy, 99];
			}
			break;
	}
}
