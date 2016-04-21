//Send a message stating that this script started loading
chrome.runtime.sendMessage({ loading: "started" });

$("body").css("overflow-y", "scroll");

$("#somethingwentwrongdiv").css("display", "none");

//Set default colors
var linkout = "#C0C0C0";
var linkouthover = "#4D4D4D";
var linkin = "#E0E0E0";
var linkinhover = "#C2C2C2";

var scriptout = linkout;
var scriptouthover = linkouthover;
var scriptin = linkin;
var scriptinhover = linkinhover;

var menuout = linkout;
var menuouthover = scriptouthover;
var menuin = scriptin;
var menuinhover = scriptinhover;

var dividerout = menuout;
var dividerouthover = menuouthover;
var dividerin = menuin;
var dividerinhover = menuinhover;






//Change all localStorage-thingys into vars and declare all vars
var rows = localStorage.numberofrows;
var rowsplusone = parseInt(rows, 10) + parseInt(1, 10);
var randomvar = "no";
var otherrandomvar = "no";
var alltypes = new Array();
alltypes[0] = "nothing";
var howlongtowait = 0;
var numberofwaits = 0;
var howmuchtotheright = 0;
j = 0;
var showncode = "no";
var shownumbers = "no";
var countingvarthree = 0;
var onload = "yes";
var checkedall = "false";
var exportall = "false";
var bugsshown = "false";
var changelogshown = "false";
var onclosereset = "no";
var alreadywritten = "no";
var exportmode = "0";

if (localStorage.importstuff) {
	document.getElementById("inputarea").value = localStorage.importstuff;
	localStorage.removeItem("importstuff");
}

document.getElementById("searchcode").style.display = "none";

//Showing and hiding the piece of code
document.getElementById("showcode").onclick = function showandhidecode() {
	if (showncode == "no") {
		showncode = "yes";
		document.getElementById("showcode").innerHTML = "hide";
		document.getElementById("searchcode").style.display = "block";
	}
	else {
		document.getElementById("showcode").innerHTML = "show";
		document.getElementById("searchcode").style.display = "none";
		showncode = "no";
	}
}

//What happens when you change the options thing setting
document.getElementById("optionsshortcut").onchange = function changeoptionslink() {
	var t = document.getElementById("optionsshortcut").checked;
	localStorage.setItem("optionson", t);
}

//What happens when you click the tab change thingy
document.getElementById("whatpage").onchange = function changetab() {
	var u = document.getElementById("whatpage").checked;
	localStorage.setItem("whatpage", u);
}

//Load everything
var x = -1;
var y = 1000;
var infinitelooppreventer = 0;
var number = 1;
var localstoragenumber = 1;
var numbertext = number;
var howmanywaits = 0;

//Load options correctly first
if (localStorage.optionson == "true") {
	document.getElementById("optionsshortcut").checked = true;
}

if (localStorage.whatpage == "true") {
	document.getElementById("whatpage").checked = true;
}

//Load all settings
var rowsminusone = parseInt(rows, 10) + parseInt(1, 10);
var countingvartwo = 1;

var names = new Array();
var types = new Array();
var datas = new Array();
var theparentid = "1";
var rowsinmenu = 0;
var whichid = 1;
var whichidstring = "1";
var searchingvariable = "0";
var rowsplusone = parseInt(rows, 10) + parseInt(1, 10);
var marginfromleft = 0;
var marginvariable = 0;
var localstoragevariable = new Array();
var textvariable = "0";

while (countingvartwo < rowsplusone) {
	var allthedata = localStorage.getItem(countingvartwo);
	var dataarray = new Array();
	dataarray = allthedata.split("%123");

	var countingvartwominusone = parseInt(countingvartwo, 10) - parseInt(1, 10);

	names[countingvartwominusone] = dataarray[0];
	types[countingvartwominusone] = dataarray[1];
	datas[countingvartwominusone] = dataarray[2];

	countingvartwo++;
}

var mainthing = 0;



//Add the common sites
document.getElementById("addcommonsites").onclick = function addcommons() {
	var commonsitesvar = rowsplusone;
	localStorage.setItem(commonsitesvar, "Common Sites%123Menu%1239");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, "Google%123Link%123http://www.google.com");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, "Youtube%123Link%123http://www.youtube.com");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, "Wikipedia%123Link%123http://www.wikipedia.org");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, "Facebook%123Link%123http://www.facebook.com");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, "Twitter%123Link%123http://www.twitter.com");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, "Hotmail%123Link%123http://www.hotmail.com");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, "Gmail%123Link%123http://www.gmail.com");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, "Divider%123Divider%123");
	commonsitesvar++;
	localStorage.setItem(commonsitesvar, 'Add Row%123Script%1230%124/*execute locally*/ /*This is the addnewlink function*/ function addnewlink(pageurl) { var rows = localStorage.numberofrows; var rowsplusone = parseInt(rows, 10) + parseInt(1, 10); var rowsplustwo = parseInt(rows, 10) + parseInt(2, 10); var rowsplusthree = parseInt(rows, 10) + parseInt(3, 10); var x = 1; var name = "yolo"; name = prompt("Please enter what you want this link to be named", ""); var infinitelooppreventer = 1; if (name === "") { alert("cancelled"); } else { while (rowsplusthree > x) { if (localStorage.getItem(x)) { var y = localStorage.getItem(x); var z = y.search("//This is the addnewlink function"); if (z > -1) { var stuffbetween = "%"; var somevar = 1; while (somevar < rows) { var whereiscommonsitesvar = localStorage.getItem(somevar); var searchingvariablewoo = whereiscommonsitesvar.search("Common Sites"); if (searchingvariablewoo > -1) { var b = somevar; var c = localStorage.getItem(b); var e = c.length; if (e > 25) { var d = c.charAt(24); var f = c.charAt(25); d = d.toString(); f = f.toString(); d = d + f; } else { var d = c.charAt(24); } d = parseInt(d, 10) + parseInt(1, 10);	 var thingycombined = ("Common Sites" + stuffbetween + "123" + "Menu" + stuffbetween + "123" + d); localStorage.setItem(b, thingycombined); somevar = rows; } somevar++; } x--; var tempone = localStorage.getItem(x); var allthedatacombined = (name + stuffbetween + "123Link" + stuffbetween + "123" + pageurl); localStorage.setItem(x, allthedatacombined); x++; var temptwo = localStorage.getItem(x); localStorage.setItem(x, tempone); x++; tempone = localStorage.getItem(x); var stored = temptwo; while (rowsplustwo > x) { localStorage.setItem(x, stored); stored = tempone; x++; tempone = localStorage.getItem(x); infinitelooppreventer++; if (infinitelooppreventer === 3000) { alert("infinite loop"); x = rowsplustwo; x = rowsplusthree; return false; } } localStorage.numberofrows = rowsplusone; alert("Added"); chrome.runtime.sendMessage ({reload: "true"}); } } infinitelooppreventer++; if (infinitelooppreventer === 3000) { alert("infinite loop"); x = rowsplustwo; x = rowsplusthree; return false; } x++; } } } addnewlink(pageurl);');
	commonsitesvar++;
	var rowsplusten = parseInt(rows, 10) + parseInt(10, 10);
	localStorage.numberofrows = rowsplusten;

	chrome.runtime.sendMessage({ reload: "true" });
	window.location.reload();
}

//Add the search engines
document.getElementById("addsearchengines").onclick = function addsearchengines() {
	var searchenginesvar = rowsplusone;
	localStorage.setItem(searchenginesvar, "Search Engines%123Menu%1235");
	searchenginesvar++;
	localStorage.setItem(searchenginesvar, 'Search Google%123Script%1230%124/*execute locally*/ function searchgoogle(selectiontext) { if (selectiontext===undefined) { var whattab = localStorage.whatpage; var x = prompt("Search google for what",""); x = x.replace(" ","%20"); var y = ("https://google.com/search?q=" + x); if (whattab == "false") { chrome.tabs.create({url:y}); } else { chrome.tabs.update({url:y}); } } else { var whattab = localStorage.whatpage; var x = selectiontext; x = x.replace(" ","%20"); var y = ("https://google.com/search?q=" + x); if (whattab == "false") { chrome.tabs.create({url:y}); } else { chrome.tabs.update({url:y}); } } } searchgoogle(selectiontext);');
	searchenginesvar++;
	localStorage.setItem(searchenginesvar, 'Search Youtube%123Script%1230%124/*execute locally*/ function searchyoutube(selectiontext) { if (selectiontext===undefined) { var whattab = localStorage.whatpage; var x = prompt("Search youtube for what",""); x = x.replace(" ","%20"); var y = ("https://youtube.com/results?search_query=" + x); if (whattab == "false") { chrome.tabs.create({url:y}); } else { chrome.tabs.update({url:y}); } } else { var whattab = localStorage.whatpage; var x = selectiontext; x = x.replace(" ","%20"); var y = ("https://youtube.com/results?search_query=" + x); if (whattab == "false") { chrome.tabs.create({url:y}); } else { chrome.tabs.update({url:y}); } } } searchyoutube(selectiontext);');
	searchenginesvar++;
	localStorage.setItem(searchenginesvar, 'Search Wikipedia%123Script%1230%124/*execute locally*/ function searchwikipedia(selectiontext) { if (selectiontext===undefined) { var whattab = localStorage.whatpage; var x = prompt("Search wikipedia for what",""); x = x.replace(" ","%20"); var y = ("https://wikipedia.org/wiki/" + x); if (whattab == "false") { chrome.tabs.create({url:y}); } else { chrome.tabs.update({url:y}); } } else { var whattab = localStorage.whatpage; var x = selectiontext; x = x.replace(" ","%20"); var y = ("https://wikipedia.org/wiki/" + x); if (whattab == "false") { chrome.tabs.create({url:y}); } else { chrome.tabs.update({url:y}); } } } searchwikipedia(selectiontext);');
	searchenginesvar++;

	localStorage.setItem(searchenginesvar, "Divider%123Divider%1230%124");
	searchenginesvar++;

	//Assembling the entire code for CREATING search engines

	var partone = '/*execute locally*/ /*This is the addnewsearchengine function*/ function addnewsearchengine(pageurl) { var rows = localStorage.numberofrows; var rowsplusone = parseInt(rows, 10) + parseInt(1, 10); var rowsplustwo = parseInt(rows, 10) + parseInt(2, 10); var rowsplusthree = parseInt(rows, 10) + parseInt(3, 10); var x = 1; var wrongurl = "false"; var infinitelooppreventer = 0; if (localStorage.waitforsearch == "true") { var manual = confirm("Do you want to enter the URL manually? (press cancel to let the extension try)"); localStorage.waitforsearch = "false"; if (manual == true) { pageurl = prompt("Please enter the URL", ""); } } var name = prompt("Please enter what you want this search engine to be named",""); if (name === "" || name === undefined || name === null) { alert("cancelled"); return false; } var searchedurl = pageurl.search("customrightclickmenu"); if (searchedurl > -1) { alert("The extension is now going to try and see if this link works"); var url = ""; var searchword = "random%20search%20 input"; searchword = searchword.replace(/ /g, "%20"); var previousurl = pageurl; url = pageurl.replace(/customrightclickmenu/g, searchword); chrome.tabs.create({url:url}); var diditwork = confirm("Did it search for random search input? press OK if it did."); if (diditwork == true) { alert("Okay, the extension will now add the search URL"); } else { alert(';
	var thingy = "'";
	var parttwo = 'Okay, please go to the options page and click the "Show" button, then try to get a search URL that way. The next time you click the "Add Seach Engine" button, it will ask you for the new URL.';
	var partthree = '); localStorage.setItem("waitforsearch", "true"); name = ""; wrongurl = "true"; } } else { alert(';
	var partfour = 'Please search the site for "customrightclickmenu" (without quotes) and try again.';
	var partfive = '); name = ""; wrongurl = "true"; } if (name === "" || name === undefined || name === null) { } else { if (wrongurl == "true"){rowsplusthree = x; return false; } while (rowsplusthree > x) { if (localStorage.getItem(x)) { var y = localStorage.getItem(x); var z = y.search("This is the addnewsearchengine function"); if (z > -1) { var stuffbetween = "%"; var somevar = 1; while (somevar < rows) { var whereiscommonsitesvar = localStorage.getItem(somevar); var searchingvariablewoo = whereiscommonsitesvar.search("Search Engines"); if (searchingvariablewoo > -1) { var b = somevar; var c = localStorage.getItem(b); var e = c.length; if (e > 27) { var d = c.charAt(26); var f = c.charAt(27); d = d.toString(); f = f.toString(); d = d + f; } else { var d = c.charAt(26); } d = parseInt(d, 10) + parseInt(1, 10); var thingycombined = ("Search Engines" + stuffbetween + "123" + "Menu" + stuffbetween + "123" + d); localStorage.setItem(b, thingycombined); somevar = rows; } somevar++; } x--; var tempone = localStorage.getItem(x); var slash = "/"; var asterisk = "*"; var firstpart = slash + asterisk + ';
	var partsix = 'execute locally';
	var partseven = ' + asterisk + slash + ';
	var parteight = 'function dasearchfunction(selectiontext) { if (selectiontext === undefined) { var whattab = localStorage.whatpage; var x = prompt("search ';
	var partnine = '; var secondpart = ';
	var partten = ' for what? ",""); x = x.replace(/ /g,"%20"); var y = "';
	var parteleven = '; var thirdpart = ';
	var parttwelve = '"; y = y.replace(/customrightclickmenu/g,x); if (whattab == "true") { chrome.tabs.update({url:y});}else{chrome.tabs.create({url:y});}}else{ var whattab = localStorage.whatpage; var x = selectiontext; x = x.replace(/ /g,"%20"); var y = "';
	var partthirteen = '; var fourthpart = ';
	var partfourteen = '"; y = y.replace(/customrightclickmenu/g,x); if (whattab == "false") { chrome.tabs.create({url:y});}else{chrome.tabs.update({url:y});}}} dasearchfunction(selectiontext);';
	var partfifteen = '; var thecode = (firstpart + name + secondpart + previousurl + thirdpart + previousurl + fourthpart); var allthedatacombined = (name + stuffbetween + "123Script" + stuffbetween + "1230" + stuffbetween + "124" + thecode); localStorage.setItem(x, allthedatacombined); x++; var temptwo = localStorage.getItem(x); localStorage.setItem(x, tempone); x++; tempone = localStorage.getItem(x); var stored = temptwo; while (rowsplustwo > x) { localStorage.setItem(x, stored); stored = tempone; x++; tempone = localStorage.getItem(x); infinitelooppreventer++; if (infinitelooppreventer === 3000) { alert("infinite loop"); x = rowsplustwo; x = rowsplusthree; return false; } } localStorage.numberofrows = rowsplusone; chrome.runtime.sendMessage ({reload: "true"}); alert("Done"); } } infinitelooppreventer++; if (infinitelooppreventer === 3000) { alert("infinite loop"); x = rowsplustwo; x = rowsplusthree; return false; } x++; } } } addnewsearchengine(pageurl);';

	var allthisstuffputtogether = (partone + thingy + parttwo + thingy + partthree + thingy + partfour + thingy + partfive + thingy + partsix + thingy + partseven + thingy + parteight + thingy + partnine + thingy + partten + thingy + parteleven + thingy + parttwelve + thingy + partthirteen + thingy + partfourteen + thingy + partfifteen);
	var stuffplusotherstuff = ("Add Search Engine%123Script%1230%124" + allthisstuffputtogether);

	localStorage.setItem(searchenginesvar, stuffplusotherstuff);

	var rowsplussix = parseInt(rows, 10) + parseInt(6, 10);
	localStorage.numberofrows = rowsplussix;

	chrome.runtime.sendMessage({ reload: "true" });
	window.location.reload();
}


document.getElementById("importit").onclick = function importitems() {
	var allthedata = document.getElementById("inputarea").value;

	var superarray = [];

	superarray = allthedata.split("%146%");

	if (superarray[0] == "all") {
		//Import ALL data

		localStorage.setItem("firsttime", superarray[1]);
		localStorage.setItem("optionson", superarray[2]);
		localStorage.setItem("waitforsearch", superarray[3]);
		localStorage.setItem("whatpage", superarray[4]);
		localStorage.setItem("numberofrows", superarray[5]);

		var importvar = 1;
		var arrayvariablewoobzelflitsels = 6;

		var newrowsplusone = parseInt(localStorage.numberofrows, 10) + parseInt(1, 10);

		while (newrowsplusone > importvar) {
			localStorage.setItem(importvar, superarray[arrayvariablewoobzelflitsels]);

			arrayvariablewoobzelflitsels++;
			importvar++;
		}

		alert("done!");

	}
	else {
		//Import just rows

		var allthatdatajwz = document.getElementById("inputarea").value;
		var entirearray = [];
		entirearray = allthatdatajwz.split("%146%");

		var halfofit = entirearray.length / 2;

		var firstspot = rowsplusone;

		localStorage.numberofrows = parseInt(rows, 10) + parseInt(halfofit, 10);
		var danumberone = 1;

		while (danumberone < localStorage.numberofrows) {
			localStorage.setItem(firstspot, entirearray[halfofit]);

			firstspot++;
			halfofit++;
			danumberone++;
		}

		alert("done!");

		localStorage.setItem("importstuff", allthatdatajwz);

		window.location.reload();

	}

}

document.getElementById("bugsandsuggestions").onclick = function showorhidebugs() {
	if (bugsshown == "false") {
		document.getElementById("bugsandsuggestionsdiv").style.display = "";
		document.getElementById("bugsandsuggestions").innerHTML = "Hide";
		bugsshown = "true";
	}
	else {
		document.getElementById("bugsandsuggestionsdiv").style.display = "none";
		document.getElementById("bugsandsuggestions").innerHTML = "Show";
		bugsshown = "false";
	}
}


document.getElementById("showchangelog").onclick = function showorhidebugs() {
	if (changelogshown == "false") {
		document.getElementById("changelog").style.display = "";
		document.getElementById("showchangelog").innerHTML = "Hide";
		changelogshown = "true";
	}
	else {
		document.getElementById("changelog").style.display = "none";
		document.getElementById("showchangelog").innerHTML = "Show";
		changelogshown = "false";
	}
}

//Load it all

