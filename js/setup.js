/* setup.js
 * Defines the arguments that are used to initialize the tournament module, and the JQuery triggers that allow the user to interact
 * with the page.
 */
 
var NAMES = ["Brazil", "Croatia", "Mexico", "Cameroon", "Spain", "Netherlands", "Chile", "Australia", "Colombia", "Greece", "Ivory Coast", "Japan", "Uruguay", "Costa Rica", "England", "Italy", "Switzerland", "Ecuador", "France", "Honduras", "Argentina", "Bosnia & Herz.", "Iran", "Nigeria", "Germany", "Portugal", "Ghana", "United States", "Belgium", "Algeria", "Russia", "Korea Republic"];
var MATCH_DETAILS = [["Arena de Sao Paulo, Sao Paulo", [5,12,20,0]],["Arena das Dunas, Natal", [5,13,16,0]],["Arena Fonte Nova, Salvador", [5,13,19,0]],["Arena Pantanal, Cuiaba", [5,13,22,0]],["Estadio Mineirao, Belo Horizonte", [5,14,16,0]],["Arena Pernambuco, Recife", [5,15,1,0]],["Estadio Castelao, Fortaleza", [5,14,19,0]],["Arena Amazonia, Manaus", [5,14,22,0]],["Estadio Nacional Mane Garrincha, Brasilia", [5,15,16,0]],["Estadio Beira-Rio, Porto Alegre", [5,15,19,0]],["Estadio do Maracana, Rio de Janeiro", [5,15,22,0]],["Arena da Baixada, Curitiba", [5,16,19,0]],["Arena Fonte Nova, Salvador", [5,16,16,0]],["Arena das Dunas, Natal", [5,16,22,0]],["Estadio Mineirao, Belo Horizonte", [5,17,16,0]],["Arena Pantanal, Cuiaba", [5,17,22,0]],["Estadio Castelao, Fortaleza", [5,17,19,0]],["Arena Amazonia, Manaus", [5,18,22,0]],["Estadio do Maracana, Rio de Janeiro", [5,18,19,0]],["Estadio Beira-Rio, Porto Alegre", [5,18,16,0]],["Estadio Nacional Mane Garrincha, Brasilia", [5,19,16,0]],["Arena das Dunas, Natal", [5,19,22,0]],["Arena de Sao Paulo, Sao Paulo", [5,19,19,0]],["Arena Pernambuco, Recife", [5,20,16,0]],["Arena Fonte Nova, Salvador", [5,20,19,0]],["Arena da Baixada, Curitiba", [5,20,22,0]],["Estadio Mineirao, Belo Horizonte", [5,21,16,0]],["Arena Pantanal, Cuiaba", [5,21,22,0]],["Estadio Castelao, Fortaleza", [5,21,19,0]],["Arena Amazonia, Manaus", [5,22,22,0]],["Estadio do Maracana, Rio de Janeiro", [5,22,16,0]],["Estadio Beira-Rio, Porto Alegre", [5,22,19,0]],["Estadio Nacional Mane Garrincha, Brasilia", [5,23,20,0]],["Arena Pernambuco, Recife", [5,23,20,0]],["Arena da Baixada, Curitiba", [5,23,16,0]],["Arena de Sao Paulo, Sao Paulo", [5,23,16,0]],["Arena Pantanal, Cuiaba", [5,24,20,0]],["Estadio Castelao, Fortaleza", [5,24,20,0]],["Arena das Dunas, Natal", [5,24,16,0]],["Estadio Mineirao, Belo Horizonte", [5,24,16,0]],["Arena Amazonia, Manaus", [5,25,20,0]],["Estadio do Maracana, Rio de Janeiro", [5,25,20,0]],["Estadio Beira-Rio, Porto Alegre", [5,25,16,0]],["Arena Fonte Nova, Salvador", [5,26,16,0]],["Arena Pernambuco, Recife", [5,26,16,0]],["Estadio Nacional Mane Garrincha, Brasilia", [5,26,16,0]],["Arena de Sao Paulo, Sao Paulo", [5,26,20,0]],["Arena da Baixada, Curitiba", [5,26,20,0]],["Belo Horizonte", [5,28,16,0]],["Fortaleza", [6,4,16,0]],["Rio de Janeiro", [5,28,20,0]],["Belo Horizonte", [6,8,20,0]],["Brasilia", [5,30,16,0]],["Rio de Janeiro", [6,4,20,0]],["Porto Alegre", [5,30,20,0]],["Rio de Janeiro", [6,13,19,0]],["Fortaleza", [5,29,16,0]],["Salvador", [6,5,16,0]],["Recife", [5,29,20,0]],["Sao Paulo", [6,9,20,0]],["Sao Paulo", [6,1,16,0]],["Brasilia", [6,5,20,0]],["Salvador", [6,1,20,0]]];
var SCORES = 'N0O~P~rG!6.rAfP~y4gD^rQ.nJ{v46~6Evzj~vkQ+d6Wy';

