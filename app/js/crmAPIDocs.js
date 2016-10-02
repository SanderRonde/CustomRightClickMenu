'use strict';

//#region Drawer Animation
var drawer = document.getElementById('sideDrawer');
document.getElementById('menuToggler').addEventListener('click', function () {
	setTimeout(function () {
		drawer.classList.toggle('toggled');
	}, 0);
});

document.getElementById('content').addEventListener('click', function () {
	if (drawer.classList.contains('toggled')) {
		drawer.classList.remove('toggled');
	}
});
//#endregion

//#region Drawer Construction
//Construct the drawer to the left
function capitalizeName(name) {
	return name.split(' ').map(function(word) {
		return word[0].toUpperCase() + word.slice(1);
	}).join(' ');
}

var i;
var sections = [];
var sectionsHTML = document.getElementsByClassName('docIndexSectionTitleLink');
for (i = 0; i < sectionsHTML.length; i++) {
	var name = capitalizeName(sectionsHTML[i].innerText);
	sections[i] = name;
}

function createListener(link) {
	return function() {
		drawer.classList.remove('toggled');
		location.hash = '#' + link.toLowerCase();
	}
}

var navCont = document.getElementById('navCont');

for (i = 0; i < sections.length; i++) {
	var cont = document.createElement('div');
	cont.classList.add('sectionNavCont');
	cont.addEventListener('click', createListener(sections[i].replace(/ /g, '_')));

	var text = document.createElement('div');
	text.classList.add('sectionNavTxt');
	text.innerText = sections[i];

	var paperRipple = document.createElement('paper-ripple');

	cont.appendChild(text);
	cont.appendChild(paperRipple);
	navCont.appendChild(cont);
}
//#endregion

//#region ScrollOffset
window.addEventListener('hashchange', function() {
	if (location.hash.length !== 0) {
		window.scrollTo(window.scrollX, window.scrollY - 100);
	}
});

window.setTimeout(function() {
	if (location.hash.length !== 0) {
		var el = document.getElementById('anchor' + location.hash.slice(1).toLowerCase().replace(/ /g, '_'));
		if (el) {
			el.scrollIntoView();
			window.scrollTo(window.scrollX, window.scrollY - 100);
		}
	}
}, 0);
//#endregion