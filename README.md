This website allows you to enter the scores of all group stage matches in the world cup, and see the effects on the table.
You can use this to see what match results would allow teams to clinch a berth in the knockout stage and what results would 
eliminate teams. You can also choose the winners of each knockout stage match, and share all your predictions with friends 
using the URL provided by the "Save tournament" button. Here is a rundown of the files committed here:

JS

main.js
 Defines the top-level module for the World Cup final tournament.

group.js
 Expands the Tournament module with a constructor for objects representing groups.

groupUtils.js
 Provides a sub-module with complex functions related to group reordering and clinching that I didn't want cluttering the
 group constructor and getting re-declared with each new instance.
 
match.js
 Expands the Tournament module with a constructor for objects representing group-stage matches.
 
team.js
 Expands the Tournament module with a constructor for objects representing teams.
 
bracket.js
 Expands Tournament module to include 2 more constructors:
  -Bracket (represents the knockout stage bracket)
  -Node (represents one cell in the bracket, ie, a space to contain one of the competitors in the knockout match)

encodeUtils.js
 Provides a sub-module for the functions that take the user's choices for all matches and converts them into a 40-ish
 character string from which the predicted tournament can be loaded
 
setup.js
 Defines the arguments that are used to initialize the tournament module for the 2014 World Cup, and the JQuery triggers
 that allow the user to interact with the page.
 

CSS

bracket.css
 Styling for the knockout bracket

buttons.css
 Styling for the buttons at the bottom of the page
 
tabs.css
 Styling for the tabs used to select a group or the knockout stage
 
world_cup.css
 Styling for the rest of the page