Brazil2014.init(NAMES, MATCH_DETAILS);
$('#tabs #A').show();
$('#tabs #tab-links a').first().parent('div').addClass('active-tab');
$('#row2 #group-buttons').show();
var user_scores = location.search.slice(1);
Brazil2014.load(user_scores === '' ? SCORES: user_scores);

$('#tabs #tab-links a').on('click', function(e) {
    var currentAttrValue = $(this).attr('href');
    
    if (currentAttrValue === "#Bracket") {
        Brazil2014.populateBracket();
        $('#knockout-buttons').show().siblings().hide();
    }
    else {
        $('#group-buttons').show().siblings().hide();
    }

    // Show/Hide Tabs
    $('#tabs ' + currentAttrValue).show().siblings().hide();

    // Change/remove current tab to active
    $(this).parent('div').addClass('active-tab').siblings().removeClass('active-tab');
    e.preventDefault();
});

$(document).on('blur', '.score1, .score2', function() {
        var groupIndex = $(this).parents('.under-tab').attr('id').charCodeAt(0)-65;
        var matchID = parseInt($(this).parents(".matchRow").attr('id').substring(5));
        var matchIndex = 2*Math.floor((matchID-1)/16) + ((matchID-1) % 2);
        var score1 = $(this).parent(".result").children(".score1").val();
        var score2 = $(this).parent(".result").children(".score2").val()
        Brazil2014.groups[groupIndex].play(matchIndex, score1, score2);
});

$(document).on('keypress', '.score1, .score2', function(e) {
     if ( e.which == 13 ) {
        var groupIndex = $(this).parents('.under-tab').attr('id').charCodeAt(0)-65;
        var matchID = $(this).parents(".matchRow").attr('id').substring(5);
        var matchIndex = 2*Math.floor((matchID-1)/16) + ((matchID-1) % 2);
        var score1 = $(this).parent(".result").children(".score1").val();
        var score2 = $(this).parent(".result").children(".score2").val()
        Brazil2014.groups[groupIndex].play(matchIndex, score1, score2);
    }
});

$("#tzwrapper").on('change', "select", function() {
    Brazil2014.updateTimes(parseInt($(this).val()));
});

$("#buttons").on('click', "#save", function() {
    Brazil2014.save();
});
$("#buttons").on('click', "#load", function() {
    Brazil2014.load('');
});
$("#buttons").on('click', "#resetOne", function() {
    var g = $('#tabs #tab-links .active-tab a').attr('href').charCodeAt(1)-65;
    Brazil2014.load(SCORES, g);
});
$("#buttons").on('click', "#resetAll", function() {
    Brazil2014.load(SCORES);
});
$("#buttons").on('click', "#blankOne", function() {
    var g = $('#tabs #tab-links .active-tab a').attr('href').charCodeAt(1)-65;
    Brazil2014.groups[g].load('------------');
});
$("#buttons").on('click', "#blankAll", function() {
    Brazil2014.load('__+0');
});
$("#buttons").on('click', "#clearBracket", function() {
    Brazil2014.knockout.clear();
});
$("#Bracket").on('click', '.team-cell', function () {
    var idString = $(this).attr('id');
    var r = idString.charAt(1);
    var m = idString.charAt(4);
    var t = idString.charAt(7);
    Brazil2014.knockout.nodeClicked(r, m, t);
});