function paintsettings() {
	//Reset all previous stuf

	rows = localStorage.numberofrows;
	rowsplusone = parseInt(rows, 10) + parseInt(1, 10);
	alltypes = new Array();

	//Reset everything if it is a repaint
	$("#wheretheboxesgo").html('<div class="boxesrow" id="rownumber1"></div>');
	$("#sidethingsdiv").html("");

	var aa = 1;
	var functionarray = [];
	var ca = 1;
	var cd = 1;
	var ce = 100;
	var cg = "nothing";
	var ch = "1";
	var whatrow = 1;
	var highestwidth = 1;
	var justchanged = "false";
	var othervar = 1;
	var outerring = "";

	while (aa < rowsplusone) {
		//Getting the name of the row from localstorage
		var ae = localStorage.getItem(aa);
		var af = [];
		af = ae.split("%123");
		var ag = af[0];

		//If menu-stuff happened before
		if (cg != "nothing") {
			//Vars to use here, whatrow, cg, ch

			if (af[1] == "Link") {
				outerring = "Linkoutside";
			}
			if (af[1] == "Script") {
				outerring = "Scriptoutside";
			}
			if (af[1] == "Menu") {
				outerring = "Menuoutside";
			}
			if (af[1] == "Divider") {
				outerring = "Divideroutside";
			}

			document.getElementById("rownumber" + whatrow).innerHTML += ('<input type="checkbox" id="itemcheckbox' + aa + '"" class="checkboxes"><div id="rowie' + aa + '" class="' + outerring + '"><div id="add' + aa + '" class="addbutton">+</div><div id="remove' + aa + '" class="removebutton">x</div><div id="thingy' + aa + '" class="tenpercent"></div><div id="block' + aa + '" class="block"><div id="otherthing' + aa + '" class="fifteenpercent"></div>' + ag + '</div></div><br>');



			$("#add" + aa).hide();
			$("#remove" + aa).hide();

			if (justchanged == "true") {
				justchanged = "false";

				var ck = ch * 60;

				ck = ck - 60;

				//What if this row was already written to
				var qa = $("#rowie" + aa).parent().attr("id");
				var qb = $("#" + qa + "> div").size();
				if (qb > 1) {
					var qc = document.getElementById(qa).getElementsByTagName("div");
					var qd = qc.length;
					var qe = 0;

					while (qd > qe) {
						var qf = qc[qe];
						if ($(qf).css("margin-top") != "0px" && $(qf).css("margin-top") != "auto") {
							if (qh != 0) {
								qg = $(qf).css("margin-top");
								var qi = qg.split("px");
								qh = parseInt(qh, 10) + parseInt(qi[0], 10);
							}
							else {
								var qg = $(qf).css("margin-top");
								var qh = qg.split("px");
								qh = qh[0];
							}

						}
						qe++;
					}
					qh = parseInt(qh, 10) - 20.640625;

					qb--;
					//The ones that are actually there, the blocks themselves


					var qj = parseInt(qb, 10) * 0.055555 * parseInt(screen.height, 10);

					if (screen.height == 900 || screen.height == 800) {
						var qj = parseInt(qb, 10) * 0.067 * parseInt(screen.height, 10);
					}

					qj = qj + parseInt(qh, 10);



					ck = ck - qj;
					ck = ck - 20.109375
					document.getElementById("rowie" + aa).style.marginTop = (ck + "px");
					document.getElementById("itemcheckbox" + aa).style.marginTop = (ck + "px");
					qh = 0;
				}
				else {
					document.getElementById("rowie" + aa).style.marginTop = (ck + "px");
					document.getElementById("itemcheckbox" + aa).style.marginTop = (ck + "px");
					qh = 0;
				}

			}

			var co = 0;
			var cq = whatrow;

			cq--;

			while (cq > co) {
				if (cj != "0") {
					document.getElementById("rownumber" + cq).innerHTML += ('<div class="aroundblock"></div><br>');
				}

				cq--;
			}

		}
		else {

			if (af[1] == "Link") {
				outerring = "Linkoutside";
			}
			if (af[1] == "Script") {
				outerring = "Scriptoutside";
			}
			if (af[1] == "Menu") {
				outerring = "Menuoutside";
			}
			if (af[1] == "Divider") {
				outerring = "Divideroutside";
			}

			//writing a block
			document.getElementById("rownumber1").innerHTML += ('<input type="checkbox" id="itemcheckbox' + aa + '"" class="checkboxes"><div id="rowie' + aa + '" class="' + outerring + '"><div id="add' + aa + '" class="addbutton">+</div><div id="remove' + aa + '" class="removebutton">x</div><div id="thingy' + aa + '" class="tenpercent"></div><div id="block' + aa + '" class="block"><div id="otherthing' + aa + '" class="fifteenpercent"></div>' + ag + '</div></div><br>');


			$("#add" + aa).hide();
			$("#remove" + aa).hide();

		}

		if (af[1] == "Menu") {
			//Create new row

			ca++;
			document.getElementById("wheretheboxesgo").innerHTML += ('<div class="boxesrow" id="rownumber' + ca + '"></div>');
			document.getElementById("block" + aa).innerHTML = ('<div id="otherthing' + aa + '"class="fifteenpercent"></div>' + ag + ' ->');

			localStorage.setItem("waitingthing" + ca, af[2] + "," + othervar + "," + 1);
			othervar--;
		}

		cd = 1;
		ce = 100;

		while (ce > cd) {
			if (localStorage.getItem("waitingthing" + ce)) {
				var cb = localStorage.getItem("waitingthing" + ce);
				var cf = [];
				cf = cb.split(",");

				cg = cf[0];
				ch = cf[1];

				var cj = parseInt(cg, 10) - parseInt(1, 10);

				if (cg == "0") {
					localStorage.removeItem("waitingthing" + ce);
					ca--;
				}
				else {
					localStorage.setItem("waitingthing" + ce, cj + "," + ch);
					whatrow = ce;

					if (cf[2] == "1") {
						justchanged = "true";
					}

					if (whatrow > highestwidth) {
						highestwidth = whatrow;
					}

					ce = cd;
				}
			}

			var ci = parseInt(ce, 10) - parseInt(1, 10);

			if (ci == cd) {
				cg = "nothing";
			}

			ce--;
		}


		aa++;
		othervar++;
	}


	//Removing all localStorage items with the write stuff in it
	var var1 = 0;
	var var2 = 1000;
	while (var2 > var1) {
		if (localStorage.getItem("waitingthing" + var2)) {
			localStorage.removeItem("waitingthing" + var2);
		}
		var2--;
	}

	//Setting the margin-top for the stuff below
	var db = 70 * $("#rownumber1 > div").size();
	db = db - 40;
	document.getElementById("randomanchor").style.marginTop = db + "px";
	db = db - 120
	var dc = db - 160;
	dc = dc / 2;

	//Showing the numbers on top
	var hd = highestwidth;
	hd++;
	var ha = 1;
	var hb = 10.8;
	while (hd > ha) {
		var hc = hb + "%";
		document.getElementById("wheretheboxesgo").innerHTML += ('<div class="numberdiv" style="margin-left:' + hc + ';"><b>' + ha + '</b></div>');

		hb = hb + 15.4;
		ha++;
	}


	//Now putting all that stuff on the right width-hight stuff
	var da = highestwidth / 2;


	var fa = da * 2
	var gb = fa;
	fa++;
	var fb = 4.8;
	var fc = 1;
	var buttoncreated = "no";

	while (fa > fc) {
		document.getElementById("rownumber" + fc).style.marginLeft = fb + "%";

		fc++;
		fb = fb + 15.4;
	}

	if (da > 3) {


		//Scrolling to right      

		//document.getElementById("sidethingsdiv").innerHTML += ('<div id="leftscrolldivider" style="height:' + db + 'px" class="scrolldiv"><img src="Thumbnails/arrow.png" style="width:50%; height:136px; margin-left:30px; margin-top:' + dc + 'px;"></div>');

		document.getElementById("sidethingsdiv").innerHTML += ('<div id="rightscrolldivider" style="height:' + db + 'px" class="scrolldiv"><img src="Thumbnails/arrowright.png" style="width:80%; height:136px; margin-left:5px; margin-top:' + dc + 'px;"></div>');

		var ff = 1;

		//invisible ones
		var fh = da - 3;
		var fi = da + 4;

		//Scroll right
		document.getElementById("rightscrolldivider").onclick = function () {
			ff = 1;

			$("#wheretheboxesgo").animate({ marginLeft: "-=15.4%" });

			setTimeout(function () {

				//Create the go-to-left-button
				if (buttoncreated == "no") {
					document.getElementById("sidethingsdiv").innerHTML += ('<div id="leftscrolldivider" style="height:' + db + 'px" class="scrolldiv"><img src="Thumbnails/arrow.png" style="width:50%; height:136px; margin-left:30px; margin-top:' + dc + 'px;"></div>');

					//Declare the go-to-right-onclicks again
					document.getElementById("rightscrolldivider").onclick = function () {
						ff = 1;

						$("#wheretheboxesgo").animate({ marginLeft: "-=15.4%" });

						//Deciding if left one needs to be shown again
						setTimeout(function () {

							//Making the right-thing disappear when it has to again
							var ha = document.getElementById("rownumber1").style.marginLeft;
							ha = ha.split("%");
							ha = ha[0];
							var hc = document.getElementById("wheretheboxesgo").style.marginLeft;
							hc = hc.split("%");
							hc = hc[0];
							if (hc.search("-") > -1) {
								hc = hc.split("-");
								hc = hc[1];
							}
							var hd = parseInt(ha, 10) - parseInt(hc, 10);
							//Show left bar
							if (hd < 4) {
								$("#leftscrolldivider").css("display", "");
							}
						}, 400);

						setTimeout(function () {


							//Check if we need a go-to-right-button
							var ga = document.getElementById("rownumber" + gb).style.marginLeft;
							ga = ga.split("%");
							ga = ga[0];
							var gc = document.getElementById("wheretheboxesgo").style.marginLeft;
							gc = gc.split("%");
							gc = gc[0];
							gc = gc.split("-");
							gc = gc[1];
							var gd = parseInt(ga, 10) - parseInt(gc, 10);
							if (gd < 95) {
								$("#rightscrolldivider").css("display", "none");
							}
							//End of right onclicks
							//Now declaring go-to-left-onclicks      

							document.getElementById("leftscrolldivider").onclick = function () {
								$("#wheretheboxesgo").animate({ marginLeft: "+=15.4%" });


								setTimeout(function () {

									//Making the left-thing disappear when it has to again
									var ga = document.getElementById("rownumber1").style.marginLeft;
									ga = ga.split("%");
									ga = ga[0];
									var gc = document.getElementById("wheretheboxesgo").style.marginLeft;
									gc = gc.split("%");
									gc = gc[0];
									var gd = parseInt(ga, 10) - parseInt(gc, 10);
									//Remove left bar
									if (gd == 4) {
										$("#leftscrolldivider").css("display", "none");
									}
								}, 400);

								setTimeout(function () {

									//Making the right thingy appear again when it has to
									var ge = document.getElementById("rownumber" + gb).style.marginLeft;
									ge = ge.split("%");
									ge = ge[0];
									var gf = document.getElementById("wheretheboxesgo").style.marginLeft;
									gf = gf.split("%");
									gf = gf[0];
									if (gf.search("-") > -1) {
										gf = gf.split("-");
										gf = gf[1];
									}
									var gg = parseInt(ge, 10) - parseInt(gf, 10);
									//Remove right bar
									if (gg > 95) {
										$("#rightscrolldivider").css("display", "");
									}

								}, 400);

							}

						}, 400);
					}

					buttoncreated = "yes";
				}
				//End of the new-left-button stuff

				//Check if we need a go-to-left-button
				var ga = document.getElementById("rownumber" + gb).style.marginLeft;
				ga = ga.split("%");
				ga = ga[0];
				var gc = document.getElementById("wheretheboxesgo").style.marginLeft;
				gc = gc.split("%");
				gc = gc[0];
				gc = gc.split("-");
				gc = gc[1];
				var gd = parseInt(ga, 10) - parseInt(gc, 10);
				//Remove right bar
				if (gd < 95) {
					$("#rightscrolldivider").css("display", "none");
				}


				if (buttoncreated == "yes") {

					//Deciding if left one needs to be shown again
					setTimeout(function () {

						//Making the left-thing disappear when it has to again
						var ha = document.getElementById("rownumber1").style.marginLeft;
						ha = ha.split("%");
						ha = ha[0];
						var hc = document.getElementById("wheretheboxesgo").style.marginLeft;
						hc = hc.split("%");
						hc = hc[0];
						if (hc.search("-") > -1) {
							hc = hc.split("-");
							hc = hc[1];
						}
						var hd = parseInt(ha, 10) - parseInt(hc, 10);
						//Show left bar
						if (gd < 4) {
							$("#leftscrolldivider").css("display", "");
						}
					}, 400);

					//Now declaring go-to-left-onclicks      
					document.getElementById("leftscrolldivider").onclick = function () {
						$("#wheretheboxesgo").animate({ marginLeft: "+=15.4%" });

						setTimeout(function () {

							//Making the left-thing disappear when it has to again
							var ga = document.getElementById("rownumber1").style.marginLeft;
							ga = ga.split("%");
							ga = ga[0];
							var gc = document.getElementById("wheretheboxesgo").style.marginLeft;
							gc = gc.split("%");
							gc = gc[0];
							var gd = parseInt(ga, 10) - parseInt(gc, 10);
							//Remove left bar
							if (gd == 4) {
								$("#leftscrolldivider").css("display", "none");
							}
						}, 400);

						setTimeout(function () {

							//Making the right thingy appear again when it has to
							var ge = document.getElementById("rownumber" + gb).style.marginLeft;
							ge = ge.split("%");
							ge = ge[0];
							var gf = document.getElementById("wheretheboxesgo").style.marginLeft;
							gf = gf.split("%");
							gf = gf[0];
							gf = gf.split("-");
							gf = gf[1];
							var gg = parseInt(ge, 10) - parseInt(gf, 10);
							//Show right bar
							if (gg > 95) {
								$("#rightscrolldivider").css("display", "");
							}

						}, 400);

					}

				}


			}, 400);

		}
	}

	document.getElementById("rownumber1").innerHTML += ('<div id="plusblock" class="aroundblock"><img style="height:40px;" id="addnewimage" src="Thumbnails/lightplus.png"></div>');

	$("#plusblock").hover(function () {

		$("#addnewimage").attr("src", "Thumbnails/plus.png");

	}, function () {

		$("#addnewimage").attr("src", "Thumbnails/lightplus.png");

	});

	$("#plusblock").click(function () {

		var aea = localStorage.numberofrows;
		aea++;

		localStorage.setItem(aea, "Name%123Link%123");
		localStorage.setItem("numberofrows", aea);

		paintsettings();

	})


	$('.Scriptoutside').click(function openeditingbox(event, id) {

		if (exportmode == "1") {
			var ab = event.target.id;
			if (ab.search("rowie") > -1) {
				var ac = ab.split("rowie");
				var ad = ac[1];
			}
			if (ab.search("thingy") > -1) {
				var ac = ab.split("thingy");
				var ad = ac[1];
			}
			if (ab.search("block") > -1) {
				var ac = ab.split("block");
				var ad = ac[1];
			}
			if (ab.search("otherthing") > -1) {
				var ac = ab.split("otherthing");
				var ad = ac[1];
			}

			if (!ad) {
				return false;
			}

			if (document.getElementById("itemcheckbox" + ad).checked === false) {
				$("#itemcheckbox" + ad).attr("checked", "true");
			}
			else {
				$("#itemcheckbox" + ad).removeAttr("checked");
			}
		}
		else {

			if (id === undefined) {

				var ab = event.target.id;

				if (ab.search("rowie") > -1) {
					var ac = ab.split("rowie");
					var ad = ac[1];
				}
				if (ab.search("thingy") > -1) {
					var ac = ab.split("thingy");
					var ad = ac[1];
				}
				if (ab.search("block") > -1) {
					var ac = ab.split("block");
					var ad = ac[1];
				}
				if (ab.search("otherthing") > -1) {
					var ac = ab.split("otherthing");
					var ad = ac[1];
				}

				if (!ad) {
					return false;
				}

			}
			else {
				var ad = id;
			}

			//Displaying the edit screen

			document.getElementById("details").style.webkitTransform = "scale(1)";
			document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
			document.getElementById("details").style.webkitTransitionDuration = "250ms";
			document.getElementById("darkbackground").style.display = "block";
			document.getElementById("darkbackground").style.webkitAnimation = "colorchange 1s";

			//Filling in the edit screen

			var allboxdata = localStorage.getItem(ad);

			allboxdata = allboxdata.split("%123");

			var childornot = "none";

			if (allboxdata[1] == "Script") {
				var splitallboxdatathing = allboxdata[2].split("%124");
				whatinsidetheinputstuff = splitallboxdatathing[1];

				if (screen.width > 1919) {

					document.getElementById("editingbox").innerHTML = ('<div class="startingdiv"><center><div id="nametext">Now editing <b>script</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside"><div id="whentorun">Run at: <select id="whenwillitrun"><option id="onnclick">On Click</option><option id="onvisit">On Visiting:</option><option id="always">Always run</option></select><div id="questionmark" title=" ">?</div><div id="whentorundiv">Run on visiting:<input id="whendoesitrun" size="100"><div id="questionmarktwo" title=" ">?</div></div></div>You can edit JavaScript code here, however i recommend editing on <a href="http://www.jsbin.com" target="_blank">JsBin</a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <div id="greenbutton"><img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png"></div>&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><image id="gearicon" title=" " src="Thumbnails/gear.png" style="margin-top:1px; margin-left:2px;" width="20px" height="20px"><br><textarea id="editinputarea" cols="130" rows="30">' + whatinsidetheinputstuff + '</textarea></div><div id="rightside"><div style="position:absolute;margin-top:-1%;font-size:100%;"><b>Note:</b><br>Most scripts wont work on this page</div><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div><div class="settingsdiv" ><div id="titledivider"><center><b>Stuff to know and editing settings for Script</b><br><hr></center></div><div id="leftsettinsside"><center>Every script by default has jquery 2.0.3 in it, this is included by default and whether to use it is your choice. <br>You can add the line /*execute locally*/ to your code and it will execute in the extension instead of on the page, this gives it additional permissions such as the ability to see what you selected when you clicked it, or other information about the page.<br> By default you have the permissions to open tabs (<a href="http://developer.chrome.com/extensions/tabs.html" target="_blank">chrome.tabs</a>) and the ability to see what you did while clicking right-mouse-button (<a href="http://developer.chrome.com/extensions/contextMenus.html#type-OnClickData" target="_blank">Chrome.contextMenus onclickdata</a>), the way to use these is to put the property (linkUrl, pageUrl,selectionText or whatever) in the function this way:<br> function myfunction(pageurl)<br><br>Be sure to put the property in all lower case. This will declare the function, and later on you can execute it like on the end of your script with the code:<br> myfunction(pageurl);<br><br>You even the ability to create right-mouse-click-menus but that is already covered by the extension. Due to that being quite limited if you look at the entire range of <a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">chrome APIs,</a>, and not wanting to prompt users for unnessecary permissions on installing, I have made it possible to ask for additional permissions on the right side of this page. These Chrome APIs can then be used by you, and you can cover even more with programming.<br> Users seeing "wants to acces all data on harddrive" on install probably do not trust it, that is why you can ask for permissions on the right. Simply click the button, and give permission depending on if you want it, you can then use the linked chrome API to increase the things you can do.<br>There are also a few spots you can NOT use in storing things in the <b>extensions</b> localStorage. These places are <b>any number on its own, firsttime, numberofrows, optionson, scriptoptions, waitforsearch, whatpage</b>, the rest can be used normally.<br>You can use this piece of code:  chrome.runtime.sendMessage ({reload: "true"}); to refresh the right-mouse-menu.<br> Below are some options for programming in this extension.<br><hr><input type="checkbox" id="showdot">Checking this will display a colored dot instead of the line /*execute locally*/</center><br></div><div id="rightsettingsside"><div id="leftsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="alarmspermission">Alarms</button>&nbsp;<a target="_blank" href="http://developer.chrome.com/extensions/alarms.html">chrome.alarms</a></div><hr><div class="permissiondiv"><button id="backgroundpermission">background</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">background</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="browsingdatapermissions">browsingData</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/browsingData">chrome.browsingData</a></div><hr><div class="permissiondiv"><button id="bookmarkspermission">bookmarks</button>&nbsp;<a href="http://developer.chrome.com/extensions/bookmarks.html" target="_blank">chrome.bookmarks</a></div><hr><div class="permissiondiv"><button id="clipboardreadpermission">clipboardRead</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardRead</a></div><hr><div class="permissiondiv"><button id="clipboardwritepermission">clipboardWrite</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardWrite</a></div><hr><div class="permissiondiv"><button id="contentsettingspermission">contentSettings</button>&nbsp;<a href="http://developer.chrome.com/extensions/contentSettings.html" target="_blank">chrome.contentSettings</a></div><hr><div class="permissiondiv"><button id="cookiespermission">cookies</button><a href="http://developer.chrome.com/extensions/cookies.html" target="_blank">chrome.cookies</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="desktopcapturepermission">desktopCapture</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/desktopCapture">chrome.desktopCapture</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="downloadspermission">downloads</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/downloads">chrome.downloads</a></div><hr><div class="permissiondiv"><button id="historypermission">history</button>&nbsp;<a href="http://developer.chrome.com/extensions/history.html" target="_blank">chrome.history</a></div></div><div id="rightsideofrightside"><div class="permissiondiv"><button id="idlepermission">idle</button>&nbsp;<a href="http://developer.chrome.com/extensions/idle.html" target="_blank">chrome.idle</a></div><hr><div style="margin-top:3%;" class="permissiondiv"><button id="managementpermission">management</button>&nbsp;<a href="http://developer.chrome.com/extensions/management.html" target="_blank">chrome.management</a></div><hr><div class="permissiondiv"><button id="notificationsidv">notifications</button>&nbsp;<a href="http://developer.chrome.com/extensions/desktop_notifications.html" target="_blank">Desktop Notifications</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="powerpermission">power</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/power">chrome.power</a></div><hr><div class="permissiondiv"><button id="privacypermission">privacy</button>&nbsp;<a href="http://developer.chrome.com/extensions/privacy.html" target="_blank">chrome.privacy</a></div><hr><div class="permissiondiv"><button id="storagepermission">storage</button>&nbsp;<a href="http://developer.chrome.com/extensions/storage.html" target="_blank">chrome.storage</a></div><hr><div class="permissiondiv"><button id="topsitespermission">topSites</button> &nbsp;<a href="http://developer.chrome.com/extensions/topSites.html" target="_blank">chrome.topSites</a></div><hr><div class="permissiondiv"><button id="ttspermission">tts</button>&nbsp;<a href="http://developer.chrome.com/extensions/tts.html" target="_blank">chrome.tts</a></div><hr><div class="permissiondiv"><button id="webnavigationpermission">webNavigation</button>&nbsp;<a href="http://developer.chrome.com/extensions/webNavigation.html" target="_blank">chrome.webNavigation</a></div><hr><div class="permissiondiv"><button id="webrequestpermission">webRequest</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequest</a></div><hr><div class="permissiondiv"><button id="webrequestblockingpermission">webRequestBlocking</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequestBlocking</a></div></div></div><div id="bottomsettingsside"><div id="optionsbackbutton"><center><br><br><b>Back</b><br>Go back to script editing page</center></div><div id="optionsexitbutton"><center><br><br><b>Exit</b><br>Close this popup</center></div></div></div>');
				}

				if (screen.width < 1920 && screen.width > 1679) {
					document.getElementById("editingbox").innerHTML = ('<div class="startingdiv"><center><div id="nametext">Now editing <b>script</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside"><div id="whentorun">Run at: <select id="whenwillitrun"><option id="onnclick">On Click</option><option id="onvisit">On Visiting:</option><option id="always">Always run</option></select><div id="questionmark" title=" ">?</div><div id="whentorundiv">Run on visiting:<input id="whendoesitrun" size="100"><div id="questionmarktwo" title=" ">?</div></div></div>You can edit JavaScript code here, however i recommend editing on <a href="http://www.jsbin.com" target="_blank">JsBin</a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <div id="greenbutton"><img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png"></div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><image id="gearicon" title=" " src="Thumbnails/gear.png" style="margin-top:1px; margin-left:2px;" width="20px" height="20px"><br><textarea id="editinputarea" cols="118" rows="28">' + whatinsidetheinputstuff + '</textarea></div><div id="rightside"><div style="position:absolute;margin-top:-1%;font-size:100%;"><b>Note:</b><br>Most scripts wont work on this page</div><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1.4%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div><div class="settingsdiv" ><div id="titledivider"><center><b>Stuff to know and editing settings for Script</b><br><hr></center></div><div id="leftsettinsside"><center>Every script by default has jquery 2.0.3 in it, this is included by default and whether to use it is your choice. <br>You can add the line /*execute locally*/ to your code and it will execute in the extension instead of on the page, this gives it additional permissions such as the ability to see what you selected when you clicked it, or other information about the page.<br> By default you have the permissions to open tabs (<a href="http://developer.chrome.com/extensions/tabs.html" target="_blank">chrome.tabs</a>) and the ability to see what you did while clicking right-mouse-button (<a href="http://developer.chrome.com/extensions/contextMenus.html#type-OnClickData" target="_blank">Chrome.contextMenus onclickdata</a>), the way to use these is to put the property (linkUrl, pageUrl,selectionText or whatever) in the function this way:<br> function myfunction(pageurl)<br><br>Be sure to put the property in all lower case. This will declare the function, and later on you can execute it like on the end of your script with the code:<br> myfunction(pageurl);<br><br>You even the ability to create right-mouse-click-menus but that is already covered by the extension. Due to that being quite limited if you look at the entire range of <a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">chrome APIs,</a>, and not wanting to prompt users for unnessecary permissions on installing, I have made it possible to ask for additional permissions on the right side of this page. These Chrome APIs can then be used by you, and you can cover even more with programming.<br> Users seeing "wants to acces all data on harddrive" on install probably do not trust it, that is why you can ask for permissions on the right. Simply click the button, and give permission depending on if you want it, you can then use the linked chrome API to increase the things you can do.<br>There are also a few spots you can NOT use in storing things in the <b>extensions</b> localStorage. These places are <b>any number on its own, firsttime, numberofrows, optionson, scriptoptions, waitforsearch, whatpage</b>, the rest can be used normally.<br>You can use this piece of code:  chrome.runtime.sendMessage ({reload: "true"}); to refresh the right-mouse-menu.<br> Below are some options for programming in this extension.<br><hr><input type="checkbox" id="showdot">Checking this will display a colored dot instead of the line /*execute locally*/</center><br></div><div id="rightsettingsside"><div id="leftsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="alarmspermission">Alarms</button>&nbsp;<a target="_blank" href="http://developer.chrome.com/extensions/alarms.html">chrome.alarms</a></div><hr><div class="permissiondiv"><button id="backgroundpermission">background</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">background</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="browsingdatapermissions">browsingData</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/browsingData">chrome.browsingData</a></div><hr><div class="permissiondiv"><button id="bookmarkspermission">bookmarks</button>&nbsp;<a href="http://developer.chrome.com/extensions/bookmarks.html" target="_blank">chrome.bookmarks</a></div><hr><div class="permissiondiv"><button id="clipboardreadpermission">clipboardRead</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardRead</a></div><hr><div class="permissiondiv"><button id="clipboardwritepermission">clipboardWrite</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardWrite</a></div><hr><div class="permissiondiv"><button id="contentsettingspermission">contentSettings</button>&nbsp;<a href="http://developer.chrome.com/extensions/contentSettings.html" target="_blank">chrome.contentSettings</a></div><hr><div class="permissiondiv"><button id="cookiespermission">cookies</button><a href="http://developer.chrome.com/extensions/cookies.html" target="_blank">chrome.cookies</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="desktopcapturepermission">desktopCapture</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/desktopCapture">chrome.desktopCapture</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="downloadspermission">downloads</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/downloads">chrome.downloads</a></div></div><div id="rightsideofrightside"><div class="permissiondiv"><button id="historypermission">history</button>&nbsp;<a href="http://developer.chrome.com/extensions/history.html" target="_blank">chrome.history</a><hr><div class="permissiondiv"><button id="idlepermission">idle</button>&nbsp;<a href="http://developer.chrome.com/extensions/idle.html" target="_blank">chrome.idle</a></div></div><hr><div style="margin-top:3%;" class="permissiondiv"><button id="managementpermission">management</button>&nbsp;<a href="http://developer.chrome.com/extensions/management.html" target="_blank">chrome.management</a></div><hr><div class="permissiondiv"><button id="notificationsidv">notifications</button>&nbsp;<a href="http://developer.chrome.com/extensions/desktop_notifications.html" target="_blank">Desktop Notifications</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="powerpermission">power</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/power">chrome.power</a></div><hr><div class="permissiondiv"><button id="privacypermission">privacy</button>&nbsp;<a href="http://developer.chrome.com/extensions/privacy.html" target="_blank">chrome.privacy</a></div><hr><div class="permissiondiv"><button id="storagepermission">storage</button>&nbsp;<a href="http://developer.chrome.com/extensions/storage.html" target="_blank">chrome.storage</a></div><hr><div class="permissiondiv"><button id="topsitespermission">topSites</button> &nbsp;<a href="http://developer.chrome.com/extensions/topSites.html" target="_blank">chrome.topSites</a></div><hr><div class="permissiondiv"><button id="ttspermission">tts</button>&nbsp;<a href="http://developer.chrome.com/extensions/tts.html" target="_blank">chrome.tts</a></div><hr><div class="permissiondiv"><button id="webnavigationpermission">webNavigation</button>&nbsp;<a href="http://developer.chrome.com/extensions/webNavigation.html" target="_blank">chrome.webNavigation</a></div><hr><div class="permissiondiv"><button id="webrequestpermission">webRequest</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequest</a></div><hr><div class="permissiondiv"><button id="webrequestblockingpermission">webRequestBlocking</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequestBlocking</a></div></div></div><div id="bottomsettingsside"><div id="optionsbackbutton"><center><br><br><b>Back</b><br>Go back to script editing page</center></div><div id="optionsexitbutton"><center><br><br><b>Exit</b><br>Close this popup</center></div></div></div>');

					$("#leftsettinsside").css("font-size", "76%");
					$("#greenbutton").css("margin-left", "65%");

				}

				if (screen.width < 1680 && screen.width > 1440) {
					document.getElementById("editingbox").innerHTML = ('<div class="startingdiv"><center><div id="nametext">Now editing <b>script</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside"><div id="whentorun">Run at: <select id="whenwillitrun"><option id="onnclick">On Click</option><option id="onvisit">On Visiting:</option><option id="always">Always run</option></select><div id="questionmark" title=" ">?</div><div id="whentorundiv">Run on visiting:<input id="whendoesitrun" size="100"><div id="questionmarktwo" title=" ">?</div></div></div>You can edit JavaScript code here, however i recommend editing on <a href="http://www.jsbin.com" target="_blank">JsBin</a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <div id="greenbutton"><img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png"></div>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><image id="gearicon" title=" " src="Thumbnails/gear.png" style="margin-top:1px; margin-left:2px;" width="20px" height="20px"><br><textarea id="editinputarea" cols="130" rows="30">' + whatinsidetheinputstuff + '</textarea></div><div id="rightside"><div style="position:absolute;margin-top:-1%;font-size:100%;"><b>Note:</b><br>Most scripts wont work on this page</div><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1.4%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div><div class="settingsdiv" ><div id="titledivider"><center><b>Stuff to know and editing settings for Script</b><br><hr></center></div><div id="leftsettinsside"><center>Every script by default has jquery 2.0.3 in it, this is included by default and whether to use it is your choice. <br>You can add the line /*execute locally*/ to your code and it will execute in the extension instead of on the page, this gives it additional permissions such as the ability to see what you selected when you clicked it, or other information about the page.<br> By default you have the permissions to open tabs (<a href="http://developer.chrome.com/extensions/tabs.html" target="_blank">chrome.tabs</a>) and the ability to see what you did while clicking right-mouse-button (<a href="http://developer.chrome.com/extensions/contextMenus.html#type-OnClickData" target="_blank">Chrome.contextMenus onclickdata</a>), the way to use these is to put the property (linkUrl, pageUrl,selectionText or whatever) in the function this way:<br> function myfunction(pageurl)<br><br>Be sure to put the property in all lower case. This will declare the function, and later on you can execute it like on the end of your script with the code:<br> myfunction(pageurl);<br><br>You even the ability to create right-mouse-click-menus but that is already covered by the extension. Due to that being quite limited if you look at the entire range of <a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">chrome APIs,</a>, and not wanting to prompt users for unnessecary permissions on installing, I have made it possible to ask for additional permissions on the right side of this page. These Chrome APIs can then be used by you, and you can cover even more with programming.<br> Users seeing "wants to acces all data on harddrive" on install probably do not trust it, that is why you can ask for permissions on the right. Simply click the button, and give permission depending on if you want it, you can then use the linked chrome API to increase the things you can do.<br>There are also a few spots you can NOT use in storing things in the <b>extensions</b> localStorage. These places are <b>any number on its own, firsttime, numberofrows, optionson, scriptoptions, waitforsearch, whatpage</b>, the rest can be used normally.<br>You can use this piece of code:  chrome.runtime.sendMessage ({reload: "true"}); to refresh the right-mouse-menu.<br> Below are some options for programming in this extension.<br><hr><input type="checkbox" id="showdot">Checking this will display a colored dot instead of the line /*execute locally*/</center><br></div><div id="rightsettingsside"><div id="leftsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="alarmspermission">Alarms</button>&nbsp;<a target="_blank" href="http://developer.chrome.com/extensions/alarms.html">chrome.alarms</a></div><hr><div class="permissiondiv"><button id="backgroundpermission">background</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">background</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="browsingdatapermissions">browsingData</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/browsingData">chrome.browsingData</a></div><hr><div class="permissiondiv"><button id="bookmarkspermission">bookmarks</button>&nbsp;<a href="http://developer.chrome.com/extensions/bookmarks.html" target="_blank">chrome.bookmarks</a></div><hr><div class="permissiondiv"><button id="clipboardreadpermission">clipboardRead</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardRead</a></div><hr><div class="permissiondiv"><button id="clipboardwritepermission">clipboardWrite</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardWrite</a></div><hr><div class="permissiondiv"><button id="contentsettingspermission">contentSettings</button>&nbsp;<a href="http://developer.chrome.com/extensions/contentSettings.html" target="_blank">chrome.contentSettings</a></div><hr><div class="permissiondiv"><button id="cookiespermission">cookies</button><a href="http://developer.chrome.com/extensions/cookies.html" target="_blank">chrome.cookies</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="desktopcapturepermission">desktopCapture</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/desktopCapture">chrome.desktopCapture</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="downloadspermission">downloads</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/downloads">chrome.downloads</a></div><div id="rightsideofrightside"><div class="permissiondiv"><button id="idlepermission">idle</button>&nbsp;<a href="http://developer.chrome.com/extensions/idle.html" target="_blank">chrome.idle</a></div></div><hr><div style="margin-top:3%;" class="permissiondiv"><button id="managementpermission">management</button>&nbsp;<a href="http://developer.chrome.com/extensions/management.html" target="_blank">chrome.management</a></div><hr><div class="permissiondiv"><button id="notificationsidv">notifications</button>&nbsp;<a href="http://developer.chrome.com/extensions/desktop_notifications.html" target="_blank">Desktop Notifications</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="powerpermission">power</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/power">chrome.power</a></div><hr><div class="permissiondiv"><button id="privacypermission">privacy</button>&nbsp;<a href="http://developer.chrome.com/extensions/privacy.html" target="_blank">chrome.privacy</a></div><hr><div class="permissiondiv"><button id="storagepermission">storage</button>&nbsp;<a href="http://developer.chrome.com/extensions/storage.html" target="_blank">chrome.storage</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="tabcapturepermission">tabCapture</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/tabCapture">chrome.tabCapture</a></div><hr><div class="permissiondiv"><button id="topsitespermission">topSites</button> &nbsp;<a href="http://developer.chrome.com/extensions/topSites.html" target="_blank">chrome.topSites</a></div><hr><div class="permissiondiv"><button id="ttspermission">tts</button>&nbsp;<a href="http://developer.chrome.com/extensions/tts.html" target="_blank">chrome.tts</a></div><hr><div class="permissiondiv"><button id="webnavigationpermission">webNavigation</button>&nbsp;<a href="http://developer.chrome.com/extensions/webNavigation.html" target="_blank">chrome.webNavigation</a></div><hr><div class="permissiondiv"><button id="webrequestpermission">webRequest</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequest</a></div><hr><div class="permissiondiv"><button id="webrequestblockingpermission">webRequestBlocking</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequestBlocking</a></div></div></div><div id="bottomsettingsside"><div id="optionsbackbutton"><center><br><br><b>Back</b><br>Go back to script editing page</center></div><div id="optionsexitbutton"><center><br><br><b>Exit</b><br>Close this popup</center></div></div></div>');

					$("#leftsettinsside").css("font-size", "76%");
					$("#greenbutton").css("margin-left", "65%");

				}
				if (screen.width < 1440) {
					document.getElementById("editingbox").innerHTML = ('<div class="startingdiv"><center><div id="nametext">Now editing <b>script</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside"><div id="whentorun">Run at: <select id="whenwillitrun"><option id="onnclick">On Click</option><option id="onvisit">On Visiting:</option><option id="always">Always run</option></select><div id="questionmark" title=" ">?</div><div id="whentorundiv">Run on visiting:<input id="whendoesitrun" size="100"><div id="questionmarktwo" title=" ">?</div></div></div>You can edit JavaScript code here, however i recommend editing on <a href="http://www.jsbin.com" target="_blank">JsBin</a>&nbsp; &nbsp; <div id="greenbutton"><img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png"></div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><image id="gearicon" title=" " src="Thumbnails/gear.png" style="margin-top:1px; margin-left:2px;" width="20px" height="20px"><br><textarea id="editinputarea" cols="128" rows="38">' + whatinsidetheinputstuff + '</textarea></div><div id="rightside"><div style="position:absolute;margin-top:-1%;font-size:100%;"><b>Note:</b><br>Most scripts wont work on this page</div><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1.4%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div><div class="settingsdiv" ><div id="titledivider"><center><b>Stuff to know and editing settings for Script</b><br><hr></center></div><div id="leftsettinsside"><center>Every script by default has jquery 2.0.3 in it, this is included by default and whether to use it is your choice. <br>You can add the line /*execute locally*/ to your code and it will execute in the extension instead of on the page, this gives it additional permissions such as the ability to see what you selected when you clicked it, or other information about the page.<br> By default you have the permissions to open tabs (<a href="http://developer.chrome.com/extensions/tabs.html" target="_blank">chrome.tabs</a>) and the ability to see what you did while clicking right-mouse-button (<a href="http://developer.chrome.com/extensions/contextMenus.html#type-OnClickData" target="_blank">Chrome.contextMenus onclickdata</a>), the way to use these is to put the property (linkUrl, pageUrl,selectionText or whatever) in the function this way:<br> function myfunction(pageurl)<br><br>Be sure to put the property in all lower case. This will declare the function, and later on you can execute it like on the end of your script with the code:<br> myfunction(pageurl);<br><br>You even the ability to create right-mouse-click-menus but that is already covered by the extension. Due to that being quite limited if you look at the entire range of <a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">chrome APIs,</a>, and not wanting to prompt users for unnessecary permissions on installing, I have made it possible to ask for additional permissions on the right side of this page. These Chrome APIs can then be used by you, and you can cover even more with programming.<br> Users seeing "wants to acces all data on harddrive" on install probably do not trust it, that is why you can ask for permissions on the right. Simply click the button, and give permission depending on if you want it, you can then use the linked chrome API to increase the things you can do.<br>There are also a few spots you can NOT use in storing things in the <b>extensions</b> localStorage. These places are <b>any number on its own, firsttime, numberofrows, optionson, scriptoptions, waitforsearch, whatpage</b>, the rest can be used normally.<br>You can use this piece of code:  chrome.runtime.sendMessage ({reload: "true"}); to refresh the right-mouse-menu.<br> Below are some options for programming in this extension.<br><hr><input type="checkbox" id="showdot">Checking this will display a colored dot instead of the line /*execute locally*/</center><br></div><div id="rightsettingsside"><div id="leftsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="alarmspermission">Alarms</button>&nbsp;<a target="_blank" href="http://developer.chrome.com/extensions/alarms.html">chrome.alarms</a></div><hr><div class="permissiondiv"><button id="backgroundpermission">background</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">background</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="browsingdatapermissions">browsingData</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/browsingData">chrome.browsingData</a></div><hr><div class="permissiondiv"><button id="bookmarkspermission">bookmarks</button>&nbsp;<a href="http://developer.chrome.com/extensions/bookmarks.html" target="_blank">chrome.bookmarks</a></div><hr><div class="permissiondiv"><button id="clipboardreadpermission">clipboardRead</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardRead</a></div><hr><div class="permissiondiv"><button id="clipboardwritepermission">clipboardWrite</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardWrite</a></div><hr><div class="permissiondiv"><button id="contentsettingspermission">contentSettings</button>&nbsp;<a href="http://developer.chrome.com/extensions/contentSettings.html" target="_blank">chrome.contentSettings</a></div><hr><div class="permissiondiv"><button id="cookiespermission">cookies</button><a href="http://developer.chrome.com/extensions/cookies.html" target="_blank">chrome.cookies</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="desktopcapturepermission">desktopCapture</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/desktopCapture">chrome.desktopCapture</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="downloadspermission">downloads</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/downloads">chrome.downloads</a></div><div id="rightsideofrightside"><div class="permissiondiv"><button id="idlepermission">idle</button>&nbsp;<a href="http://developer.chrome.com/extensions/idle.html" target="_blank">chrome.idle</a></div></div><hr><div style="margin-top:3%;" class="permissiondiv"><button id="managementpermission">management</button>&nbsp;<a href="http://developer.chrome.com/extensions/management.html" target="_blank">chrome.management</a></div><hr><div class="permissiondiv"><button id="notificationsidv">notifications</button>&nbsp;<a href="http://developer.chrome.com/extensions/desktop_notifications.html" target="_blank">Desktop Notifications</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="powerpermission">power</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/power">chrome.power</a></div><hr><div class="permissiondiv"><button id="privacypermission">privacy</button>&nbsp;<a href="http://developer.chrome.com/extensions/privacy.html" target="_blank">chrome.privacy</a></div><hr><div class="permissiondiv"><button id="storagepermission">storage</button>&nbsp;<a href="http://developer.chrome.com/extensions/storage.html" target="_blank">chrome.storage</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="tabcapturepermission">tabCapture</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/tabCapture">chrome.tabCapture</a></div><hr><div class="permissiondiv"><button id="topsitespermission">topSites</button> &nbsp;<a href="http://developer.chrome.com/extensions/topSites.html" target="_blank">chrome.topSites</a></div><hr><div class="permissiondiv"><button id="ttspermission">tts</button>&nbsp;<a href="http://developer.chrome.com/extensions/tts.html" target="_blank">chrome.tts</a></div><hr><div class="permissiondiv"><button id="webnavigationpermission">webNavigation</button>&nbsp;<a href="http://developer.chrome.com/extensions/webNavigation.html" target="_blank">chrome.webNavigation</a></div><hr><div class="permissiondiv"><button id="webrequestpermission">webRequest</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequest</a></div><hr><div class="permissiondiv"><button id="webrequestblockingpermission">webRequestBlocking</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequestBlocking</a></div></div></div><div id="bottomsettingsside"><div id="optionsbackbutton"><center><br><br><b>Back</b><br>Go back to script editing page</center></div><div id="optionsexitbutton"><center><br><br><b>Exit</b><br>Close this popup</center></div></div></div>');

					$("#greenbutton").css("margin-left", "63%");
					$("#leftsettinsside").css("font-size", "83%");

				}

				if (screen.width == 1280) {
					document.getElementById("editingbox").innerHTML = ('<div class="startingdiv"><center><div id="nametext">Now editing <b>script</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside"><div id="whentorun">Run at: <select id="whenwillitrun"><option id="onnclick">On Click</option><option id="onvisit">On Visiting:</option><option id="always">Always run</option></select><div id="questionmark" title=" ">?</div><div id="whentorundiv">Run on visiting:<input id="whendoesitrun" size="100"><div id="questionmarktwo" title=" ">?</div></div></div>You can edit JavaScript code here, however i recommend editing on <a href="http://www.jsbin.com" target="_blank">JsBin</a>&nbsp; &nbsp; <div id="greenbutton"><img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png"></div> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><image id="gearicon" title=" " src="Thumbnails/gear.png" style="margin-top:1px; margin-left:2px;" width="20px" height="20px"><br><textarea id="editinputarea" cols="128" rows="27">' + whatinsidetheinputstuff + '</textarea></div><div id="rightside"><div style="position:absolute;margin-top:-1%;font-size:100%;"><b>Note:</b><br>Most scripts wont work on this page</div><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1.4%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div><div class="settingsdiv" ><div id="titledivider"><center><b>Stuff to know and editing settings for Script</b><br><hr></center></div><div id="leftsettinsside"><center>Every script by default has jquery 2.0.3 in it, this is included by default and whether to use it is your choice. <br>You can add the line /*execute locally*/ to your code and it will execute in the extension instead of on the page, this gives it additional permissions such as the ability to see what you selected when you clicked it, or other information about the page.<br> By default you have the permissions to open tabs (<a href="http://developer.chrome.com/extensions/tabs.html" target="_blank">chrome.tabs</a>) and the ability to see what you did while clicking right-mouse-button (<a href="http://developer.chrome.com/extensions/contextMenus.html#type-OnClickData" target="_blank">Chrome.contextMenus onclickdata</a>), the way to use these is to put the property (linkUrl, pageUrl,selectionText or whatever) in the function this way:<br> function myfunction(pageurl)<br><br>Be sure to put the property in all lower case. This will declare the function, and later on you can execute it like on the end of your script with the code:<br> myfunction(pageurl);<br><br>You even the ability to create right-mouse-click-menus but that is already covered by the extension. Due to that being quite limited if you look at the entire range of <a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">chrome APIs,</a>, and not wanting to prompt users for unnessecary permissions on installing, I have made it possible to ask for additional permissions on the right side of this page. These Chrome APIs can then be used by you, and you can cover even more with programming.<br> Users seeing "wants to acces all data on harddrive" on install probably do not trust it, that is why you can ask for permissions on the right. Simply click the button, and give permission depending on if you want it, you can then use the linked chrome API to increase the things you can do.<br>There are also a few spots you can NOT use in storing things in the <b>extensions</b> localStorage. These places are <b>any number on its own, firsttime, numberofrows, optionson, scriptoptions, waitforsearch, whatpage</b>, the rest can be used normally.<br>You can use this piece of code:  chrome.runtime.sendMessage ({reload: "true"}); to refresh the right-mouse-menu.<br> Below are some options for programming in this extension.<br><hr><input type="checkbox" id="showdot">Checking this will display a colored dot instead of the line /*execute locally*/</center><br></div><div id="rightsettingsside"><div id="leftsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="alarmspermission">Alarms</button>&nbsp;<a target="_blank" href="http://developer.chrome.com/extensions/alarms.html">chrome.alarms</a></div><hr><div class="permissiondiv"><button id="backgroundpermission">background</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">background</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="browsingdatapermissions">browsingData</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/browsingData">chrome.browsingData</a></div><hr><div class="permissiondiv"><button id="bookmarkspermission">bookmarks</button>&nbsp;<a href="http://developer.chrome.com/extensions/bookmarks.html" target="_blank">chrome.bookmarks</a></div><hr><div class="permissiondiv"><button id="clipboardreadpermission">clipboardRead</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardRead</a></div><hr><div class="permissiondiv"><button id="clipboardwritepermission">clipboardWrite</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardWrite</a></div><hr><div class="permissiondiv"><button id="contentsettingspermission">contentSettings</button>&nbsp;<a href="http://developer.chrome.com/extensions/contentSettings.html" target="_blank">chrome.contentSettings</a></div><hr><div class="permissiondiv"><button id="cookiespermission">cookies</button><a href="http://developer.chrome.com/extensions/cookies.html" target="_blank">chrome.cookies</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="desktopcapturepermission">desktopCapture</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/desktopCapture">chrome.desktopCapture</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="downloadspermission">downloads</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/downloads">chrome.downloads</a></div><div id="rightsideofrightside"><div class="permissiondiv"><button id="idlepermission">idle</button>&nbsp;<a href="http://developer.chrome.com/extensions/idle.html" target="_blank">chrome.idle</a></div></div><hr><div style="margin-top:3%;" class="permissiondiv"><button id="managementpermission">management</button>&nbsp;<a href="http://developer.chrome.com/extensions/management.html" target="_blank">chrome.management</a></div><hr><div class="permissiondiv"><button id="notificationsidv">notifications</button>&nbsp;<a href="http://developer.chrome.com/extensions/desktop_notifications.html" target="_blank">Desktop Notifications</a></div><hr><div class="permissiondiv" style="margin-top:3%;"><button id="powerpermission">power</button>&nbsp;<a target="_blank" href="https://developer.chrome.com/extensions/power">chrome.power</a></div><hr><div class="permissiondiv"><button id="privacypermission">privacy</button>&nbsp;<a href="http://developer.chrome.com/extensions/privacy.html" target="_blank">chrome.privacy</a></div><hr><div class="permissiondiv"><button id="storagepermission">storage</button>&nbsp;<a href="http://developer.chrome.com/extensions/storage.html" target="_blank">chrome.storage</a></div><hr><div class="permissiondiv"><button id="topsitespermission">topSites</button> &nbsp;<a href="http://developer.chrome.com/extensions/topSites.html" target="_blank">chrome.topSites</a></div><hr><div class="permissiondiv"><button id="ttspermission">tts</button>&nbsp;<a href="http://developer.chrome.com/extensions/tts.html" target="_blank">chrome.tts</a></div><hr><div class="permissiondiv"><button id="webnavigationpermission">webNavigation</button>&nbsp;<a href="http://developer.chrome.com/extensions/webNavigation.html" target="_blank">chrome.webNavigation</a></div><hr><div class="permissiondiv"><button id="webrequestpermission">webRequest</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequest</a></div><hr><div class="permissiondiv"><button id="webrequestblockingpermission">webRequestBlocking</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequestBlocking</a></div></div></div><div id="bottomsettingsside"><div id="optionsbackbutton"><center><br><br><b>Back</b><br>Go back to script editing page</center></div><div id="optionsexitbutton"><center><br><br><b>Exit</b><br>Close this popup</center></div></div></div>');
				}

				$("#whentorundiv").hide();

				//Tooltippies
				$("#questionmarktwo").tooltip({ content: "You don't have to use http://www.  If you still do this, it's no problem though.<br>You can type in either multiple or just one site, if you want multiple sites seperate them with a comma.<br>To make a script run on specified domain you can use the asterisk. Putting the asterisk like this:<br>*.google.com<br>Will let it run on play.google.com but not google.com, to do this type it like this<br>*google.com<br>To use the asterisk for behind a domain simply use it like this:<br>google.com*<br>Putting a slash in front of it will not let it identify with sites without a / after it<br>Don't use multiple asterisks in one site, instead you can split them into two different sites as in:<br>*google.com*<br>Turns into:<br>*google.com and google.com*" });

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });
				$("#gearicon").tooltip({ content: "Settings" })

				//Doing the question marks
				document.getElementById("whenwillitrun").onchange = function () {
					var ya = document.getElementById("whenwillitrun").value;

					if (ya == "On Click") {
						$("#questionmark").attr("title", " ");
						$("#questionmark").tooltip({ content: "Runs when you click the item in your right-click-menu, this can be used to alter the page etc." });
						$("#whentorundiv").hide();
						$("#questionmark").css("margin-left", "105%");
					}
					if (ya == "On Visiting:") {
						$("#questionmark").attr("title", " ")
						$("#questionmark").tooltip({ content: "Runs on visiting specified site(s), this will be hidden in the rightclick menu" });
						$("#whentorundiv").show();
						$("#questionmark").css("margin-left", "21.5%");
					}
					if (ya == "Always run") {
						$("#questionmark").attr("title", " ")
						$("#questionmark").tooltip({ content: "Runs on every http or https you visit, this means basically every site except for local pages in your browser (extensions, settings etc.) and on files you open that are on your computer, this will be hidden in the rightclick menu" });
						$("#whentorundiv").hide();
						$("#questionmark").css("margin-left", "105%");
					}
				}

				//Displaying correct thing when to run and stuff
				var za = splitallboxdatathing[0];
				if (za != "0" && za != "2") {
					//First display corerct thingy
					$("#whenwillitrun").html('<option id="onvisit">On Visiting:</option><option id="always">Always Run</option><option id="onnclick">On Click</option>');
					$("#whentorundiv").show();
					$("#questionmark").css("margin-left", "21.5%");

					//Then fill in the input with all the data
					za = za.split("1,");
					var zb = "";
					var zc = 1;
					if (za.length > 2) {
						//Fix this stuff

						while (za.length > zc) {
							zb = zb + za[zc];

							zc++
						}
					}
					else {
						zb = za[1];
					}

					document.getElementById("whendoesitrun").value = zb;

				}
				else {
					if (za == "0") {
						$("#questionmark").attr("title", " ");
						$("#questionmark").tooltip({ content: "Runs when you click the item in your right-click-menu, this can be used to alter the page etc." });
					}
					if (za == "2") {
						$("#whenwillitrun").html('<option id="always">Always Run</option><option id="onvisit">On Visiting:</option><option id="onnclick">On Click</option>');
					}
				}

				//Doing the green button stuff
				var ia = localStorage.scriptoptions;
				ia = ia.split(",");
				ia = ia[24];
				if (ia == "1") {
					//See if /*execute locally*/ is in the code
					var ib = document.getElementById("editinputarea").innerHTML;
					if (ib.search("execute locally") > -1) {
						//Display thingy and remove text from code
						$("#greenbutton").html('<img id="theactualcircle" style="width:20px;" src="Thumbnails/full circle.png">')
						var ic = document.getElementById("editinputarea").value;
						ic = ic.replace("/*execute locally*/\n", "");
						ic = ic.replace("//execute locally\n", "");
						$("#editinputarea").html(ic);
					}

					//Set the button's onclick
					$("#greenbutton").click(function () {
						var id = $("#greenbutton").html();
						if (id == '<img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png">') {
							$("#theactualcircle").attr("src", "Thumbnails/full circle.png");
							var id = document.getElementById("editinputarea").value;

							id = id.replace("/*execute locally*/\n\n", "");
							id = id.replace("/*execute locally*/\n", "");
							id = id.replace("/*execute locally*/", "");

							$("#editinputarea").html(id);
						}
						if (id == '<img id="theactualcircle" style="width:20px;" src="Thumbnails/full circle.png">') {
							$("#theactualcircle").attr("src", "Thumbnails/Empty circle.png");
							var id = document.getElementById("editinputarea").value;
							id = "/*execute locally*/\n\n" + id;
							$("#editinputarea").html(id);
						}
					})
				}
				else {
					$("#greenbutton").css("display", "none");
				}

				//Hiding the bottom thing
				$(".settingsdiv").css("display", "none");

				//onclick of settingsicon
				$("#gearicon").click(function () {
					$(".startingdiv").fadeTo(500, 0);
					setTimeout(function () {
						$(".startingdiv").css("display", "none")

						setTimeout(function () {
							$(".settingsdiv").css("display", "").css("opacity", "0").fadeTo(500, 1.0)
						}, 500);
					}, 500);
				});

				//Onclick of backbutton
				$("#optionsbackbutton").click(function () {
					$(".settingsdiv").fadeTo(500, 0);
					setTimeout(function () {
						$(".settingsdiv").css("display", "none")

						setTimeout(function () {
							$(".startingdiv").css("display", "").css("opacity", "0").fadeTo(500, 1.0)
						}, 500);
					}, 500);
				});

				//Setting all the onclicks
				var ai = 0;
				var aj = 0;
				var ak = 0;

				//Onclick of close button
				$("#optionsexitbutton").click(function () {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				})

				//disable the ones that are already asked for
				var ia = localStorage.getItem("scriptoptions");
				ia = ia.split(",");

				if (ia[0] == "1") {
					document.getElementById("alarmspermission").setAttribute("disabled", "disabled");
				}
				if (ia[1] == "1") {
					document.getElementById("backgroundpermission").setAttribute("disabled", "disabled");
				}
				if (ia[2] == "1") {
					document.getElementById("bookmarkspermission").setAttribute("disabled", "disabled");
				}
				if (ia[3] == "1") {
					document.getElementById("clipboardreadpermission").setAttribute("disabled", "disabled");
				}
				if (ia[4] == "1") {
					document.getElementById("clipboardwritepermission").setAttribute("disabled", "disabled");
				}
				if (ia[5] == "1") {
					document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
				}
				if (ia[6] == "1") {
					document.getElementById("cookiespermission").setAttribute("disabled", "disabled");
				}
				if (ia[7] == "1") {
					document.getElementById("historypermission").setAttribute("disabled", "disabled");
				}
				if (ia[10] == "1") {
					document.getElementById("idlepermission").setAttribute("disabled", "disabled");
				}
				if (ia[11] == "1") {
					document.getElementById("managementpermission").setAttribute("disabled", "disabled");
				}
				if (ia[12] == "1") {
					document.getElementById("notificationsidv").setAttribute("disabled", "disabled");
				}
				if (ia[13] == "1") {
					document.getElementById("privacypermission").setAttribute("disabled", "disabled");
				}
				if (ia[16] == "1") {
					document.getElementById("storagepermission").setAttribute("disabled", "disabled");
				}
				if (ia[18] == "1") {
					document.getElementById("topsitespermission").setAttribute("disabled", "disabled");
				}
				if (ia[19] == "1") {
					document.getElementById("ttspermission").setAttribute("disabled", "disabled");
				}
				if (ia[21] == "1") {
					document.getElementById("webnavigationpermission").setAttribute("disabled", "disabled");
				}
				if (ia[22] == "1") {
					document.getElementById("webrequestpermission").setAttribute("disabled", "disabled");
				}
				if (ia[23] == "1") {
					document.getElementById("webrequestblockingpermission").setAttribute("disabled", "disabled");
				}
				if (ia[24] == "1") {
					document.getElementById("showdot").checked = true;
				}
				if (ia[25] == "1") {
					document.getElementById("browsingdatapermissions").setAttribute("disabled", "disabled");
				}
				if (ia[26] == "1") {
					document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
				}
				if (ia[27] == "1") {
					document.getElementById("desktopcapturepermission").setAttribute("disabled", "disabled");
				}
				if (ia[28] == "1") {
					document.getElementById("downloadspermission").setAttribute("disabled", "disabled");
				}
				if (ia[29] == "1") {
					document.getElementById("geolocationpermission").setAttribute("disabled", "disabled");
				}
				if (ia[30] == "1") {
					document.getElementById("powerpermission").setAttribute("disabled", "disabled");
				}
				if (ia[31] == "1") {
					document.getElementById("proxypermission").setAttribute("disabled", "disabled");
				}
				if (ia[32] == "1") {
					document.getElementById("pushmessagingpermission").setAttribute("disabled", "disabled");
				}




				//Ask for hte permissions/onclicks
				$("#alarmspermission").click(function () {
					chrome.permissions.request({
						permissions: ["alarms"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[0] = 1;
							document.getElementById("alarmspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#backgroundpermission").click(function () {
					chrome.permissions.request({
						permissions: ["background"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[1] = 1;
							document.getElementById("backgroundpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#bookmarkspermission").click(function () {
					chrome.permissions.request({
						permissions: ["bookmarks"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[2] = 1;
							document.getElementById("bookmarkspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#clipboardreadpermission").click(function () {
					chrome.permissions.request({
						permissions: ["clipboardRead"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[3] = 1;
							document.getElementById("clipboardreadpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#clipboardwritepermission").click(function () {
					chrome.permissions.request({
						permissions: ["clipboardWrite"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[4] = 1;
							document.getElementById("clipboardwritepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#contentsettingspermission").click(function () {
					chrome.permissions.request({
						permissions: ["contentSettings"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[5] = 1;
							document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#cookiespermission").click(function () {
					chrome.permissions.request({
						permissions: ["cookies"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[6] = 1;
							document.getElementById("cookiespermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#historypermission").click(function () {
					chrome.permissions.request({
						permissions: ["history"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[7] = 1;
							document.getElementById("historypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});


				$("#idlepermission").click(function () {
					chrome.permissions.request({
						permissions: ["idle"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[10] = 1;
							document.getElementById("idlepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#managementpermission").click(function () {
					chrome.permissions.request({
						permissions: ["management"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[11] = 1;
							document.getElementById("managementpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#notificationsidv").click(function () {
					chrome.permissions.request({
						permissions: ["notifications"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[12] = 1;
							document.getElementById("notificationsidv").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#privacypermission").click(function () {
					chrome.permissions.request({
						permissions: ["privacy"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[13] = 1;
							document.getElementById("privacypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#storagepermission").click(function () {
					chrome.permissions.request({
						permissions: ["storage"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[16] = 1;
							document.getElementById("storagepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#topsitespermission").click(function () {
					chrome.permissions.request({
						permissions: ["topSites"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[18] = 1;
							document.getElementById("topsitespermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#ttspermission").click(function () {
					chrome.permissions.request({
						permissions: ["tts"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[19] = 1;
							document.getElementById("ttspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webnavigationpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webNavigation"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[21] = 1;
							document.getElementById("webnavigationpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webrequestpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequest"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[22] = 1;
							document.getElementById("webrequestpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webrequestblockingpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequestBlocking"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[23] = 1;
							document.getElementById("webrequestblockingpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#showdot").click(function () {
					var hd = document.getElementById("showdot").checked;
					if (hd === true) {
						var ha = localStorage.getItem("scriptoptions");
						ha = ha.split(",");
						ha[24] = 1;
						var hb = 0;
						var hc = "";
						while (hb < ha.length) {
							if (hb == 32) {
								hc = hc + ha[hb];
							}
							else {
								hc = hc + ha[hb] + ",";
							}

							hb++;
						}
						localStorage.scriptoptions = hc;
					}
					else {
						var ha = localStorage.getItem("scriptoptions");
						ha = ha.split(",");
						ha[24] = 0;
						var hb = 0;
						var hc = "";
						while (hb < ha.length) {
							if (hb == 32) {
								hc = hc + ha[hb];
							}
							else {
								hc = hc + ha[hb] + ",";
							}

							hb++;
						}
						localStorage.scriptoptions = hc;
					}
				})

				$("#browsingdatapermissions").click(function () {
					chrome.permissions.request({
						permissions: ["browsingData"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[25] = 1;
							document.getElementById("browsingdatapermissions").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#contentsettingspermission").click(function () {
					chrome.permissions.request({
						permissions: ["contentSettings"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[26] = 1;
							document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#desktopcapturepermission").click(function () {
					chrome.permissions.request({
						permissions: ["desktopCapture"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[27] = 1;
							document.getElementById("desktopcapturepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#downloadspermission").click(function () {
					chrome.permissions.request({
						permissions: ["downloads"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[28] = 1;
							document.getElementById("downloadspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#geolocationpermission").click(function () {
					chrome.permissions.request({
						permissions: ["geolocation"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[29] = 1;
							document.getElementById("geolocationpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#powerpermission").click(function () {
					chrome.permissions.request({
						permissions: ["power"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[30] = 1;
							document.getElementById("powerpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#proxypermission").click(function () {
					chrome.permissions.request({
						permissions: ["proxy"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[31] = 1;
							document.getElementById("proxypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#pushmessagingpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequestBlocking"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("pushMessaging");
							ha = ha.split(",");
							ha[32] = 1;
							document.getElementById("pushmessagingpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});


				//END OF THAT STUFF


				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {
						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);

				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("editinputarea").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}

				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("editinputarea").value;
					var type = "Script";



					if ($("#theactualcircle").attr("src") == "Thumbnails/full circle.png") {
						newdata = "/*execute locally*/\n" + newdata;
					}

					//Saving the way to run with it
					if (document.getElementById("whenwillitrun").value == "On Click") {
						newdata = "0%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "On Visiting:") {
						newdata = "1," + document.getElementById("whendoesitrun").value + ",%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "Always Run") {
						newdata = "2%124" + newdata
					}

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("editinputarea").value;
					var type = "Script";

					if ($("#theactualcircle").attr("src") == "Thumbnails/full circle.png") {
						newdata = "/*execute locally*/\n" + newdata;
					}

					//Saving the way to run with it
					if (document.getElementById("whenwillitrun").value == "On Click") {
						newdata = "0%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "On Visiting:") {
						newdata = "1," + document.getElementById("whendoesitrun").value + "%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "Always Run") {
						newdata = "2%124" + newdata
					}

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });


					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}
			}
			if (allboxdata[1] == "Link") {

				if (screen.width > 1350 && screen.width < 1919) {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}
				if (screen.width > "1919") {

					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				if (screen.width > 1350 && screen.width < 1919) {
					$(".website").css("width", "94%");
					$(".datext").css("font-size", "180%");
					$("#text9").css("font-size", "140%");
					$("#urlinputbox").attr("size", "44");
				}

				$('.website').click(function (event) {
					var bc = event.target.id;

					var bd = bc.search("img");
					var be = bc.search("text");
					var bg = bc.search("link");

					if (bd > -1) {
						var bf = bc.split("img");
						bf = bf[1];
					}
					if (be > -1) {
						var bf = bc.split("text");
						bf = bf[1];
					}
					if (bg > -1) {
						var bf = bc.split("link");
						bf = bf[1];
					}

					if (!bf) {
						return false;
					}

					if (bf != 1) {
						document.getElementById("link1").style.border = "2px solid black";
					}
					if (bf != 2) {
						document.getElementById("link2").style.border = "2px solid black";
					}
					if (bf != 3) {
						document.getElementById("link3").style.border = "2px solid black";
					}
					if (bf != 4) {
						document.getElementById("link4").style.border = "2px solid black";
					}
					if (bf != 5) {
						document.getElementById("link5").style.border = "2px solid black";
					}
					if (bf != 6) {
						document.getElementById("link6").style.border = "2px solid black";
					}
					if (bf != 7) {
						document.getElementById("link7").style.border = "2px solid black";
					}
					if (bf != 8) {
						document.getElementById("link8").style.border = "2px solid black";
					}
					if (bf != 9) {
						document.getElementById("link9").style.border = "2px solid black";
					}
					if (bf != 10) {
						document.getElementById("link10").style.border = "2px solid black";
					}
					if (bf != 11) {
						document.getElementById("link11").style.border = "2px solid black";
					}
					if (bf != 12) {
						document.getElementById("link12").style.border = "2px solid black";
					}
					if (bf != 13) {
						document.getElementById("link13").style.border = "2px solid black";
					}
					if (bf != 14) {
						document.getElementById("link14").style.border = "2px solid black";
					}

					document.getElementById("link" + bf).style.border = "2px solid red";

					document.getElementById("urlinputbox").value = document.getElementById("text" + bf).innerHTML;

					document.getElementById("urlinputbox").onchange = function () {
						document.getElementById("link" + bf).style.border = "2px solid black";
					}

				});

				//All onclicks
				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("urlinputbox").value;
					var type = "Link";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("urlinputbox").value;
					var type = "Link";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;

					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = "0%124";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("urlinputbox").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}

				}
			}

			if (allboxdata[1] == "Divider") {
				document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>divider</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:2%;font-size:500%;">Change name: <input style="font-size:100%;" size="9" id="changename" value="' + allboxdata[0] + '"></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				//All onclicks
				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = allboxdata[2];

					var type = "Divider";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = allboxdata[2];
					var type = "Divider";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = allboxdata[2];

							data3 = "0%124" + data3;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}

			}

			if (allboxdata[1] == "Menu") {
				document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>menu</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside">Number of child items <input id="numberofchildren" value="' + allboxdata[2] + '">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><br><br><div id="wherethechildrengo"><div id="gotop"></div><div id="goleft"></div><div id="wheretheboxesgotwo"></div><div id="goright"></div><div id="godown"></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');

				var bg = 1;

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("numberofchildren").value;

					var type = "Menu";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("numberofchildren").value;
					var type = "Menu";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						paintsettings();
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("numberofchildren").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = document.getElementById("numberofchildren").value;

							data3 = "0%124";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}


			}
		}
	});

	//And again
	$('.Linkoutside').click(function openeditingbox(event, id) {

		if (exportmode == "1") {
			var ab = event.target.id;
			if (ab.search("rowie") > -1) {
				var ac = ab.split("rowie");
				var ad = ac[1];
			}
			if (ab.search("thingy") > -1) {
				var ac = ab.split("thingy");
				var ad = ac[1];
			}
			if (ab.search("block") > -1) {
				var ac = ab.split("block");
				var ad = ac[1];
			}
			if (ab.search("otherthing") > -1) {
				var ac = ab.split("otherthing");
				var ad = ac[1];
			}

			if (!ad) {
				return false;
			}

			if (document.getElementById("itemcheckbox" + ad).checked === false) {
				$("#itemcheckbox" + ad).attr("checked", "true");
			}
			else {
				$("#itemcheckbox" + ad).removeAttr("checked");
			}
		}
		else {

			if (id === undefined) {

				var ab = event.target.id;

				if (ab.search("rowie") > -1) {
					var ac = ab.split("rowie");
					var ad = ac[1];
				}
				if (ab.search("thingy") > -1) {
					var ac = ab.split("thingy");
					var ad = ac[1];
				}
				if (ab.search("block") > -1) {
					var ac = ab.split("block");
					var ad = ac[1];
				}
				if (ab.search("otherthing") > -1) {
					var ac = ab.split("otherthing");
					var ad = ac[1];
				}

				if (!ad) {
					return false;
				}

			}
			else {
				var ad = id;
			}

			//Displaying the edit screen

			document.getElementById("details").style.webkitTransform = "scale(1)";
			document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
			document.getElementById("details").style.webkitTransitionDuration = "250ms";
			document.getElementById("darkbackground").style.display = "block";
			document.getElementById("darkbackground").style.webkitAnimation = "colorchange 1s";

			//Filling in the edit screen

			var allboxdata = localStorage.getItem(ad);

			allboxdata = allboxdata.split("%123");

			var childornot = "none";

			if (allboxdata[1] == "Script") {
				var splitallboxdatathing = allboxdata[2].split("%124");
				whatinsidetheinputstuff = splitallboxdatathing[1];

				document.getElementById("editingbox").innerHTML = ('<div class="startingdiv"><center><div id="nametext">Now editing <b>script</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside"><div id="whentorun">Run at: <select id="whenwillitrun"><option id="onnclick">On Click</option><option id="onvisit">On Visiting:</option><option id="always">Always run</option></select><div id="questionmark" title=" ">?</div><div id="whentorundiv">Run on visiting:<input id="whendoesitrun" size="100"><div id="questionmarktwo" title=" ">?</div></div></div>You can edit JavaScript code here, however i recommend editing on <a href="http://www.jsbin.com" target="_blank">JsBin</a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <div id="greenbutton"><img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png"></div>&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><image id="gearicon" title=" " src="Thumbnails/gear.png" style="margin-top:1px; margin-left:2px;" width="20px" height="20px"><br><textarea id="editinputarea" cols="130" rows="30">' + whatinsidetheinputstuff + '</textarea></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div><div class="settingsdiv" ><div id="titledivider"><center><b>Stuff to know and editing settings for Script</b><br><hr></center></div><div id="leftsettinsside"><center>Every script by default has jquery 2.0.3 in it, this is included by default and whether to use it is your choice. <br>You can add the line /*execute locally*/ to your code and it will execute in the extension instead of on the page, this gives it additional permissions such as the ability to see what you selected when you clicked it, or other information about the page.<br> By default you have the permissions to open tabs (<a href="http://developer.chrome.com/extensions/tabs.html" target="_blank">chrome.tabs</a>) and the ability to see what you did while clicking right-mouse-button (<a href="http://developer.chrome.com/extensions/contextMenus.html#type-OnClickData" target="_blank">Chrome.contextMenus onclickdata</a>), the way to use these is to put the property (linkUrl, pageUrl,selectionText or whatever) in the function this way:<br> function myfunction(pageurl)<br><br>Be sure to put the property in all lower case. This will declare the function, and later on you can execute it like on the end of your script with the code:<br> myfunction(pageurl);<br><br>You even the ability to create right-mouse-click-menus but that is already covered by the extension. Due to that being quite limited if you look at the entire range of <a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">chrome APIs,</a>, and not wanting to prompt users for unnessecary permissions on installing, I have made it possible to ask for additional permissions on the right side of this page. These Chrome APIs can then be used by you, and you can cover even more with programming.<br> Users seeing "wants to acces all data on harddrive" on install probably do not trust it, that is why you can ask for permissions on the right. Simply click the button, and give permission depending on if you want it, you can then use the linked chrome API to increase the things you can do.<br>There are also a few spots you can NOT use in storing things in the <b>extensions</b> localStorage. These places are <b>any number on its own, firsttime, numberofrows, optionson, scriptoptions, waitforsearch, whatpage</b>, the rest can be used normally.<br>Below are some options for programming in this extension.<br><hr><input type="checkbox" id="showdot">Checking this will display a colored dot instead of the line /*execute locally*/</center><br></div><div id="rightsettingsside"><div id="leftsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="alarmspermission">Alarms</button>&nbsp;<a target="_blank" href="http://developer.chrome.com/extensions/alarms.html">chrome.alarms</a></div><div class="permissiondiv"><button id="backgroundpermission">background</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">background</a></div><div class="permissiondiv"><button id="bookmarkspermission">bookmarks</button>&nbsp;<a href="http://developer.chrome.com/extensions/bookmarks.html" target="_blank">chrome.bookmarks</a></div><div class="permissiondiv"><button id="clipboardreadpermission">clipboardRead</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardRead</a></div><div class="permissiondiv"><button id="clipboardwritepermission">clipboardWrite</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardWrite</a></div><div class="permissiondiv"><button id="contentsettingspermission">ContentSettings</button>&nbsp;<a href="http://developer.chrome.com/extensions/contentSettings.html" target="_blank">chrome.contentSettings</a></div><div class="permissiondiv"><button id="cookiespermission">cookies</button><a href="http://developer.chrome.com/extensions/cookies.html" target="_blank">chrome.cookies</a></div><div class="permissiondiv"><button id="historypermission">history</button>&nbsp;<a href="http://developer.chrome.com/extensions/history.html" target="_blank">chrome.history</a></div><div class="permissiondiv"><button id="idlepermission">idle</button>&nbsp;<a href="http://developer.chrome.com/extensions/idle.html" target="_blank">chrome.idle</a></div><div class="permissiondiv"><button id="managementpermission">management</button>&nbsp;<a href="http://developer.chrome.com/extensions/management.html" target="_blank">chrome.management</a></div>  </div><div id="rightsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="notificationsidv">notifications</button>&nbsp;<a href="http://developer.chrome.com/extensions/desktop_notifications.html" target="_blank">Desktop Notifications</a></div><div class="permissiondiv"><button id="privacypermission">privacy</button>&nbsp;<a href="http://developer.chrome.com/extensions/privacy.html" target="_blank">chrome.privacy</a></div><div class="permissiondiv"><button id="storagepermission">storage</button>&nbsp;<a href="http://developer.chrome.com/extensions/storage.html" target="_blank">chrome.storage</a></div><div class="permissiondiv"><button id="topsitespermission">topSites</button> &nbsp;<a href="http://developer.chrome.com/extensions/topSites.html" target="_blank">chrome.topSites</a></div><div class="permissiondiv"><button id="ttspermission">tts</button>&nbsp;<a href="http://developer.chrome.com/extensions/tts.html" target="_blank">chrome.tts</a></div><div class="permissiondiv"><button id="webnavigationpermission">webNavigation</button>&nbsp;<a href="http://developer.chrome.com/extensions/webNavigation.html" target="_blank">chrome.webNavigation</a></div><div class="permissiondiv"><button id="webrequestpermission">webRequest</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequest</a></div><div class="permissiondiv"><button id="webrequestblockingpermission">webRequestBlocking</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequestBlocking</a></div></div></div><div id="bottomsettingsside"><div id="optionsbackbutton"><center><br><br><b>Back</b><br>Go back to script editing page</center></div><div id="optionsexitbutton"><center><br><br><b>Exit</b><br>Close this popup</center></div></div></div>')


				$("#whentorundiv").hide();

				//Tooltippies
				$("#questionmarktwo").tooltip({ content: "You don't have to use http://www.  If you still do this, it's no problem though.<br>You can type in either multiple or just one site, if you want multiple sites seperate them with a comma.<br>To make a script run on specified domain you can use the asterisk. Putting the asterisk like this:<br>*.google.com<br>Will let it run on play.google.com but not google.com, to do this type it like this<br>*google.com<br>To use the asterisk for behind a domain simply use it like this:<br>google.com*<br>Putting a slash in front of it will not let it identify with sites without a / after it<br>Don't use multiple asterisks in one site, instead you can split them into two different sites as in:<br>*google.com*<br>Turns into:<br>*google.com and google.com*" });

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });
				$("#gearicon").tooltip({ content: "Settings" })

				//Doing the question marks
				document.getElementById("whenwillitrun").onchange = function () {
					var ya = document.getElementById("whenwillitrun").value;

					if (ya == "On Click") {
						$("#questionmark").attr("title", " ");
						$("#questionmark").tooltip({ content: "Runs when you click the item in your right-click-menu, this can be used to alter the page etc." });
						$("#whentorundiv").hide();
						$("#questionmark").css("margin-left", "105%");
					}
					if (ya == "On Visiting:") {
						$("#questionmark").attr("title", " ")
						$("#questionmark").tooltip({ content: "Runs on visiting specified site(s), this will be hidden in the rightclick menu" });
						$("#whentorundiv").show();
						$("#questionmark").css("margin-left", "21.5%");
					}
					if (ya == "Always run") {
						$("#questionmark").attr("title", " ")
						$("#questionmark").tooltip({ content: "Runs on every http or https you visit, this means basically every site except for local pages in your browser (extensions, settings etc.) and on files you open that are on your computer, this will be hidden in the rightclick menu" });
						$("#whentorundiv").hide();
						$("#questionmark").css("margin-left", "105%");
					}
				}

				//Displaying correct thing when to run and stuff
				var za = splitallboxdatathing[0];
				if (za != "0" && za != "2") {
					//First display corerct thingy
					$("#whenwillitrun").html('<option id="onvisit">On Visiting:</option><option id="always">Always Run</option><option id="onnclick">On Click</option>');
					$("#whentorundiv").show();
					$("#questionmark").css("margin-left", "21.5%");

					//Then fill in the input with all the data
					za = za.split("1,");
					var zb = "";
					var zc = 1;
					if (za.length > 2) {
						//Fix this stuff

						while (za.length > zc) {
							zb = zb + za[zc];

							zc++
						}
					}
					else {
						zb = za[1];
					}

					document.getElementById("whendoesitrun").value = zb;

				}
				else {
					if (za == "0") {
						$("#questionmark").attr("title", " ");
						$("#questionmark").tooltip({ content: "Runs when you click the item in your right-click-menu, this can be used to alter the page etc." });
					}
					if (za == "2") {
						$("#whenwillitrun").html('<option id="always">Always Run</option><option id="onvisit">On Visiting:</option><option id="onnclick">On Click</option>');
					}
				}

				//Doing the green button stuff
				var ia = localStorage.scriptoptions;
				ia = ia.split(",");
				ia = ia[24];
				if (ia == "1") {
					//See if /*execute locally*/ is in the code
					var ib = document.getElementById("editinputarea").innerHTML;
					if (ib.search("execute locally") > -1) {
						//Display thingy and remove text from code
						$("#greenbutton").html('<img id="theactualcircle" style="width:20px;" src="Thumbnails/full circle.png">')
						var ic = document.getElementById("editinputarea").value;
						ic = ic.replace("/*execute locally*/\n", "");
						ic = ic.replace("//execute locally\n", "");
						$("#editinputarea").html(ic);
					}

					//Set the button's onclick
					$("#greenbutton").click(function () {
						var id = $("#greenbutton").html();
						if (id == '<img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png">') {
							$("#theactualcircle").attr("src", "Thumbnails/full circle.png");
							var id = document.getElementById("editinputarea").value;

							id = id.replace("/*execute locally*/\n\n", "");
							id = id.replace("/*execute locally*/\n", "");
							id = id.replace("/*execute locally*/", "");

							$("#editinputarea").html(id);
						}
						if (id == '<img id="theactualcircle" style="width:20px;" src="Thumbnails/full circle.png">') {
							$("#theactualcircle").attr("src", "Thumbnails/Empty circle.png");
							var id = document.getElementById("editinputarea").value;
							id = "/*execute locally*/\n\n" + id;
							$("#editinputarea").html(id);
						}
					})
				}
				else {
					$("#greenbutton").css("display", "none");
				}

				//Hiding the bottom thing
				$(".settingsdiv").css("display", "none");

				//onclick of settingsicon
				$("#gearicon").click(function () {
					$(".startingdiv").fadeTo(500, 0);
					setTimeout(function () {
						$(".startingdiv").css("display", "none")

						setTimeout(function () {
							$(".settingsdiv").css("display", "").css("opacity", "0").fadeTo(500, 1.0)
						}, 500);
					}, 500);
				});

				//Onclick of backbutton
				$("#optionsbackbutton").click(function () {
					$(".settingsdiv").fadeTo(500, 0);
					setTimeout(function () {
						$(".settingsdiv").css("display", "none")

						setTimeout(function () {
							$(".startingdiv").css("display", "").css("opacity", "0").fadeTo(500, 1.0)
						}, 500);
					}, 500);
				});

				//Setting all the onclicks
				var ai = 0;
				var aj = 0;
				var ak = 0;

				//Onclick of close button
				$("#optionsexitbutton").click(function () {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				})

				//disable the ones that are already asked for
				var ia = localStorage.getItem("scriptoptions");
				ia = ia.split(",");

				if (ia[0] == "1") {
					document.getElementById("alarmspermission").setAttribute("disabled", "disabled");
				}
				if (ia[1] == "1") {
					document.getElementById("backgroundpermission").setAttribute("disabled", "disabled");
				}
				if (ia[2] == "1") {
					document.getElementById("bookmarkspermission").setAttribute("disabled", "disabled");
				}
				if (ia[3] == "1") {
					document.getElementById("clipboardreadpermission").setAttribute("disabled", "disabled");
				}
				if (ia[4] == "1") {
					document.getElementById("clipboardwritepermission").setAttribute("disabled", "disabled");
				}
				if (ia[5] == "1") {
					document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
				}
				if (ia[6] == "1") {
					document.getElementById("cookiespermission").setAttribute("disabled", "disabled");
				}
				if (ia[7] == "1") {
					document.getElementById("historypermission").setAttribute("disabled", "disabled");
				}
				if (ia[10] == "1") {
					document.getElementById("idlepermission").setAttribute("disabled", "disabled");
				}
				if (ia[11] == "1") {
					document.getElementById("managementpermission").setAttribute("disabled", "disabled");
				}
				if (ia[12] == "1") {
					document.getElementById("notificationsidv").setAttribute("disabled", "disabled");
				}
				if (ia[13] == "1") {
					document.getElementById("privacypermission").setAttribute("disabled", "disabled");
				}
				if (ia[16] == "1") {
					document.getElementById("storagepermission").setAttribute("disabled", "disabled");
				}
				if (ia[18] == "1") {
					document.getElementById("topsitespermission").setAttribute("disabled", "disabled");
				}
				if (ia[19] == "1") {
					document.getElementById("ttspermission").setAttribute("disabled", "disabled");
				}
				if (ia[21] == "1") {
					document.getElementById("webnavigationpermission").setAttribute("disabled", "disabled");
				}
				if (ia[22] == "1") {
					document.getElementById("webrequestpermission").setAttribute("disabled", "disabled");
				}
				if (ia[23] == "1") {
					document.getElementById("webrequestblockingpermission").setAttribute("disabled", "disabled");
				}
				if (ia[24] == "1") {
					document.getElementById("showdot").checked = true;
				}
				if (ia[25] == "1") {
					document.getElementById("browsingdatapermissions").setAttribute("disabled", "disabled");
				}
				if (ia[26] == "1") {
					document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
				}
				if (ia[27] == "1") {
					document.getElementById("desktopcapturepermission").setAttribute("disabled", "disabled");
				}
				if (ia[28] == "1") {
					document.getElementById("downloadspermission").setAttribute("disabled", "disabled");
				}
				if (ia[29] == "1") {
					document.getElementById("geolocationpermission").setAttribute("disabled", "disabled");
				}
				if (ia[30] == "1") {
					document.getElementById("powerpermission").setAttribute("disabled", "disabled");
				}
				if (ia[31] == "1") {
					document.getElementById("proxypermission").setAttribute("disabled", "disabled");
				}
				if (ia[32] == "1") {
					document.getElementById("pushmessagingpermission").setAttribute("disabled", "disabled");
				}


				//Ask for hte permissions/onclicks
				$("#alarmspermission").click(function () {
					chrome.permissions.request({
						permissions: ["alarms"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[0] = 1;
							document.getElementById("alarmspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#backgroundpermission").click(function () {
					chrome.permissions.request({
						permissions: ["background"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[1] = 1;
							document.getElementById("backgroundpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#bookmarkspermission").click(function () {
					chrome.permissions.request({
						permissions: ["bookmarks"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[2] = 1;
							document.getElementById("bookmarkspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#clipboardreadpermission").click(function () {
					chrome.permissions.request({
						permissions: ["clipboardRead"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[3] = 1;
							document.getElementById("clipboardreadpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#clipboardwritepermission").click(function () {
					chrome.permissions.request({
						permissions: ["clipboardWrite"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[4] = 1;
							document.getElementById("clipboardwritepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#contentsettingspermission").click(function () {
					chrome.permissions.request({
						permissions: ["contentSettings"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[5] = 1;
							document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#cookiespermission").click(function () {
					chrome.permissions.request({
						permissions: ["cookies"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[6] = 1;
							document.getElementById("cookiespermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#historypermission").click(function () {
					chrome.permissions.request({
						permissions: ["history"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[7] = 1;
							document.getElementById("historypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});


				$("#idlepermission").click(function () {
					chrome.permissions.request({
						permissions: ["idle"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[10] = 1;
							document.getElementById("idlepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#managementpermission").click(function () {
					chrome.permissions.request({
						permissions: ["management"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[11] = 1;
							document.getElementById("managementpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#notificationsidv").click(function () {
					chrome.permissions.request({
						permissions: ["notifications"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[12] = 1;
							document.getElementById("notificationsidv").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#privacypermission").click(function () {
					chrome.permissions.request({
						permissions: ["privacy"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[13] = 1;
							document.getElementById("privacypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#storagepermission").click(function () {
					chrome.permissions.request({
						permissions: ["storage"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[16] = 1;
							document.getElementById("storagepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#topsitespermission").click(function () {
					chrome.permissions.request({
						permissions: ["topSites"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[18] = 1;
							document.getElementById("topsitespermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#ttspermission").click(function () {
					chrome.permissions.request({
						permissions: ["tts"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[19] = 1;
							document.getElementById("ttspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webnavigationpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webNavigation"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[21] = 1;
							document.getElementById("webnavigationpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webrequestpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequest"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[22] = 1;
							document.getElementById("webrequestpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webrequestblockingpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequestBlocking"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[23] = 1;
							document.getElementById("webrequestblockingpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#showdot").click(function () {
					var hd = document.getElementById("showdot").checked;
					if (hd === true) {
						var ha = localStorage.getItem("scriptoptions");
						ha = ha.split(",");
						ha[24] = 1;
						var hb = 0;
						var hc = "";
						while (hb < ha.length) {
							if (hb == 32) {
								hc = hc + ha[hb];
							}
							else {
								hc = hc + ha[hb] + ",";
							}

							hb++;
						}
						localStorage.scriptoptions = hc;
					}
					else {
						var ha = localStorage.getItem("scriptoptions");
						ha = ha.split(",");
						ha[24] = 0;
						var hb = 0;
						var hc = "";
						while (hb < ha.length) {
							if (hb == 32) {
								hc = hc + ha[hb];
							}
							else {
								hc = hc + ha[hb] + ",";
							}

							hb++;
						}
						localStorage.scriptoptions = hc;
					}
				})

				$("#browsingdatapermissions").click(function () {
					chrome.permissions.request({
						permissions: ["browsingData"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[25] = 1;
							document.getElementById("browsingdatapermissions").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#contentsettingspermission").click(function () {
					chrome.permissions.request({
						permissions: ["contentSettings"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[26] = 1;
							document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#desktopcapturepermission").click(function () {
					chrome.permissions.request({
						permissions: ["desktopCapture"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[27] = 1;
							document.getElementById("desktopcapturepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#downloadspermission").click(function () {
					chrome.permissions.request({
						permissions: ["downloads"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[28] = 1;
							document.getElementById("downloadspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#geolocationpermission").click(function () {
					chrome.permissions.request({
						permissions: ["geolocation"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[29] = 1;
							document.getElementById("geolocationpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#powerpermission").click(function () {
					chrome.permissions.request({
						permissions: ["power"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[30] = 1;
							document.getElementById("powerpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#proxypermission").click(function () {
					chrome.permissions.request({
						permissions: ["proxy"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[31] = 1;
							document.getElementById("proxypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#pushmessagingpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequestBlocking"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("pushMessaging");
							ha = ha.split(",");
							ha[32] = 1;
							document.getElementById("pushmessagingpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});


				//END OF THAT STUFF


				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {
						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);

				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("editinputarea").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}

				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("editinputarea").value;
					var type = "Script";



					if ($("#theactualcircle").attr("src") == "Thumbnails/full circle.png") {
						newdata = "/*execute locally*/\n" + newdata;
					}

					//Saving the way to run with it
					if (document.getElementById("whenwillitrun").value == "On Click") {
						newdata = "0%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "On Visiting:") {
						newdata = "1," + document.getElementById("whendoesitrun").value + ",%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "Always Run") {
						newdata = "2%124" + newdata
					}

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("editinputarea").value;
					var type = "Script";

					if ($("#theactualcircle").attr("src") == "Thumbnails/full circle.png") {
						newdata = "/*execute locally*/\n" + newdata;
					}

					//Saving the way to run with it
					if (document.getElementById("whenwillitrun").value == "On Click") {
						newdata = "0%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "On Visiting:") {
						newdata = "1," + document.getElementById("whendoesitrun").value + "%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "Always Run") {
						newdata = "2%124" + newdata
					}

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });


					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}
			}
			if (allboxdata[1] == "Link") {
				if (screen.width < 1440) {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}

				if (screen.width > 1439 && screen.width < 1920) {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}
				if (screen.width > 1919) {

					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				if (screen.width == "1440") {
					$(".website").css("width", "94%");
					$(".datext").css("font-size", "180%");
					$("#text9").css("font-size", "140%");
					$("#urlinputbox").attr("size", "44");
				}

				$('.website').click(function (event) {
					var bc = event.target.id;

					var bd = bc.search("img");
					var be = bc.search("text");
					var bg = bc.search("link");

					if (bd > -1) {
						var bf = bc.split("img");
						bf = bf[1];
					}
					if (be > -1) {
						var bf = bc.split("text");
						bf = bf[1];
					}
					if (bg > -1) {
						var bf = bc.split("link");
						bf = bf[1];
					}

					if (!bf) {
						return false;
					}

					if (bf != 1) {
						document.getElementById("link1").style.border = "2px solid black";
					}
					if (bf != 2) {
						document.getElementById("link2").style.border = "2px solid black";
					}
					if (bf != 3) {
						document.getElementById("link3").style.border = "2px solid black";
					}
					if (bf != 4) {
						document.getElementById("link4").style.border = "2px solid black";
					}
					if (bf != 5) {
						document.getElementById("link5").style.border = "2px solid black";
					}
					if (bf != 6) {
						document.getElementById("link6").style.border = "2px solid black";
					}
					if (bf != 7) {
						document.getElementById("link7").style.border = "2px solid black";
					}
					if (bf != 8) {
						document.getElementById("link8").style.border = "2px solid black";
					}
					if (bf != 9) {
						document.getElementById("link9").style.border = "2px solid black";
					}
					if (bf != 10) {
						document.getElementById("link10").style.border = "2px solid black";
					}
					if (bf != 11) {
						document.getElementById("link11").style.border = "2px solid black";
					}
					if (bf != 12) {
						document.getElementById("link12").style.border = "2px solid black";
					}
					if (bf != 13) {
						document.getElementById("link13").style.border = "2px solid black";
					}
					if (bf != 14) {
						document.getElementById("link14").style.border = "2px solid black";
					}

					document.getElementById("link" + bf).style.border = "2px solid red";

					document.getElementById("urlinputbox").value = document.getElementById("text" + bf).innerHTML;

					document.getElementById("urlinputbox").onchange = function () {
						document.getElementById("link" + bf).style.border = "2px solid black";
					}

				});

				//All onclicks
				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("urlinputbox").value;
					var type = "Link";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("urlinputbox").value;
					var type = "Link";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;

					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = "0%124";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("urlinputbox").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}

				}
			}

			if (allboxdata[1] == "Divider") {
				document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>divider</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:2%;font-size:500%;">Change name: <input style="font-size:100%;" size="9" id="changename" value="' + allboxdata[0] + '"></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				//All onclicks
				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = allboxdata[2];

					var type = "Divider";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = allboxdata[2];
					var type = "Divider";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = allboxdata[2];

							data3 = "0%124" + data3;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}

			}

			if (allboxdata[1] == "Menu") {
				document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>menu</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside">Number of child items <input id="numberofchildren" value="' + allboxdata[2] + '">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><br><br><div id="wherethechildrengo"><div id="gotop"></div><div id="goleft"></div><div id="wheretheboxesgotwo"></div><div id="goright"></div><div id="godown"></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');

				var bg = 1;

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("numberofchildren").value;

					var type = "Menu";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("numberofchildren").value;
					var type = "Menu";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						paintsettings();
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("numberofchildren").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = document.getElementById("numberofchildren").value;

							data3 = "0%124";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}


			}
		}
	});

	//And again....
	$('.Divideroutside').click(function openeditingbox(event, id) {

		if (exportmode == "1") {
			var ab = event.target.id;
			if (ab.search("rowie") > -1) {
				var ac = ab.split("rowie");
				var ad = ac[1];
			}
			if (ab.search("thingy") > -1) {
				var ac = ab.split("thingy");
				var ad = ac[1];
			}
			if (ab.search("block") > -1) {
				var ac = ab.split("block");
				var ad = ac[1];
			}
			if (ab.search("otherthing") > -1) {
				var ac = ab.split("otherthing");
				var ad = ac[1];
			}

			if (!ad) {
				return false;
			}

			if (document.getElementById("itemcheckbox" + ad).checked === false) {
				$("#itemcheckbox" + ad).attr("checked", "true");
			}
			else {
				$("#itemcheckbox" + ad).removeAttr("checked");
			}
		}
		else {

			if (id === undefined) {

				var ab = event.target.id;

				if (ab.search("rowie") > -1) {
					var ac = ab.split("rowie");
					var ad = ac[1];
				}
				if (ab.search("thingy") > -1) {
					var ac = ab.split("thingy");
					var ad = ac[1];
				}
				if (ab.search("block") > -1) {
					var ac = ab.split("block");
					var ad = ac[1];
				}
				if (ab.search("otherthing") > -1) {
					var ac = ab.split("otherthing");
					var ad = ac[1];
				}

				if (!ad) {
					return false;
				}

			}
			else {
				var ad = id;
			}

			//Displaying the edit screen

			document.getElementById("details").style.webkitTransform = "scale(1)";
			document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
			document.getElementById("details").style.webkitTransitionDuration = "250ms";
			document.getElementById("darkbackground").style.display = "block";
			document.getElementById("darkbackground").style.webkitAnimation = "colorchange 1s";

			//Filling in the edit screen

			var allboxdata = localStorage.getItem(ad);

			allboxdata = allboxdata.split("%123");

			var childornot = "none";

			if (allboxdata[1] == "Script") {
				var splitallboxdatathing = allboxdata[2].split("%124");
				whatinsidetheinputstuff = splitallboxdatathing[1];

				document.getElementById("editingbox").innerHTML = ('<div class="startingdiv"><center><div id="nametext">Now editing <b>script</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside"><div id="whentorun">Run at: <select id="whenwillitrun"><option id="onnclick">On Click</option><option id="onvisit">On Visiting:</option><option id="always">Always run</option></select><div id="questionmark" title=" ">?</div><div id="whentorundiv">Run on visiting:<input id="whendoesitrun" size="100"><div id="questionmarktwo" title=" ">?</div></div></div>You can edit JavaScript code here, however i recommend editing on <a href="http://www.jsbin.com" target="_blank">JsBin</a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <div id="greenbutton"><img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png"></div>&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><image id="gearicon" title=" " src="Thumbnails/gear.png" style="margin-top:1px; margin-left:2px;" width="20px" height="20px"><br><textarea id="editinputarea" cols="130" rows="30">' + whatinsidetheinputstuff + '</textarea></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div><div class="settingsdiv" ><div id="titledivider"><center><b>Stuff to know and editing settings for Script</b><br><hr></center></div><div id="leftsettinsside"><center>Every script by default has jquery 2.0.3 in it, this is included by default and whether to use it is your choice. <br>You can add the line /*execute locally*/ to your code and it will execute in the extension instead of on the page, this gives it additional permissions such as the ability to see what you selected when you clicked it, or other information about the page.<br> By default you have the permissions to open tabs (<a href="http://developer.chrome.com/extensions/tabs.html" target="_blank">chrome.tabs</a>) and the ability to see what you did while clicking right-mouse-button (<a href="http://developer.chrome.com/extensions/contextMenus.html#type-OnClickData" target="_blank">Chrome.contextMenus onclickdata</a>), the way to use these is to put the property (linkUrl, pageUrl,selectionText or whatever) in the function this way:<br> function myfunction(pageurl)<br><br>Be sure to put the property in all lower case. This will declare the function, and later on you can execute it like on the end of your script with the code:<br> myfunction(pageurl);<br><br>You even the ability to create right-mouse-click-menus but that is already covered by the extension. Due to that being quite limited if you look at the entire range of <a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">chrome APIs,</a>, and not wanting to prompt users for unnessecary permissions on installing, I have made it possible to ask for additional permissions on the right side of this page. These Chrome APIs can then be used by you, and you can cover even more with programming.<br> Users seeing "wants to acces all data on harddrive" on install probably do not trust it, that is why you can ask for permissions on the right. Simply click the button, and give permission depending on if you want it, you can then use the linked chrome API to increase the things you can do.<br>There are also a few spots you can NOT use in storing things in the <b>extensions</b> localStorage. These places are <b>any number on its own, firsttime, numberofrows, optionson, scriptoptions, waitforsearch, whatpage</b>, the rest can be used normally.<br>Below are some options for programming in this extension.<br><hr><input type="checkbox" id="showdot">Checking this will display a colored dot instead of the line /*execute locally*/</center><br></div><div id="rightsettingsside"><div id="leftsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="alarmspermission">Alarms</button>&nbsp;<a target="_blank" href="http://developer.chrome.com/extensions/alarms.html">chrome.alarms</a></div><div class="permissiondiv"><button id="backgroundpermission">background</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">background</a></div><div class="permissiondiv"><button id="bookmarkspermission">bookmarks</button>&nbsp;<a href="http://developer.chrome.com/extensions/bookmarks.html" target="_blank">chrome.bookmarks</a></div><div class="permissiondiv"><button id="clipboardreadpermission">clipboardRead</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardRead</a></div><div class="permissiondiv"><button id="clipboardwritepermission">clipboardWrite</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardWrite</a></div><div class="permissiondiv"><button id="contentsettingspermission">ContentSettings</button>&nbsp;<a href="http://developer.chrome.com/extensions/contentSettings.html" target="_blank">chrome.contentSettings</a></div><div class="permissiondiv"><button id="cookiespermission">cookies</button><a href="http://developer.chrome.com/extensions/cookies.html" target="_blank">chrome.cookies</a></div><div class="permissiondiv"><button id="historypermission">history</button>&nbsp;<a href="http://developer.chrome.com/extensions/history.html" target="_blank">chrome.history</a></div><div class="permissiondiv"><button id="idlepermission">idle</button>&nbsp;<a href="http://developer.chrome.com/extensions/idle.html" target="_blank">chrome.idle</a></div><div class="permissiondiv"><button id="managementpermission">management</button>&nbsp;<a href="http://developer.chrome.com/extensions/management.html" target="_blank">chrome.management</a></div>  </div><div id="rightsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="notificationsidv">notifications</button>&nbsp;<a href="http://developer.chrome.com/extensions/desktop_notifications.html" target="_blank">Desktop Notifications</a></div><div class="permissiondiv"><button id="privacypermission">privacy</button>&nbsp;<a href="http://developer.chrome.com/extensions/privacy.html" target="_blank">chrome.privacy</a></div><div class="permissiondiv"><button id="storagepermission">storage</button>&nbsp;<a href="http://developer.chrome.com/extensions/storage.html" target="_blank">chrome.storage</a></div><div class="permissiondiv"><button id="topsitespermission">topSites</button> &nbsp;<a href="http://developer.chrome.com/extensions/topSites.html" target="_blank">chrome.topSites</a></div><div class="permissiondiv"><button id="ttspermission">tts</button>&nbsp;<a href="http://developer.chrome.com/extensions/tts.html" target="_blank">chrome.tts</a></div><div class="permissiondiv"><button id="webnavigationpermission">webNavigation</button>&nbsp;<a href="http://developer.chrome.com/extensions/webNavigation.html" target="_blank">chrome.webNavigation</a></div><div class="permissiondiv"><button id="webrequestpermission">webRequest</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequest</a></div><div class="permissiondiv"><button id="webrequestblockingpermission">webRequestBlocking</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequestBlocking</a></div></div></div><div id="bottomsettingsside"><div id="optionsbackbutton"><center><br><br><b>Back</b><br>Go back to script editing page</center></div><div id="optionsexitbutton"><center><br><br><b>Exit</b><br>Close this popup</center></div></div></div>')


				$("#whentorundiv").hide();

				//Tooltippies
				$("#questionmarktwo").tooltip({ content: "You don't have to use http://www.  If you still do this, it's no problem though.<br>You can type in either multiple or just one site, if you want multiple sites seperate them with a comma.<br>To make a script run on specified domain you can use the asterisk. Putting the asterisk like this:<br>*.google.com<br>Will let it run on play.google.com but not google.com, to do this type it like this<br>*google.com<br>To use the asterisk for behind a domain simply use it like this:<br>google.com*<br>Putting a slash in front of it will not let it identify with sites without a / after it<br>Don't use multiple asterisks in one site, instead you can split them into two different sites as in:<br>*google.com*<br>Turns into:<br>*google.com and google.com*" });

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });
				$("#gearicon").tooltip({ content: "Settings" })

				//Doing the question marks
				document.getElementById("whenwillitrun").onchange = function () {
					var ya = document.getElementById("whenwillitrun").value;

					if (ya == "On Click") {
						$("#questionmark").attr("title", " ");
						$("#questionmark").tooltip({ content: "Runs when you click the item in your right-click-menu, this can be used to alter the page etc." });
						$("#whentorundiv").hide();
						$("#questionmark").css("margin-left", "105%");
					}
					if (ya == "On Visiting:") {
						$("#questionmark").attr("title", " ")
						$("#questionmark").tooltip({ content: "Runs on visiting specified site(s), this will be hidden in the rightclick menu" });
						$("#whentorundiv").show();
						$("#questionmark").css("margin-left", "21.5%");
					}
					if (ya == "Always run") {
						$("#questionmark").attr("title", " ")
						$("#questionmark").tooltip({ content: "Runs on every http or https you visit, this means basically every site except for local pages in your browser (extensions, settings etc.) and on files you open that are on your computer, this will be hidden in the rightclick menu" });
						$("#whentorundiv").hide();
						$("#questionmark").css("margin-left", "105%");
					}
				}

				//Displaying correct thing when to run and stuff
				var za = splitallboxdatathing[0];
				if (za != "0" && za != "2") {
					//First display corerct thingy
					$("#whenwillitrun").html('<option id="onvisit">On Visiting:</option><option id="always">Always Run</option><option id="onnclick">On Click</option>');
					$("#whentorundiv").show();
					$("#questionmark").css("margin-left", "21.5%");

					//Then fill in the input with all the data
					za = za.split("1,");
					var zb = "";
					var zc = 1;
					if (za.length > 2) {
						//Fix this stuff

						while (za.length > zc) {
							zb = zb + za[zc];

							zc++
						}
					}
					else {
						zb = za[1];
					}

					document.getElementById("whendoesitrun").value = zb;

				}
				else {
					if (za == "0") {
						$("#questionmark").attr("title", " ");
						$("#questionmark").tooltip({ content: "Runs when you click the item in your right-click-menu, this can be used to alter the page etc." });
					}
					if (za == "2") {
						$("#whenwillitrun").html('<option id="always">Always Run</option><option id="onvisit">On Visiting:</option><option id="onnclick">On Click</option>');
					}
				}

				//Doing the green button stuff
				var ia = localStorage.scriptoptions;
				ia = ia.split(",");
				ia = ia[24];
				if (ia == "1") {
					//See if /*execute locally*/ is in the code
					var ib = document.getElementById("editinputarea").innerHTML;
					if (ib.search("execute locally") > -1) {
						//Display thingy and remove text from code
						$("#greenbutton").html('<img id="theactualcircle" style="width:20px;" src="Thumbnails/full circle.png">')
						var ic = document.getElementById("editinputarea").value;
						ic = ic.replace("/*execute locally*/\n", "");
						ic = ic.replace("//execute locally\n", "");
						$("#editinputarea").html(ic);
					}

					//Set the button's onclick
					$("#greenbutton").click(function () {
						var id = $("#greenbutton").html();
						if (id == '<img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png">') {
							$("#theactualcircle").attr("src", "Thumbnails/full circle.png");
							var id = document.getElementById("editinputarea").value;

							id = id.replace("/*execute locally*/\n\n", "");
							id = id.replace("/*execute locally*/\n", "");
							id = id.replace("/*execute locally*/", "");

							$("#editinputarea").html(id);
						}
						if (id == '<img id="theactualcircle" style="width:20px;" src="Thumbnails/full circle.png">') {
							$("#theactualcircle").attr("src", "Thumbnails/Empty circle.png");
							var id = document.getElementById("editinputarea").value;
							id = "/*execute locally*/\n\n" + id;
							$("#editinputarea").html(id);
						}
					})
				}
				else {
					$("#greenbutton").css("display", "none");
				}

				//Hiding the bottom thing
				$(".settingsdiv").css("display", "none");

				//onclick of settingsicon
				$("#gearicon").click(function () {
					$(".startingdiv").fadeTo(500, 0);
					setTimeout(function () {
						$(".startingdiv").css("display", "none")

						setTimeout(function () {
							$(".settingsdiv").css("display", "").css("opacity", "0").fadeTo(500, 1.0)
						}, 500);
					}, 500);
				});

				//Onclick of backbutton
				$("#optionsbackbutton").click(function () {
					$(".settingsdiv").fadeTo(500, 0);
					setTimeout(function () {
						$(".settingsdiv").css("display", "none")

						setTimeout(function () {
							$(".startingdiv").css("display", "").css("opacity", "0").fadeTo(500, 1.0)
						}, 500);
					}, 500);
				});

				//Setting all the onclicks
				var ai = 0;
				var aj = 0;
				var ak = 0;

				//Onclick of close button
				$("#optionsexitbutton").click(function () {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				})

				//disable the ones that are already asked for
				var ia = localStorage.getItem("scriptoptions");
				ia = ia.split(",");

				if (ia[0] == "1") {
					document.getElementById("alarmspermission").setAttribute("disabled", "disabled");
				}
				if (ia[1] == "1") {
					document.getElementById("backgroundpermission").setAttribute("disabled", "disabled");
				}
				if (ia[2] == "1") {
					document.getElementById("bookmarkspermission").setAttribute("disabled", "disabled");
				}
				if (ia[3] == "1") {
					document.getElementById("clipboardreadpermission").setAttribute("disabled", "disabled");
				}
				if (ia[4] == "1") {
					document.getElementById("clipboardwritepermission").setAttribute("disabled", "disabled");
				}
				if (ia[5] == "1") {
					document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
				}
				if (ia[6] == "1") {
					document.getElementById("cookiespermission").setAttribute("disabled", "disabled");
				}
				if (ia[7] == "1") {
					document.getElementById("historypermission").setAttribute("disabled", "disabled");
				}
				if (ia[10] == "1") {
					document.getElementById("idlepermission").setAttribute("disabled", "disabled");
				}
				if (ia[11] == "1") {
					document.getElementById("managementpermission").setAttribute("disabled", "disabled");
				}
				if (ia[12] == "1") {
					document.getElementById("notificationsidv").setAttribute("disabled", "disabled");
				}
				if (ia[13] == "1") {
					document.getElementById("privacypermission").setAttribute("disabled", "disabled");
				}
				if (ia[16] == "1") {
					document.getElementById("storagepermission").setAttribute("disabled", "disabled");
				}
				if (ia[18] == "1") {
					document.getElementById("topsitespermission").setAttribute("disabled", "disabled");
				}
				if (ia[19] == "1") {
					document.getElementById("ttspermission").setAttribute("disabled", "disabled");
				}
				if (ia[21] == "1") {
					document.getElementById("webnavigationpermission").setAttribute("disabled", "disabled");
				}
				if (ia[22] == "1") {
					document.getElementById("webrequestpermission").setAttribute("disabled", "disabled");
				}
				if (ia[23] == "1") {
					document.getElementById("webrequestblockingpermission").setAttribute("disabled", "disabled");
				}
				if (ia[24] == "1") {
					document.getElementById("showdot").checked = true;
				}
				if (ia[25] == "1") {
					document.getElementById("browsingdatapermissions").setAttribute("disabled", "disabled");
				}
				if (ia[26] == "1") {
					document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
				}
				if (ia[27] == "1") {
					document.getElementById("desktopcapturepermission").setAttribute("disabled", "disabled");
				}
				if (ia[28] == "1") {
					document.getElementById("downloadspermission").setAttribute("disabled", "disabled");
				}
				if (ia[29] == "1") {
					document.getElementById("geolocationpermission").setAttribute("disabled", "disabled");
				}
				if (ia[30] == "1") {
					document.getElementById("powerpermission").setAttribute("disabled", "disabled");
				}
				if (ia[31] == "1") {
					document.getElementById("proxypermission").setAttribute("disabled", "disabled");
				}
				if (ia[32] == "1") {
					document.getElementById("pushmessagingpermission").setAttribute("disabled", "disabled");
				}


				//Ask for hte permissions/onclicks
				$("#alarmspermission").click(function () {
					chrome.permissions.request({
						permissions: ["alarms"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[0] = 1;
							document.getElementById("alarmspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#backgroundpermission").click(function () {
					chrome.permissions.request({
						permissions: ["background"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[1] = 1;
							document.getElementById("backgroundpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#bookmarkspermission").click(function () {
					chrome.permissions.request({
						permissions: ["bookmarks"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[2] = 1;
							document.getElementById("bookmarkspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#clipboardreadpermission").click(function () {
					chrome.permissions.request({
						permissions: ["clipboardRead"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[3] = 1;
							document.getElementById("clipboardreadpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#clipboardwritepermission").click(function () {
					chrome.permissions.request({
						permissions: ["clipboardWrite"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[4] = 1;
							document.getElementById("clipboardwritepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#contentsettingspermission").click(function () {
					chrome.permissions.request({
						permissions: ["contentSettings"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[5] = 1;
							document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#cookiespermission").click(function () {
					chrome.permissions.request({
						permissions: ["cookies"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[6] = 1;
							document.getElementById("cookiespermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#historypermission").click(function () {
					chrome.permissions.request({
						permissions: ["history"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[7] = 1;
							document.getElementById("historypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});


				$("#idlepermission").click(function () {
					chrome.permissions.request({
						permissions: ["idle"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[10] = 1;
							document.getElementById("idlepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#managementpermission").click(function () {
					chrome.permissions.request({
						permissions: ["management"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[11] = 1;
							document.getElementById("managementpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#notificationsidv").click(function () {
					chrome.permissions.request({
						permissions: ["notifications"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[12] = 1;
							document.getElementById("notificationsidv").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#privacypermission").click(function () {
					chrome.permissions.request({
						permissions: ["privacy"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[13] = 1;
							document.getElementById("privacypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#storagepermission").click(function () {
					chrome.permissions.request({
						permissions: ["storage"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[16] = 1;
							document.getElementById("storagepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#topsitespermission").click(function () {
					chrome.permissions.request({
						permissions: ["topSites"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[18] = 1;
							document.getElementById("topsitespermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#ttspermission").click(function () {
					chrome.permissions.request({
						permissions: ["tts"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[19] = 1;
							document.getElementById("ttspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webnavigationpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webNavigation"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[21] = 1;
							document.getElementById("webnavigationpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webrequestpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequest"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[22] = 1;
							document.getElementById("webrequestpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webrequestblockingpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequestBlocking"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[23] = 1;
							document.getElementById("webrequestblockingpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#showdot").click(function () {
					var hd = document.getElementById("showdot").checked;
					if (hd === true) {
						var ha = localStorage.getItem("scriptoptions");
						ha = ha.split(",");
						ha[24] = 1;
						var hb = 0;
						var hc = "";
						while (hb < ha.length) {
							if (hb == 32) {
								hc = hc + ha[hb];
							}
							else {
								hc = hc + ha[hb] + ",";
							}

							hb++;
						}
						localStorage.scriptoptions = hc;
					}
					else {
						var ha = localStorage.getItem("scriptoptions");
						ha = ha.split(",");
						ha[24] = 0;
						var hb = 0;
						var hc = "";
						while (hb < ha.length) {
							if (hb == 32) {
								hc = hc + ha[hb];
							}
							else {
								hc = hc + ha[hb] + ",";
							}

							hb++;
						}
						localStorage.scriptoptions = hc;
					}
				})

				$("#browsingdatapermissions").click(function () {
					chrome.permissions.request({
						permissions: ["browsingData"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[25] = 1;
							document.getElementById("browsingdatapermissions").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#contentsettingspermission").click(function () {
					chrome.permissions.request({
						permissions: ["contentSettings"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[26] = 1;
							document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#desktopcapturepermission").click(function () {
					chrome.permissions.request({
						permissions: ["desktopCapture"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[27] = 1;
							document.getElementById("desktopcapturepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#downloadspermission").click(function () {
					chrome.permissions.request({
						permissions: ["downloads"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[28] = 1;
							document.getElementById("downloadspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#geolocationpermission").click(function () {
					chrome.permissions.request({
						permissions: ["geolocation"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[29] = 1;
							document.getElementById("geolocationpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#powerpermission").click(function () {
					chrome.permissions.request({
						permissions: ["power"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[30] = 1;
							document.getElementById("powerpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#proxypermission").click(function () {
					chrome.permissions.request({
						permissions: ["proxy"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[31] = 1;
							document.getElementById("proxypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#pushmessagingpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequestBlocking"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("pushMessaging");
							ha = ha.split(",");
							ha[32] = 1;
							document.getElementById("pushmessagingpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});


				//END OF THAT STUFF


				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {
						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);

				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("editinputarea").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}

				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("editinputarea").value;
					var type = "Script";



					if ($("#theactualcircle").attr("src") == "Thumbnails/full circle.png") {
						newdata = "/*execute locally*/\n" + newdata;
					}

					//Saving the way to run with it
					if (document.getElementById("whenwillitrun").value == "On Click") {
						newdata = "0%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "On Visiting:") {
						newdata = "1," + document.getElementById("whendoesitrun").value + ",%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "Always Run") {
						newdata = "2%124" + newdata
					}

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("editinputarea").value;
					var type = "Script";

					if ($("#theactualcircle").attr("src") == "Thumbnails/full circle.png") {
						newdata = "/*execute locally*/\n" + newdata;
					}

					//Saving the way to run with it
					if (document.getElementById("whenwillitrun").value == "On Click") {
						newdata = "0%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "On Visiting:") {
						newdata = "1," + document.getElementById("whendoesitrun").value + "%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "Always Run") {
						newdata = "2%124" + newdata
					}

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });


					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}
			}
			if (allboxdata[1] == "Link") {
				if (screen.width == "1440") {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}
				if (screen.width == "1920") {

					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				if (screen.width == "1440") {
					$(".website").css("width", "94%");
					$(".datext").css("font-size", "180%");
					$("#text9").css("font-size", "140%");
					$("#urlinputbox").attr("size", "44");
				}

				$('.website').click(function (event) {
					var bc = event.target.id;

					var bd = bc.search("img");
					var be = bc.search("text");
					var bg = bc.search("link");

					if (bd > -1) {
						var bf = bc.split("img");
						bf = bf[1];
					}
					if (be > -1) {
						var bf = bc.split("text");
						bf = bf[1];
					}
					if (bg > -1) {
						var bf = bc.split("link");
						bf = bf[1];
					}

					if (!bf) {
						return false;
					}

					if (bf != 1) {
						document.getElementById("link1").style.border = "2px solid black";
					}
					if (bf != 2) {
						document.getElementById("link2").style.border = "2px solid black";
					}
					if (bf != 3) {
						document.getElementById("link3").style.border = "2px solid black";
					}
					if (bf != 4) {
						document.getElementById("link4").style.border = "2px solid black";
					}
					if (bf != 5) {
						document.getElementById("link5").style.border = "2px solid black";
					}
					if (bf != 6) {
						document.getElementById("link6").style.border = "2px solid black";
					}
					if (bf != 7) {
						document.getElementById("link7").style.border = "2px solid black";
					}
					if (bf != 8) {
						document.getElementById("link8").style.border = "2px solid black";
					}
					if (bf != 9) {
						document.getElementById("link9").style.border = "2px solid black";
					}
					if (bf != 10) {
						document.getElementById("link10").style.border = "2px solid black";
					}
					if (bf != 11) {
						document.getElementById("link11").style.border = "2px solid black";
					}
					if (bf != 12) {
						document.getElementById("link12").style.border = "2px solid black";
					}
					if (bf != 13) {
						document.getElementById("link13").style.border = "2px solid black";
					}
					if (bf != 14) {
						document.getElementById("link14").style.border = "2px solid black";
					}

					document.getElementById("link" + bf).style.border = "2px solid red";

					document.getElementById("urlinputbox").value = document.getElementById("text" + bf).innerHTML;

					document.getElementById("urlinputbox").onchange = function () {
						document.getElementById("link" + bf).style.border = "2px solid black";
					}

				});

				//All onclicks
				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("urlinputbox").value;
					var type = "Link";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("urlinputbox").value;
					var type = "Link";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;

					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = "0%124";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("urlinputbox").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}

				}
			}

			if (allboxdata[1] == "Divider") {
				document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>divider</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:2%;font-size:500%;">Change name: <input style="font-size:100%;" size="9" id="changename" value="' + allboxdata[0] + '"></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				//All onclicks
				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = allboxdata[2];

					var type = "Divider";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = allboxdata[2];
					var type = "Divider";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = allboxdata[2];

							data3 = "0%124" + data3;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}

			}

			if (allboxdata[1] == "Menu") {

				document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>menu</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside">Number of child items <input id="numberofchildren" value="' + allboxdata[2] + '">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><br><br><div id="wherethechildrengo"><div id="gotop"></div><div id="goleft"></div><div id="wheretheboxesgotwo"></div><div id="goright"></div><div id="godown"></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');

				//HIERZO
				if (screen.width < 300) {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>menu</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside">Number of child items <input id="numberofchildren" value="' + allboxdata[2] + '">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><br><br><div id="wherethechildrengo"><div id="gotop"></div><div id="goleft"></div><div id="wheretheboxesgotwo"></div><div id="goright"></div><div id="godown"></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');
				}

				var bg = 1;

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("numberofchildren").value;

					var type = "Menu";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("numberofchildren").value;
					var type = "Menu";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						paintsettings();
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("numberofchildren").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = document.getElementById("numberofchildren").value;

							data3 = "0%124";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}


			}
		}
	});

	//last time
	$('.Menuoutside').click(function openeditingbox(event, id) {

		if (exportmode == "1") {
			var ab = event.target.id;
			if (ab.search("rowie") > -1) {
				var ac = ab.split("rowie");
				var ad = ac[1];
			}
			if (ab.search("thingy") > -1) {
				var ac = ab.split("thingy");
				var ad = ac[1];
			}
			if (ab.search("block") > -1) {
				var ac = ab.split("block");
				var ad = ac[1];
			}
			if (ab.search("otherthing") > -1) {
				var ac = ab.split("otherthing");
				var ad = ac[1];
			}

			if (!ad) {
				return false;
			}

			if (document.getElementById("itemcheckbox" + ad).checked === false) {
				$("#itemcheckbox" + ad).attr("checked", "true");
			}
			else {
				$("#itemcheckbox" + ad).removeAttr("checked");
			}
		}
		else {

			if (id === undefined) {

				var ab = event.target.id;

				if (ab.search("rowie") > -1) {
					var ac = ab.split("rowie");
					var ad = ac[1];
				}
				if (ab.search("thingy") > -1) {
					var ac = ab.split("thingy");
					var ad = ac[1];
				}
				if (ab.search("block") > -1) {
					var ac = ab.split("block");
					var ad = ac[1];
				}
				if (ab.search("otherthing") > -1) {
					var ac = ab.split("otherthing");
					var ad = ac[1];
				}

				if (!ad) {
					return false;
				}

			}
			else {
				var ad = id;
			}

			//Displaying the edit screen

			document.getElementById("details").style.webkitTransform = "scale(1)";
			document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
			document.getElementById("details").style.webkitTransitionDuration = "250ms";
			document.getElementById("darkbackground").style.display = "block";
			document.getElementById("darkbackground").style.webkitAnimation = "colorchange 1s";

			//Filling in the edit screen

			var allboxdata = localStorage.getItem(ad);

			allboxdata = allboxdata.split("%123");

			var childornot = "none";

			if (allboxdata[1] == "Script") {
				var splitallboxdatathing = allboxdata[2].split("%124");
				whatinsidetheinputstuff = splitallboxdatathing[1];

				document.getElementById("editingbox").innerHTML = ('<div class="startingdiv"><center><div id="nametext">Now editing <b>script</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside"><div id="whentorun">Run at: <select id="whenwillitrun"><option id="onnclick">On Click</option><option id="onvisit">On Visiting:</option><option id="always">Always run</option></select><div id="questionmark" title=" ">?</div><div id="whentorundiv">Run on visiting:<input id="whendoesitrun" size="100"><div id="questionmarktwo" title=" ">?</div></div></div>You can edit JavaScript code here, however i recommend editing on <a href="http://www.jsbin.com" target="_blank">JsBin</a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <div id="greenbutton"><img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png"></div>&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><image id="gearicon" title=" " src="Thumbnails/gear.png" style="margin-top:1px; margin-left:2px;" width="20px" height="20px"><br><textarea id="editinputarea" cols="130" rows="30">' + whatinsidetheinputstuff + '</textarea></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div><div class="settingsdiv" ><div id="titledivider"><center><b>Stuff to know and editing settings for Script</b><br><hr></center></div><div id="leftsettinsside"><center>Every script by default has jquery 2.0.3 in it, this is included by default and whether to use it is your choice. <br>You can add the line /*execute locally*/ to your code and it will execute in the extension instead of on the page, this gives it additional permissions such as the ability to see what you selected when you clicked it, or other information about the page.<br> By default you have the permissions to open tabs (<a href="http://developer.chrome.com/extensions/tabs.html" target="_blank">chrome.tabs</a>) and the ability to see what you did while clicking right-mouse-button (<a href="http://developer.chrome.com/extensions/contextMenus.html#type-OnClickData" target="_blank">Chrome.contextMenus onclickdata</a>), the way to use these is to put the property (linkUrl, pageUrl,selectionText or whatever) in the function this way:<br> function myfunction(pageurl)<br><br>Be sure to put the property in all lower case. This will declare the function, and later on you can execute it like on the end of your script with the code:<br> myfunction(pageurl);<br><br>You even the ability to create right-mouse-click-menus but that is already covered by the extension. Due to that being quite limited if you look at the entire range of <a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">chrome APIs,</a>, and not wanting to prompt users for unnessecary permissions on installing, I have made it possible to ask for additional permissions on the right side of this page. These Chrome APIs can then be used by you, and you can cover even more with programming.<br> Users seeing "wants to acces all data on harddrive" on install probably do not trust it, that is why you can ask for permissions on the right. Simply click the button, and give permission depending on if you want it, you can then use the linked chrome API to increase the things you can do.<br>There are also a few spots you can NOT use in storing things in the <b>extensions</b> localStorage. These places are <b>any number on its own, firsttime, numberofrows, optionson, scriptoptions, waitforsearch, whatpage</b>, the rest can be used normally.<br>Below are some options for programming in this extension.<br><hr><input type="checkbox" id="showdot">Checking this will display a colored dot instead of the line /*execute locally*/</center><br></div><div id="rightsettingsside"><div id="leftsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="alarmspermission">Alarms</button>&nbsp;<a target="_blank" href="http://developer.chrome.com/extensions/alarms.html">chrome.alarms</a></div><div class="permissiondiv"><button id="backgroundpermission">background</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">background</a></div><div class="permissiondiv"><button id="bookmarkspermission">bookmarks</button>&nbsp;<a href="http://developer.chrome.com/extensions/bookmarks.html" target="_blank">chrome.bookmarks</a></div><div class="permissiondiv"><button id="clipboardreadpermission">clipboardRead</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardRead</a></div><div class="permissiondiv"><button id="clipboardwritepermission">clipboardWrite</button>&nbsp;<a href="http://developer.chrome.com/extensions/declare_permissions.html" target="_blank">clipboardWrite</a></div><div class="permissiondiv"><button id="contentsettingspermission">ContentSettings</button>&nbsp;<a href="http://developer.chrome.com/extensions/contentSettings.html" target="_blank">chrome.contentSettings</a></div><div class="permissiondiv"><button id="cookiespermission">cookies</button><a href="http://developer.chrome.com/extensions/cookies.html" target="_blank">chrome.cookies</a></div><div class="permissiondiv"><button id="historypermission">history</button>&nbsp;<a href="http://developer.chrome.com/extensions/history.html" target="_blank">chrome.history</a></div><div class="permissiondiv"><button id="idlepermission">idle</button>&nbsp;<a href="http://developer.chrome.com/extensions/idle.html" target="_blank">chrome.idle</a></div><div class="permissiondiv"><button id="managementpermission">management</button>&nbsp;<a href="http://developer.chrome.com/extensions/management.html" target="_blank">chrome.management</a></div>  </div><div id="rightsideofrightside"><div class="permissiondiv" style="margin-top:3%;"><button id="notificationsidv">notifications</button>&nbsp;<a href="http://developer.chrome.com/extensions/desktop_notifications.html" target="_blank">Desktop Notifications</a></div><div class="permissiondiv"><button id="privacypermission">privacy</button>&nbsp;<a href="http://developer.chrome.com/extensions/privacy.html" target="_blank">chrome.privacy</a></div><div class="permissiondiv"><button id="storagepermission">storage</button>&nbsp;<a href="http://developer.chrome.com/extensions/storage.html" target="_blank">chrome.storage</a></div><div class="permissiondiv"><button id="topsitespermission">topSites</button> &nbsp;<a href="http://developer.chrome.com/extensions/topSites.html" target="_blank">chrome.topSites</a></div><div class="permissiondiv"><button id="ttspermission">tts</button>&nbsp;<a href="http://developer.chrome.com/extensions/tts.html" target="_blank">chrome.tts</a></div><div class="permissiondiv"><button id="webnavigationpermission">webNavigation</button>&nbsp;<a href="http://developer.chrome.com/extensions/webNavigation.html" target="_blank">chrome.webNavigation</a></div><div class="permissiondiv"><button id="webrequestpermission">webRequest</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequest</a></div><div class="permissiondiv"><button id="webrequestblockingpermission">webRequestBlocking</button>&nbsp;<a href="http://developer.chrome.com/extensions/webRequest.html" target="_blank">chrome.webRequestBlocking</a></div></div></div><div id="bottomsettingsside"><div id="optionsbackbutton"><center><br><br><b>Back</b><br>Go back to script editing page</center></div><div id="optionsexitbutton"><center><br><br><b>Exit</b><br>Close this popup</center></div></div></div>');

				//HIERZO LENGTES EN AL

				$("#whentorundiv").hide();

				//Tooltippies
				$("#questionmarktwo").tooltip({ content: "You don't have to use http://www.  If you still do this, it's no problem though.<br>You can type in either multiple or just one site, if you want multiple sites seperate them with a comma.<br>To make a script run on specified domain you can use the asterisk. Putting the asterisk like this:<br>*.google.com<br>Will let it run on play.google.com but not google.com, to do this type it like this<br>*google.com<br>To use the asterisk for behind a domain simply use it like this:<br>google.com*<br>Putting a slash in front of it will not let it identify with sites without a / after it<br>Don't use multiple asterisks in one site, instead you can split them into two different sites as in:<br>*google.com*<br>Turns into:<br>*google.com and google.com*" });

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });
				$("#gearicon").tooltip({ content: "Settings" })

				//Doing the question marks
				document.getElementById("whenwillitrun").onchange = function () {
					var ya = document.getElementById("whenwillitrun").value;

					if (ya == "On Click") {
						$("#questionmark").attr("title", " ");
						$("#questionmark").tooltip({ content: "Runs when you click the item in your right-click-menu, this can be used to alter the page etc." });
						$("#whentorundiv").hide();
						$("#questionmark").css("margin-left", "105%");
					}
					if (ya == "On Visiting:") {
						$("#questionmark").attr("title", " ")
						$("#questionmark").tooltip({ content: "Runs on visiting specified site(s), this will be hidden in the rightclick menu" });
						$("#whentorundiv").show();
						$("#questionmark").css("margin-left", "21.5%");
					}
					if (ya == "Always run") {
						$("#questionmark").attr("title", " ")
						$("#questionmark").tooltip({ content: "Runs on every http or https you visit, this means basically every site except for local pages in your browser (extensions, settings etc.) and on files you open that are on your computer, this will be hidden in the rightclick menu" });
						$("#whentorundiv").hide();
						$("#questionmark").css("margin-left", "105%");
					}
				}

				//Displaying correct thing when to run and stuff
				var za = splitallboxdatathing[0];
				if (za != "0" && za != "2") {
					//First display corerct thingy
					$("#whenwillitrun").html('<option id="onvisit">On Visiting:</option><option id="always">Always Run</option><option id="onnclick">On Click</option>');
					$("#whentorundiv").show();
					$("#questionmark").css("margin-left", "21.5%");

					//Then fill in the input with all the data
					za = za.split("1,");
					var zb = "";
					var zc = 1;
					if (za.length > 2) {
						//Fix this stuff

						while (za.length > zc) {
							zb = zb + za[zc];

							zc++
						}
					}
					else {
						zb = za[1];
					}

					document.getElementById("whendoesitrun").value = zb;

				}
				else {
					if (za == "0") {
						$("#questionmark").attr("title", " ");
						$("#questionmark").tooltip({ content: "Runs when you click the item in your right-click-menu, this can be used to alter the page etc." });
					}
					if (za == "2") {
						$("#whenwillitrun").html('<option id="always">Always Run</option><option id="onvisit">On Visiting:</option><option id="onnclick">On Click</option>');
					}
				}

				//Doing the green button stuff
				var ia = localStorage.scriptoptions;
				ia = ia.split(",");
				ia = ia[24];
				if (ia == "1") {
					//See if /*execute locally*/ is in the code
					var ib = document.getElementById("editinputarea").innerHTML;
					if (ib.search("execute locally") > -1) {
						//Display thingy and remove text from code
						$("#greenbutton").html('<img id="theactualcircle" style="width:20px;" src="Thumbnails/full circle.png">')
						var ic = document.getElementById("editinputarea").value;
						ic = ic.replace("/*execute locally*/\n", "");
						ic = ic.replace("//execute locally\n", "");
						$("#editinputarea").html(ic);
					}

					//Set the button's onclick
					$("#greenbutton").click(function () {
						var id = $("#greenbutton").html();
						if (id == '<img id="theactualcircle" style="width:20px;" src="Thumbnails/Empty circle.png">') {
							$("#theactualcircle").attr("src", "Thumbnails/full circle.png");
							var id = document.getElementById("editinputarea").value;

							id = id.replace("/*execute locally*/\n\n", "");
							id = id.replace("/*execute locally*/\n", "");
							id = id.replace("/*execute locally*/", "");

							$("#editinputarea").html(id);
						}
						if (id == '<img id="theactualcircle" style="width:20px;" src="Thumbnails/full circle.png">') {
							$("#theactualcircle").attr("src", "Thumbnails/Empty circle.png");
							var id = document.getElementById("editinputarea").value;
							id = "/*execute locally*/\n\n" + id;
							$("#editinputarea").html(id);
						}
					})
				}
				else {
					$("#greenbutton").css("display", "none");
				}

				//Hiding the bottom thing
				$(".settingsdiv").css("display", "none");

				//onclick of settingsicon
				$("#gearicon").click(function () {
					$(".startingdiv").fadeTo(500, 0);
					setTimeout(function () {
						$(".startingdiv").css("display", "none")

						setTimeout(function () {
							$(".settingsdiv").css("display", "").css("opacity", "0").fadeTo(500, 1.0)
						}, 500);
					}, 500);
				});

				//Onclick of backbutton
				$("#optionsbackbutton").click(function () {
					$(".settingsdiv").fadeTo(500, 0);
					setTimeout(function () {
						$(".settingsdiv").css("display", "none")

						setTimeout(function () {
							$(".startingdiv").css("display", "").css("opacity", "0").fadeTo(500, 1.0)
						}, 500);
					}, 500);
				});

				//Setting all the onclicks
				var ai = 0;
				var aj = 0;
				var ak = 0;

				//Onclick of close button
				$("#optionsexitbutton").click(function () {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				})

				//disable the ones that are already asked for
				var ia = localStorage.getItem("scriptoptions");
				ia = ia.split(",");

				if (ia[0] == "1") {
					document.getElementById("alarmspermission").setAttribute("disabled", "disabled");
				}
				if (ia[1] == "1") {
					document.getElementById("backgroundpermission").setAttribute("disabled", "disabled");
				}
				if (ia[2] == "1") {
					document.getElementById("bookmarkspermission").setAttribute("disabled", "disabled");
				}
				if (ia[3] == "1") {
					document.getElementById("clipboardreadpermission").setAttribute("disabled", "disabled");
				}
				if (ia[4] == "1") {
					document.getElementById("clipboardwritepermission").setAttribute("disabled", "disabled");
				}
				if (ia[5] == "1") {
					document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
				}
				if (ia[6] == "1") {
					document.getElementById("cookiespermission").setAttribute("disabled", "disabled");
				}
				if (ia[7] == "1") {
					document.getElementById("historypermission").setAttribute("disabled", "disabled");
				}
				if (ia[10] == "1") {
					document.getElementById("idlepermission").setAttribute("disabled", "disabled");
				}
				if (ia[11] == "1") {
					document.getElementById("managementpermission").setAttribute("disabled", "disabled");
				}
				if (ia[12] == "1") {
					document.getElementById("notificationsidv").setAttribute("disabled", "disabled");
				}
				if (ia[13] == "1") {
					document.getElementById("privacypermission").setAttribute("disabled", "disabled");
				}
				if (ia[16] == "1") {
					document.getElementById("storagepermission").setAttribute("disabled", "disabled");
				}
				if (ia[18] == "1") {
					document.getElementById("topsitespermission").setAttribute("disabled", "disabled");
				}
				if (ia[19] == "1") {
					document.getElementById("ttspermission").setAttribute("disabled", "disabled");
				}
				if (ia[21] == "1") {
					document.getElementById("webnavigationpermission").setAttribute("disabled", "disabled");
				}
				if (ia[22] == "1") {
					document.getElementById("webrequestpermission").setAttribute("disabled", "disabled");
				}
				if (ia[23] == "1") {
					document.getElementById("webrequestblockingpermission").setAttribute("disabled", "disabled");
				}
				if (ia[24] == "1") {
					document.getElementById("showdot").checked = true;
				}
				if (ia[25] == "1") {
					document.getElementById("browsingdatapermissions").setAttribute("disabled", "disabled");
				}
				if (ia[26] == "1") {
					document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
				}
				if (ia[27] == "1") {
					document.getElementById("desktopcapturepermission").setAttribute("disabled", "disabled");
				}
				if (ia[28] == "1") {
					document.getElementById("downloadspermission").setAttribute("disabled", "disabled");
				}
				if (ia[29] == "1") {
					document.getElementById("geolocationpermission").setAttribute("disabled", "disabled");
				}
				if (ia[30] == "1") {
					document.getElementById("powerpermission").setAttribute("disabled", "disabled");
				}
				if (ia[31] == "1") {
					document.getElementById("proxypermission").setAttribute("disabled", "disabled");
				}
				if (ia[32] == "1") {
					document.getElementById("pushmessagingpermission").setAttribute("disabled", "disabled");
				}


				//Ask for hte permissions/onclicks
				$("#alarmspermission").click(function () {
					chrome.permissions.request({
						permissions: ["alarms"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[0] = 1;
							document.getElementById("alarmspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#backgroundpermission").click(function () {
					chrome.permissions.request({
						permissions: ["background"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[1] = 1;
							document.getElementById("backgroundpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#bookmarkspermission").click(function () {
					chrome.permissions.request({
						permissions: ["bookmarks"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[2] = 1;
							document.getElementById("bookmarkspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#clipboardreadpermission").click(function () {
					chrome.permissions.request({
						permissions: ["clipboardRead"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[3] = 1;
							document.getElementById("clipboardreadpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#clipboardwritepermission").click(function () {
					chrome.permissions.request({
						permissions: ["clipboardWrite"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[4] = 1;
							document.getElementById("clipboardwritepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#contentsettingspermission").click(function () {
					chrome.permissions.request({
						permissions: ["contentSettings"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[5] = 1;
							document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#cookiespermission").click(function () {
					chrome.permissions.request({
						permissions: ["cookies"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[6] = 1;
							document.getElementById("cookiespermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#historypermission").click(function () {
					chrome.permissions.request({
						permissions: ["history"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[7] = 1;
							document.getElementById("historypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});


				$("#idlepermission").click(function () {
					chrome.permissions.request({
						permissions: ["idle"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[10] = 1;
							document.getElementById("idlepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#managementpermission").click(function () {
					chrome.permissions.request({
						permissions: ["management"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[11] = 1;
							document.getElementById("managementpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#notificationsidv").click(function () {
					chrome.permissions.request({
						permissions: ["notifications"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[12] = 1;
							document.getElementById("notificationsidv").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#privacypermission").click(function () {
					chrome.permissions.request({
						permissions: ["privacy"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[13] = 1;
							document.getElementById("privacypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#storagepermission").click(function () {
					chrome.permissions.request({
						permissions: ["storage"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[16] = 1;
							document.getElementById("storagepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#topsitespermission").click(function () {
					chrome.permissions.request({
						permissions: ["topSites"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[18] = 1;
							document.getElementById("topsitespermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#ttspermission").click(function () {
					chrome.permissions.request({
						permissions: ["tts"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[19] = 1;
							document.getElementById("ttspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webnavigationpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webNavigation"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[21] = 1;
							document.getElementById("webnavigationpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webrequestpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequest"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[22] = 1;
							document.getElementById("webrequestpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#webrequestblockingpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequestBlocking"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[23] = 1;
							document.getElementById("webrequestblockingpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#showdot").click(function () {
					var hd = document.getElementById("showdot").checked;
					if (hd === true) {
						var ha = localStorage.getItem("scriptoptions");
						ha = ha.split(",");
						ha[24] = 1;
						var hb = 0;
						var hc = "";
						while (hb < ha.length) {
							if (hb == 32) {
								hc = hc + ha[hb];
							}
							else {
								hc = hc + ha[hb] + ",";
							}

							hb++;
						}
						localStorage.scriptoptions = hc;
					}
					else {
						var ha = localStorage.getItem("scriptoptions");
						ha = ha.split(",");
						ha[24] = 0;
						var hb = 0;
						var hc = "";
						while (hb < ha.length) {
							if (hb == 32) {
								hc = hc + ha[hb];
							}
							else {
								hc = hc + ha[hb] + ",";
							}

							hb++;
						}
						localStorage.scriptoptions = hc;
					}
				})

				$("#browsingdatapermissions").click(function () {
					chrome.permissions.request({
						permissions: ["browsingData"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[25] = 1;
							document.getElementById("browsingdatapermissions").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#contentsettingspermission").click(function () {
					chrome.permissions.request({
						permissions: ["contentSettings"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[26] = 1;
							document.getElementById("contentsettingspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#desktopcapturepermission").click(function () {
					chrome.permissions.request({
						permissions: ["desktopCapture"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[27] = 1;
							document.getElementById("desktopcapturepermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#downloadspermission").click(function () {
					chrome.permissions.request({
						permissions: ["downloads"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[28] = 1;
							document.getElementById("downloadspermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#geolocationpermission").click(function () {
					chrome.permissions.request({
						permissions: ["geolocation"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[29] = 1;
							document.getElementById("geolocationpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#powerpermission").click(function () {
					chrome.permissions.request({
						permissions: ["power"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[30] = 1;
							document.getElementById("powerpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#proxypermission").click(function () {
					chrome.permissions.request({
						permissions: ["proxy"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("scriptoptions");
							ha = ha.split(",");
							ha[31] = 1;
							document.getElementById("proxypermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});

				$("#pushmessagingpermission").click(function () {
					chrome.permissions.request({
						permissions: ["webRequestBlocking"]
					}, function (granted) {
						if (granted) {
							var ha = localStorage.getItem("pushMessaging");
							ha = ha.split(",");
							ha[32] = 1;
							document.getElementById("pushmessagingpermission").setAttribute("disabled", "disabled");
							var hb = 0;
							var hc = "";
							while (hb < ha.length) {
								if (hb == 32) {
									hc = hc + ha[hb];
								}
								else {
									hc = hc + ha[hb] + ",";
								}

								hb++;
							}
							localStorage.scriptoptions = hc;
						} else {
							alert("You can re-enable it any time later");
						}
					})
				});


				//END OF THAT STUFF


				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {
						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);

				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("editinputarea").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}

				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("editinputarea").value;
					var type = "Script";



					if ($("#theactualcircle").attr("src") == "Thumbnails/full circle.png") {
						newdata = "/*execute locally*/\n" + newdata;
					}

					//Saving the way to run with it
					if (document.getElementById("whenwillitrun").value == "On Click") {
						newdata = "0%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "On Visiting:") {
						newdata = "1," + document.getElementById("whendoesitrun").value + ",%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "Always Run") {
						newdata = "2%124" + newdata
					}

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("editinputarea").value;
					var type = "Script";

					if ($("#theactualcircle").attr("src") == "Thumbnails/full circle.png") {
						newdata = "/*execute locally*/\n" + newdata;
					}

					//Saving the way to run with it
					if (document.getElementById("whenwillitrun").value == "On Click") {
						newdata = "0%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "On Visiting:") {
						newdata = "1," + document.getElementById("whendoesitrun").value + "%124" + newdata
					}
					if (document.getElementById("whenwillitrun").value == "Always Run") {
						newdata = "2%124" + newdata
					}

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });


					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}
			}
			if (allboxdata[1] == "Link") {
				if (screen.width == "1440") {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}
				if (screen.width == "1920") {

					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>link</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:-1%;"><div id="spacesdiv" style="font-size:200%;">URL:&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Change name: <input id="changename" style="font-size:100%;" size="10" value="' + allboxdata[0] + '"></div><br><input id="urlinputbox" value="' + allboxdata[2] + '" size="45" style="font-size:300%;"><br><br>Examples:<br><div id="leftsites"><div class="website" id="link1"><div class="image"><img id="img1" src="Thumbnails/youtube.jpg" width="35px" height="35px"></div><div id="text1" class="datext">http://www.youtube.com</div></div><div class="website" id="link2"><div class="image"><img id="img2" src="Thumbnails/google.jpg" width="35px" height="35px"></div><div id="text2" class="datext">http://www.google.com</div></div><div class="website" id="link3"><div class="image"><img id="img3" src="Thumbnails/facebook.png" width="35px" height="35px"></div><div id="text3" class="datext">https://www.facebook.com</div></div><div class="website" id="link4"><div class="image"><img id="img4" src="Thumbnails/twitter.png" height="35px" width="35px"></div><div class="datext" id="text4">https://www.twitter.com</div></div><div class="website" id="link5"><div class="image"><img id="img5" src="Thumbnails/wikipedia.png" height="35px" width="35px"></div><div class="datext" id="text5">https://www.wikipedia.org</div></div><div class="website" id="link6"><div class="image"><img id="img6" src="Thumbnails/ebay.jpg" height="35px" width="35px"></div><div id="text6" class="datext">http://www.ebay.com</div></div><div class="website" id="link7"><div class="image"><img id="img7" src="Thumbnails/outlook.png" height="35px" width="35px"></div><div id="text7" class="datext">http://www.hotmail.com</div></div></div><div id="rightsites"><div class="website" id="link8"><div class="image"><img id="img8" src="Thumbnails/gmail.png" height="35px" width="35px"></div><div id="text8" class="datext">https://wwww.mail.google.com</div></div><div class="website" id="link9"><div class="image"><img  id="img9" src="Thumbnails/webstore.png" height="35px" width="35px"></div><div id="text9" class="datext" style="font-size:150%;line-height:35px;">http://www.chrome.google.com/webstore</div></div><div class="website" id="link10"><div class="image"><img id="img10" src="Thumbnails/history.png" height="35px" width="35px"></div><div id="text10" class="datext">chrome://history</div></div><div class="website" id="link11"><div class="image"><img id="img11" src="Thumbnails/bing.ico" height="35px" width="35px"></div><div id="text11" class="datext">http://www.bing.com</div></div><div class="website" id="link12"><div class="image"><img id="img12" src="Thumbnails/imdb.png" height="35px" width="35px"></div><div id="text12" class="datext">http://ww.imdb.com</div></div><div class="website" id="link13"><div class="image"><img id="img13" src="Thumbnails/amazon.jpg" height="35px" width="35px"></div><div class="datext" id="text13">http://www.amazon.com</div></div><div class="website" id="link14"><div class="image"><img id="img14" src="icon-large.png" height="35px" width="35px"></div><div class="datext" id="text14">options.html</div></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div style="margin-top:3.5%;" class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>')
				}

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				if (screen.width == "1440") {
					$(".website").css("width", "94%");
					$(".datext").css("font-size", "180%");
					$("#text9").css("font-size", "140%");
					$("#urlinputbox").attr("size", "44");
				}

				$('.website').click(function (event) {
					var bc = event.target.id;

					var bd = bc.search("img");
					var be = bc.search("text");
					var bg = bc.search("link");

					if (bd > -1) {
						var bf = bc.split("img");
						bf = bf[1];
					}
					if (be > -1) {
						var bf = bc.split("text");
						bf = bf[1];
					}
					if (bg > -1) {
						var bf = bc.split("link");
						bf = bf[1];
					}

					if (!bf) {
						return false;
					}

					if (bf != 1) {
						document.getElementById("link1").style.border = "2px solid black";
					}
					if (bf != 2) {
						document.getElementById("link2").style.border = "2px solid black";
					}
					if (bf != 3) {
						document.getElementById("link3").style.border = "2px solid black";
					}
					if (bf != 4) {
						document.getElementById("link4").style.border = "2px solid black";
					}
					if (bf != 5) {
						document.getElementById("link5").style.border = "2px solid black";
					}
					if (bf != 6) {
						document.getElementById("link6").style.border = "2px solid black";
					}
					if (bf != 7) {
						document.getElementById("link7").style.border = "2px solid black";
					}
					if (bf != 8) {
						document.getElementById("link8").style.border = "2px solid black";
					}
					if (bf != 9) {
						document.getElementById("link9").style.border = "2px solid black";
					}
					if (bf != 10) {
						document.getElementById("link10").style.border = "2px solid black";
					}
					if (bf != 11) {
						document.getElementById("link11").style.border = "2px solid black";
					}
					if (bf != 12) {
						document.getElementById("link12").style.border = "2px solid black";
					}
					if (bf != 13) {
						document.getElementById("link13").style.border = "2px solid black";
					}
					if (bf != 14) {
						document.getElementById("link14").style.border = "2px solid black";
					}

					document.getElementById("link" + bf).style.border = "2px solid red";

					document.getElementById("urlinputbox").value = document.getElementById("text" + bf).innerHTML;

					document.getElementById("urlinputbox").onchange = function () {
						document.getElementById("link" + bf).style.border = "2px solid black";
					}

				});

				//All onclicks
				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("urlinputbox").value;
					var type = "Link";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("urlinputbox").value;
					var type = "Link";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;

					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = "0%124";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {

								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("urlinputbox").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}

				}
			}

			if (allboxdata[1] == "Divider") {
				document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>divider</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside" style="margin-top:2%;font-size:500%;">Change name: <input style="font-size:100%;" size="9" id="changename" value="' + allboxdata[0] + '"></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="otherchoice" id="Menubutton"><br><center><b>Turn into menu</b><br>Groups specified number of items together, good for sorting and makes the menu look less full</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				//All onclicks
				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = allboxdata[2];

					var type = "Divider";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = allboxdata[2];
					var type = "Divider";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Menubutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("Menubutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Menubutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = allboxdata[2];

							data3 = "0%124" + data3;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Menu"
							var data3 = "1";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}

			}

			if (allboxdata[1] == "Menu") {

				if (screen.width > 1919) {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>menu</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside">Number of child items <input id="numberofchildren" value="' + allboxdata[2] + '">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><br><br><div id="wherethechildrengo"><div id="gotop"></div><div id="goleft"></div><div id="wheretheboxesgotwo"></div><div id="goright"></div><div id="godown"></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');
				}
				if (screen.width < 1920 && screen.width > 1679) {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>menu</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside">Number of child items <input id="numberofchildren" value="' + allboxdata[2] + '">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><br><br><div id="wherethechildrengo"><div id="gotop"></div><div id="goleft"></div><div id="wheretheboxesgotwo"></div><div id="goright"></div><div id="godown"></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');
				}
				if (screen.width < 1680 && screen.width > 1279) {
					document.getElementById("editingbox").innerHTML = ('<center><div id="nametext">Now editing <b>menu</b> for <b>' + allboxdata[0] + '</b>, child of <b>' + childornot + '</b>.</div></center><br><br><br><div id="leftside">Number of child items <input id="numberofchildren" value="' + allboxdata[2] + '">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  Change name: <input id="changename" value="' + allboxdata[0] + '"><br><br><div id="wherethechildrengo"><div id="gotop"></div><div id="goleft"></div><div id="wheretheboxesgotwo"></div><div id="goright"></div><div id="godown"></div></div></div><div id="rightside"><div id="tooltips" title="swag"><div id="plussign" style="margin-left:1%;position:absolute;" title="Add a new box after this one and edit it"> + </div><div id="removesign" style="margin-left:3%;position:absolute;" title="Remove this box from the rightclick menu completely"> x </div></div><br><br><div class="otherchoice" style="margin-top:3.5%;" id="Linkbutton"><br><center><b>Turn into link to website</b><br>Opens specified webpage on clicking the item</center></div><div class="otherchoice" id="Dividerbutton"><br><center><b>Turn into divider</b><br>Seperates items from each other, looks better and makes it easier to navigate</center></div><div class="otherchoice" id="Scriptbutton"><br><center><b>Turn into script</b><br>Runs a script upon running clicking item</center></div><div class="lastotherchoice" id="applybutton"><br><center><b>Apply</b><br>Applies the change in type,saves and opens different editing page.</center></div></div><br><div class="saveexit" id="savingbutton"><br><br><center><b>Save</b><br>Save without exiting</center></div><div class="saveexit" id="saveandexitbutton"><br><br><center><b>Save & Exit</b><br>Save and exit this screen</center></div><div class="saveexit" id="exitingbutton"><br><br><center><b>Exit</b><br>Exit this page without saving</center></div></div>');
				}


				var bg = 1;

				$("#plussign").tooltip({ content: "Add a new item after this one and edit it" });
				$("#removesign").tooltip({ content: "Remove this item from the rightclick menu completely" });

				document.getElementById("savingbutton").onclick = function saveitall() {
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("numberofchildren").value;

					var type = "Menu";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					setTimeout(function () {
						document.getElementById("savingbutton").style.webkitAnimation = "borderchange 1s";

						setTimeout(function () {
							document.getElementById("savingbutton").style.border = "2px solid rgb(240, 240, 240)";
							chrome.runtime.sendMessage({ reload: "true" });
						}, 1000);
					}, 2000);
				}

				document.getElementById("exitingbutton").onclick = function justexit() {
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";

						if (onclosereset == "yes") {
							onclosereset = "no";
							window.location.reload();
						}

					}, 250);
				}

				document.getElementById("saveandexitbutton").onclick = function saveandexit() {
					//Saving
					var newname = document.getElementById("changename").value;
					var newdata = document.getElementById("numberofchildren").value;
					var type = "Menu";

					localStorage.setItem(ad, newname + "%123" + type + "%123" + newdata);

					document.getElementById("savingbutton").style.border = "2px solid black";

					//Exiting
					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					chrome.runtime.sendMessage({ reload: "true" });

					setTimeout(function () {
						paintsettings();
						document.getElementById("darkbackground").style.display = "none";

						paintsettings();

					}, 250);
				}

				document.getElementById("plussign").onclick = function () {
					var al = localStorage.numberofrows;
					var at = al;
					al = parseInt(al, 10) + parseInt(1, 10);

					if (ad == at) {
						localStorage.setItem(al, "Name%123Link%123");

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							paintsettings();
							openeditingbox("nothing", al);
							onclosereset = "yes";
						}, 500);
					}
					else {

						var an = parseInt(ad, 10) + parseInt(1, 10);

						var am = localStorage.getItem(an);

						var ao = am;

						ao = "Name%123Link%123";

						var aq = ad;

						aq++;

						while (al > aq) {
							localStorage.setItem(aq, ao);

							ao = am;

							if (aq == at) {
								var as = parseInt(aq, 10) + parseInt(1, 10);
								localStorage.setItem(as, ao);
							}

							aq++;

							am = localStorage.getItem(aq);
						}

						localStorage.setItem("numberofrows", al);

						document.getElementById("details").style.webkitTransform = "scale(0)";
						document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
						document.getElementById("details").style.webkitTransitionDuration = "500ms";

						var au = parseInt(ad, 10) + parseInt(1, 10);

						setTimeout(function () {
							openeditingbox("nothing", au);
						}, 500);
					}
				};

				document.getElementById("removesign").onclick = function () {
					var al = localStorage.numberofrows;

					var bb = parseInt(al, 10) + parseInt(1, 10);

					//ad is current row
					var aw = ad;
					aw++;

					var ax = localStorage.getItem(aw);
					var az = aw;

					while (bb > az) {
						var ba = parseInt(az, 10) - parseInt(1, 10);
						localStorage.setItem(ba, ax)

						az++;

						ax = localStorage.getItem(az);
					}

					localStorage.removeItem(al);

					var bc = parseInt(al, 10) - parseInt(1, 10);

					localStorage.setItem("numberofrows", bc);

					document.getElementById("details").style.webkitTransform = "scale(0)";
					document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
					document.getElementById("details").style.webkitTransitionDuration = "250ms";
					document.getElementById("darkbackground").style.webkitAnimation = "changeback 0.25s";

					setTimeout(function () {
						document.getElementById("darkbackground").style.display = "none";
						window.location.reload();
					}, 250);
				}

				document.getElementById("Scriptbutton").onclick = function () {
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Scriptbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 0;
					ak = 1;
				}

				document.getElementById("Linkbutton").onclick = function () {
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Dividerbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Linkbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 1;
					aj = 0;
					ak = 0;
				}

				document.getElementById("Dividerbutton").onclick = function () {
					document.getElementById("Linkbutton").style.border = "2px solid rgb(240, 240, 240)";
					document.getElementById("Scriptbutton").style.border = "2px solid rgb(240, 240, 240)";

					document.getElementById("Dividerbutton").style.border = "2px solid red";
					document.getElementById("applybutton").style.border = "2px solid blue";
					ai = 0;
					aj = 1;
					ak = 0;
				}

				document.getElementById("applybutton").onclick = function () {
					if (ai === 0 && aj === 0 && ak === 0) {
						alert("please select a different type to apply");
					}
					else {
						if (ai === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Link"
							var data3 = "http://www.example.com";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (aj === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Divider"
							var data3 = document.getElementById("numberofchildren").value;

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}

						if (ak === 1) {
							var data1 = document.getElementById("changename").value;
							var data2 = "Script"
							var data3 = document.getElementById("numberofchildren").value;

							data3 = "0%124";

							document.getElementById("details").style.webkitTransform = "scale(0)";
							document.getElementById("details").style.webkitTransitionTimingFunction = "ease-out";
							document.getElementById("details").style.webkitTransitionDuration = "500ms";

							localStorage.setItem(ad, data1 + "%123" + data2 + "%123" + data3);

							setTimeout(function () {
								paintsettings();
								openeditingbox("nothing", ad);

							}, 650);

						}
					}
				}


			}
		}
	});


	//Hover stuff
	$(".Linkoutside").hover(function () {
		$(this).css("background", "url('Thumbnails/hoverbluebackground.png')");
	}, function () {
		$(this).css("background", "url('Thumbnails/bluebackground.png')");
	});

	$(".Scriptoutside").hover(function () {
		$(this).css("background", "url('Thumbnails/hoverredbackground.png')");
	}, function () {
		$(this).css("background", "url('Thumbnails/redbackground.png')");
	});

	$(".Menuoutside").hover(function () {
		$(this).css("background", "url('Thumbnails/hovergreenbackground.png')");
	}, function () {
		$(this).css("background", "url('Thumbnails/greenbackground.png')");
	});

	$(".Divideroutside").hover(function () {
		$(this).css("background", "url('Thumbnails/hoveryellowbackground.png')");
	}, function () {
		$(this).css("background", "url('Thumbnails/yellowbackground.png')");
	});

	//Making invisible items see-through
	var aea = "1";
	var aeb = localStorage.numberofrows;
	var aec = "";

	aeb++;

	while (aea < aeb) {
		aec = localStorage.getItem(aea);
		aec = aec.split("%123");
		if (aec[1] == "Script") {
			aec = aec[2];
			aec = aec.split("%124");
			aec = aec[0];
			if (aec != "0") {
				$("#rowie" + aea).css("opacity", "0.5");
			}
		}

		aea++;
	}



	var didit = "no";

	//Make the add and remove buttons work in the overview
	$(".Scriptoutside").mouseenter(function (event) {

		var oa = event.target.id;
		if (oa == "") {
			return false;
		}

		//Extract number from all of the different things

		if (oa.search("rowie") > -1) {
			var ob = oa.split("rowie");
			var oc = ob[1];
		}
		if (oa.search("thingy") > -1) {
			var ob = oa.split("thingy");
			var oc = ob[1];
		}
		if (oa.search("block") > -1) {
			var ob = oa.split("block");
			var oc = ob[1];
		}
		if (oa.search("otherthing") > -1) {
			var ob = oa.split("otherthing");
			var oc = ob[1];
		}

		if (!oc) {
			return false;
		}

		$("#add" + oc).stop(true, true).show();
		$("#remove" + oc).stop(true, true);

		$("#add" + oc).show();
		$("#remove" + oc).show();

		$("#add" + oc).animate({ opacity: "1.0" });
		$("#remove" + oc).animate({ opacity: "1.0" });

		$("#add" + oc).mouseenter(function () {
			$(this).css("color", "black");
		}).mouseleave(function () {
			$(this).css("color", "rgb(97, 97, 97)");
		})

		$("#remove" + oc).mouseenter(function () {
			$(this).css("color", "black");
		}).mouseleave(function () {
			$(this).css("color", "rgb(97, 97, 97)");
		})

		document.getElementById("add" + oc).onclick = function () {
			if (exportmode == "1") {
				return false;
			}

			if (didit = "no") {
				didit = "yes";
			}
			else {
				return false;
			}

			var oe = localStorage.numberofrows;
			var of = parseInt(oe, 10) + parseInt(1, 10);

			var og = parseInt(oc, 10) + parseInt(1, 10);

			var ol = parseInt(of, 10) - parseInt(1, 10);

			var oh = localStorage.getItem(oc);

			var oi = oh;

			oi = "Name%123Link%123";

			var oj = oc;

			while (of > oj) {
				localStorage.setItem(oj, oi);

				oi = oh;

				if (oj == ol) {
					var ok = parseInt(oj, 10) + parseInt(1, 10);
					localStorage.setItem(ok, oi);
				}

				oj++;

				oh = localStorage.getItem(oj);
			}

			localStorage.setItem("numberofrows", of);

			chrome.runtime.sendMessage({ reload: "true" });
			window.location.reload();
		};

		document.getElementById("remove" + oc).onclick = function () {
			if (exportmode == "1") {
				return false;
			}

			if (didit = "no") {
				didit = "yes";
			}
			else {
				return false;
			}

			var om = localStorage.numberofrows;

			var on = parseInt(om, 10) + parseInt(1, 10);

			//ad is current row
			var oo = oc;
			oo++;

			var op = localStorage.getItem(oo);
			var oq = oo;

			while (on > oq) {
				var or = parseInt(oq, 10) - parseInt(1, 10);
				localStorage.setItem(or, op)

				oq++;

				op = localStorage.getItem(oq);
			}

			localStorage.removeItem(om);

			var bc = parseInt(om, 10) - parseInt(1, 10);

			localStorage.setItem("numberofrows", bc);

			chrome.runtime.sendMessage({ reload: "true" });
			window.location.reload();
		};



	}).mouseleave(function (event) {
		var oa = event.target.id;
		if (oa == "") {
			return false;
		}

		//Extract number from all of the different things

		if (oa.search("rowie") > -1) {
			var ob = oa.split("rowie");
			var oc = ob[1];
		}
		if (oa.search("thingy") > -1) {
			var ob = oa.split("thingy");
			var oc = ob[1];
		}
		if (oa.search("block") > -1) {
			var ob = oa.split("block");
			var oc = ob[1];
		}
		if (oa.search("otherthing") > -1) {
			var ob = oa.split("otherthing");
			var oc = ob[1];
		}

		if (!oc) {
			return false;
		}

		$("#add" + oc).stop(true, true).css("opacity", "0.0");
		$("#remove" + oc).stop(true, true).css("opacity", "0.0");

		$("#add" + oc).hide();
		$("#remove" + oc).hide();

	});
	$(".Linkoutside").mouseenter(function (event) {
		var oa = event.target.id;
		if (oa == "") {
			return false;
		}

		//Extract number from all of the different things

		if (oa.search("rowie") > -1) {
			var ob = oa.split("rowie");
			var oc = ob[1];
		}
		if (oa.search("thingy") > -1) {
			var ob = oa.split("thingy");
			var oc = ob[1];
		}
		if (oa.search("block") > -1) {
			var ob = oa.split("block");
			var oc = ob[1];
		}
		if (oa.search("otherthing") > -1) {
			var ob = oa.split("otherthing");
			var oc = ob[1];
		}

		if (!oc) {
			return false;
		}

		$("#add" + oc).stop(true, true).show();
		$("#remove" + oc).stop(true, true);

		$("#add" + oc).show();
		$("#remove" + oc).show();

		$("#add" + oc).animate({ opacity: "1.0" });
		$("#remove" + oc).animate({ opacity: "1.0" });

		$("#add" + oc).mouseenter(function () {
			$(this).css("color", "black");
		}).mouseleave(function () {
			$(this).css("color", "rgb(97, 97, 97)");
		})

		$("#remove" + oc).mouseenter(function () {
			$(this).css("color", "black");
		}).mouseleave(function () {
			$(this).css("color", "rgb(97, 97, 97)");
		})

		document.getElementById("add" + oc).onclick = function () {
			if (exportmode == "1") {
				return false;
			}

			if (didit = "no") {
				didit = "yes";
			}
			else {
				return false;
			}

			var oe = localStorage.numberofrows;
			var of = parseInt(oe, 10) + parseInt(1, 10);

			var og = parseInt(oc, 10) + parseInt(1, 10);

			var ol = parseInt(of, 10) - parseInt(1, 10);

			var oh = localStorage.getItem(oc);

			var oi = oh;

			oi = "Name%123Link%123";

			var oj = oc;

			while (of > oj) {
				localStorage.setItem(oj, oi);

				oi = oh;

				if (oj == ol) {
					var ok = parseInt(oj, 10) + parseInt(1, 10);
					localStorage.setItem(ok, oi);
				}

				oj++;

				oh = localStorage.getItem(oj);
			}

			localStorage.setItem("numberofrows", of);

			chrome.runtime.sendMessage({ reload: "true" });
			window.location.reload();
		};

		document.getElementById("remove" + oc).onclick = function () {
			if (exportmode == "1") {
				return false;
			}

			if (didit = "no") {
				didit = "yes";
			}
			else {
				return false;
			}

			var om = localStorage.numberofrows;

			var on = parseInt(om, 10) + parseInt(1, 10);

			//ad is current row
			var oo = oc;
			oo++;

			var op = localStorage.getItem(oo);
			var oq = oo;

			while (on > oq) {
				var or = parseInt(oq, 10) - parseInt(1, 10);
				localStorage.setItem(or, op)

				oq++;

				op = localStorage.getItem(oq);
			}

			localStorage.removeItem(om);

			var bc = parseInt(om, 10) - parseInt(1, 10);

			localStorage.setItem("numberofrows", bc);

			chrome.runtime.sendMessage({ reload: "true" });
			window.location.reload();
		};



	}).mouseleave(function (event) {
		var oa = event.target.id;
		if (oa == "") {
			return false;
		}

		//Extract number from all of the different things

		if (oa.search("rowie") > -1) {
			var ob = oa.split("rowie");
			var oc = ob[1];
		}
		if (oa.search("thingy") > -1) {
			var ob = oa.split("thingy");
			var oc = ob[1];
		}
		if (oa.search("block") > -1) {
			var ob = oa.split("block");
			var oc = ob[1];
		}
		if (oa.search("otherthing") > -1) {
			var ob = oa.split("otherthing");
			var oc = ob[1];
		}

		if (!oc) {
			return false;
		}

		$("#add" + oc).stop(true, true).css("opacity", "0.0");
		$("#remove" + oc).stop(true, true).css("opacity", "0.0");

		$("#add" + oc).hide();
		$("#remove" + oc).hide();

	});
	$(".Menuoutside").mouseenter(function (event) {

		var oa = event.target.id;
		if (oa == "") {
			return false;
		}

		//Extract number from all of the different things

		if (oa.search("rowie") > -1) {
			var ob = oa.split("rowie");
			var oc = ob[1];
		}
		if (oa.search("thingy") > -1) {
			var ob = oa.split("thingy");
			var oc = ob[1];
		}
		if (oa.search("block") > -1) {
			var ob = oa.split("block");
			var oc = ob[1];
		}
		if (oa.search("otherthing") > -1) {
			var ob = oa.split("otherthing");
			var oc = ob[1];
		}

		if (!oc) {
			return false;
		}

		$("#add" + oc).stop(true, true).show();
		$("#remove" + oc).stop(true, true);

		$("#add" + oc).show();
		$("#remove" + oc).show();

		$("#add" + oc).animate({ opacity: "1.0" });
		$("#remove" + oc).animate({ opacity: "1.0" });

		$("#add" + oc).mouseenter(function () {
			$(this).css("color", "black");
		}).mouseleave(function () {
			$(this).css("color", "rgb(97, 97, 97)");
		})

		$("#remove" + oc).mouseenter(function () {
			$(this).css("color", "black");
		}).mouseleave(function () {
			$(this).css("color", "rgb(97, 97, 97)");
		})

		document.getElementById("add" + oc).onclick = function () {
			if (exportmode == "1") {
				return false;
			}

			if (didit = "no") {
				didit = "yes";
			}
			else {
				return false;
			}

			var oe = localStorage.numberofrows;
			var of = parseInt(oe, 10) + parseInt(1, 10);

			var og = parseInt(oc, 10) + parseInt(1, 10);

			var ol = parseInt(of, 10) - parseInt(1, 10);

			var oh = localStorage.getItem(oc);

			var oi = oh;

			oi = "Name%123Link%123";

			var oj = oc;

			while (of > oj) {
				localStorage.setItem(oj, oi);

				oi = oh;

				if (oj == ol) {
					var ok = parseInt(oj, 10) + parseInt(1, 10);
					localStorage.setItem(ok, oi);
				}

				oj++;

				oh = localStorage.getItem(oj);
			}

			localStorage.setItem("numberofrows", of);


			chrome.runtime.sendMessage({ reload: "true" });
			window.location.reload();
		};

		document.getElementById("remove" + oc).onclick = function () {
			if (exportmode == "1") {
				return false;
			}

			if (didit = "no") {
				didit = "yes";
			}
			else {
				return false;
			}

			var om = localStorage.numberofrows;

			var on = parseInt(om, 10) + parseInt(1, 10);

			//ad is current row
			var oo = oc;
			oo++;

			var op = localStorage.getItem(oo);
			var oq = oo;

			while (on > oq) {
				var or = parseInt(oq, 10) - parseInt(1, 10);
				localStorage.setItem(or, op)

				oq++;

				op = localStorage.getItem(oq);
			}

			localStorage.removeItem(om);

			var bc = parseInt(om, 10) - parseInt(1, 10);

			localStorage.setItem("numberofrows", bc);

			chrome.runtime.sendMessage({ reload: "true" });
			window.location.reload();
		};



	}).mouseleave(function (event) {
		var oa = event.target.id;
		if (oa == "") {
			return false;
		}

		//Extract number from all of the different things

		if (oa.search("rowie") > -1) {
			var ob = oa.split("rowie");
			var oc = ob[1];
		}
		if (oa.search("thingy") > -1) {
			var ob = oa.split("thingy");
			var oc = ob[1];
		}
		if (oa.search("block") > -1) {
			var ob = oa.split("block");
			var oc = ob[1];
		}
		if (oa.search("otherthing") > -1) {
			var ob = oa.split("otherthing");
			var oc = ob[1];
		}

		if (!oc) {
			return false;
		}

		$("#add" + oc).stop(true, true).css("opacity", "0.0");
		$("#remove" + oc).stop(true, true).css("opacity", "0.0");

		$("#add" + oc).hide();
		$("#remove" + oc).hide();

	});
	$(".Divideroutside").mouseenter(function (event) {

		var oa = event.target.id;
		if (oa == "") {
			return false;
		}

		//Extract number from all of the different things

		if (oa.search("rowie") > -1) {
			var ob = oa.split("rowie");
			var oc = ob[1];
		}
		if (oa.search("thingy") > -1) {
			var ob = oa.split("thingy");
			var oc = ob[1];
		}
		if (oa.search("block") > -1) {
			var ob = oa.split("block");
			var oc = ob[1];
		}
		if (oa.search("otherthing") > -1) {
			var ob = oa.split("otherthing");
			var oc = ob[1];
		}

		if (!oc) {
			return false;
		}

		$("#add" + oc).stop(true, true).show();
		$("#remove" + oc).stop(true, true);

		$("#add" + oc).show();
		$("#remove" + oc).show();

		$("#add" + oc).animate({ opacity: "1.0" });
		$("#remove" + oc).animate({ opacity: "1.0" });

		$("#add" + oc).mouseenter(function () {
			$(this).css("color", "black");
		}).mouseleave(function () {
			$(this).css("color", "rgb(97, 97, 97)");
		})

		$("#remove" + oc).mouseenter(function () {
			$(this).css("color", "black");
		}).mouseleave(function () {
			$(this).css("color", "rgb(97, 97, 97)");
		})

		document.getElementById("add" + oc).onclick = function () {
			if (exportmode == "1") {
				return false;
			}

			if (didit = "no") {
				didit = "yes";
			}
			else {
				return false;
			}

			var oe = localStorage.numberofrows;
			var of = parseInt(oe, 10) + parseInt(1, 10);

			var og = parseInt(oc, 10) + parseInt(1, 10);

			var ol = parseInt(of, 10) - parseInt(1, 10);

			var oh = localStorage.getItem(oc);

			var oi = oh;

			oi = "Name%123Link%123";

			var oj = oc;

			while (of > oj) {
				localStorage.setItem(oj, oi);

				oi = oh;

				if (oj == ol) {
					var ok = parseInt(oj, 10) + parseInt(1, 10);
					localStorage.setItem(ok, oi);
				}

				oj++;

				oh = localStorage.getItem(oj);
			}

			localStorage.setItem("numberofrows", of);


			chrome.runtime.sendMessage({ reload: "true" });
			window.location.reload();
		};

		document.getElementById("remove" + oc).onclick = function () {
			if (exportmode == "1") {
				return false;
			}

			if (didit = "no") {
				didit = "yes";
			}
			else {
				return false;
			}

			var om = localStorage.numberofrows;

			var on = parseInt(om, 10) + parseInt(1, 10);

			//ad is current row
			var oo = oc;
			oo++;

			var op = localStorage.getItem(oo);
			var oq = oo;

			while (on > oq) {
				var or = parseInt(oq, 10) - parseInt(1, 10);
				localStorage.setItem(or, op)

				oq++;

				op = localStorage.getItem(oq);
			}

			localStorage.removeItem(om);

			var bc = parseInt(om, 10) - parseInt(1, 10);

			localStorage.setItem("numberofrows", bc);

			chrome.runtime.sendMessage({ reload: "true" });
			window.location.reload();
		};



	}).mouseleave(function (event) {
		var oa = event.target.id;
		if (oa == "") {
			return false;
		}

		//Extract number from all of the different things

		if (oa.search("rowie") > -1) {
			var ob = oa.split("rowie");
			var oc = ob[1];
		}
		if (oa.search("thingy") > -1) {
			var ob = oa.split("thingy");
			var oc = ob[1];
		}
		if (oa.search("block") > -1) {
			var ob = oa.split("block");
			var oc = ob[1];
		}
		if (oa.search("otherthing") > -1) {
			var ob = oa.split("otherthing");
			var oc = ob[1];
		}

		if (!oc) {
			return false;
		}

		$("#add" + oc).stop(true, true).css("opacity", "0.0");
		$("#remove" + oc).stop(true, true).css("opacity", "0.0");

		$("#add" + oc).hide();
		$("#remove" + oc).hide();

	});

	//Last adding thing


	$("#plusblock").click(function () {

		var ada = localStorage.numberofrows;
		ada = parseInt(ada, 10) + parseInt(1, 10);

	})

}
//End of paint function

paintsettings();

$("#actualexport").hide();

//Showing the export stuff

var xa = "0";

$("#selectexport").click(function () {
	if (xa == "0") {
		$("#selectexport").html('Cancel');
		$("#actualexport").show();
		$("#exporteverything").hide();
		$(".checkboxes").css("display", "inline");

		exportmode = "1";


		alert("Check the items you wish to export, then hit the export button next to this button.\n tip: You can click the items to select their corresponding checkboxes")
		window.location.hash = "items";
		xa = "1";
	}
	else {
		//Cancel it
		$("#selectexport").html('Select what to export');
		$("#actualexport").hide();
		$("#exporteverything").show();
		$(".checkboxes").css("display", "none");
		$(".checkboxes").removeAttr("checked");
		exportmode = "0";

		xa = "0";
	}
})

$("#exporteverything").click(function () {
	document.getElementById("outputarea").innerHTML = "all%146%";

	document.getElementById("outputarea").innerHTML += localStorage.firsttime;
	document.getElementById("outputarea").innerHTML += "%146%";
	document.getElementById("outputarea").innerHTML += localStorage.optionson;
	document.getElementById("outputarea").innerHTML += "%146%";
	document.getElementById("outputarea").innerHTML += localStorage.waitforsearch;
	document.getElementById("outputarea").innerHTML += "%146%";
	document.getElementById("outputarea").innerHTML += localStorage.whatpage;
	document.getElementById("outputarea").innerHTML += "%146%";
	document.getElementById("outputarea").innerHTML += localStorage.numberofrows;

	var outputallvar = 1;

	while (outputallvar < rowsplusone) {
		document.getElementById("outputarea").innerHTML += "%146%";
		document.getElementById("outputarea").innerHTML += localStorage.getItem(outputallvar);

		outputallvar++;
	}
	exportall = "false";
})

$("#actualexport").click(function () {
	var arrayvar = 1;
	var numbersarray = [];

	while (arrayvar < rowsplusone) {
		var checkedvar = document.getElementById("itemcheckbox" + arrayvar).checked;

		if (checkedvar === true) {
			var arraylength = numbersarray.length;

			numbersarray[arraylength] = arrayvar;
		}

		arrayvar++;
	}

	var actualarray = [];
	var arrayvariablewoob = parseInt(numbersarray[0], 10) - parseInt(1, 10);

	arrayvar = 0;
	var checkvar = 0;
	var infinitelooppreventer = 1;

	while (checkvar < numbersarray.length) {
		var comparevar = parseInt(numbersarray[checkvar], 10) - parseInt(arrayvariablewoob, 10);

		arrayvarplusone = parseInt(arrayvar, 10) + parseInt(1, 10);
		if (comparevar == arrayvarplusone) {
			actualarray[arrayvar] = comparevar;
			checkvar++;
		}
		else {
			actualarray[arrayvar] = "empty";
		}

		arrayvar++;
	}

	var alldataarray = [];

	var outputcountingvar = 0;
	var othercheckvar = 0;

	//Writing it all

	var woobzelflits = 0;

	document.getElementById("outputarea").innerHTML = "";

	while (woobzelflits < actualarray.length) {
		var woobzelflitsplusone = parseInt(woobzelflits, 10) + parseInt(1, 10);
		if (woobzelflitsplusone == actualarray.length) {
			document.getElementById("outputarea").innerHTML += actualarray[woobzelflits];
			woobzelflits++;
		}
		else {
			document.getElementById("outputarea").innerHTML += actualarray[woobzelflits];
			document.getElementById("outputarea").innerHTML += "%146%";
			woobzelflits++;
		}
	}


	while (outputcountingvar < actualarray.length) {

		if (actualarray[outputcountingvar] == "empty") {
			document.getElementById("outputarea").innerHTML += "%146%";
			document.getElementById("outputarea").innerHTML += "name%123Link%123";
		}
		else {
			document.getElementById("outputarea").innerHTML += "%146%";
			document.getElementById("outputarea").innerHTML += localStorage.getItem(numbersarray[othercheckvar]);
			othercheckvar++;
		}

		infinitelooppreventer++;

		if (infinitelooppreventer == 100) {
			alert("infinite loop");
			checkvar = numbersarray.length;
			return false;
		}

		outputcountingvar++;
	}

});



//Screen size adaption
if (screen.width == "1440") {
	$(".website").css("width", "94%");
	$(".datext").css("font-size", "180%");
	$("#text9").css("font-size", "140%");
}


document.getElementById('copyMySettings')
	.addEventListener('click',
		function () {
			var lsSettings = document.getElementById('localStorageSettings');
			lsSettings.innerText = JSON.stringify(localStorage);

			var snipRange = document.createRange();
			snipRange.selectNodeContents(lsSettings);
			var selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(snipRange);
			try {
				console.log('execced');
				document.execCommand('copy');
			} catch (err) {
				// Copy command is not available
				alert('Could not copy settings');
			}
			// Return to the copy button after a second.
			selection.removeAllRanges();
		});

window.setTimeout(function() {
	document.getElementById('betaAnnouncementDialog').open();
}, 3000);


//Send a message stating that this script is done loading
chrome.runtime.sendMessage({ loading: "done" });