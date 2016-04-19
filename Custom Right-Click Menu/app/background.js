if (localStorage.firsttime)
{
}
else
{
localStorage.setItem("firsttime", "no");
localStorage.setItem("optionson", "true");
localStorage.setItem("numberofrows", "1");
localStorage.setItem("1", "name%123Link%123");
localStorage.setItem("whatpage", "false");
localStorage.setItem("waitforsearch", "false");
localStorage.setItem("scriptoptions", "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")
localStorage.setItem("customcolors","0");
}

 
//Load all vars
var rows = localStorage.numberofrows;
var names = new Array();
var types = new Array();
var datas = new Array();
var rowsinmenu = 0;
var whichid = 0;
var howmanysubmenus = 0;
var x = 0;
var y = 1000;
var infinitelooppreventer = 0;
var beforerequestarray = [];
var whentodoitarray = [];
var whattodoarray = [];

//Load all the settings
function loadSettings()
{
   
//Define rows again
rows = localStorage.numberofrows;

var a = parseInt(rows, 10) + parseInt(1, 10);
var b = 1;

while (b < a)
{
var allthedata = localStorage.getItem(b);
var dataarray = new Array();
dataarray = allthedata.split("%123");

var c = parseInt(b, 10) - parseInt(1, 10);

names[c] = dataarray[0];
types[c] = dataarray[1];
datas[c] = dataarray[2];

b++;
}

chrome.contextMenus.removeAll();

 
//Main Context Menu that never changes
var mainthing = chrome.contextMenus.create({"title": "Custom Menu","contexts": ["all"]});
var theparentid = mainthing;

var code = ('alert("yolo");');

//Load the context menu's (the right-click stuff)


var d = 1;
var e = parseInt(rows, 10) + parseInt(1, 10);

while (e > d)
{
var f = parseInt(d, 10) - parseInt(1, 10);

var name = names[f];
var type = types[f];
var data = datas[f];



x = -1;
y = 1000;
infinitelooppreventer = 0;

while (y > x)
{



if (localStorage.getItem("menu" + y))
{

var allthedatamenu = localStorage.getItem("menu" + y);

var allthedatamenusplit = new Array();


allthedatamenusplit = allthedatamenu.split("%123");

var howmanywaits = allthedatamenusplit[0];

if (howmanywaits > 0)
{
theparentid = allthedatamenusplit[1];
howmanywaits--;
localStorage.setItem("menu" + y, howmanywaits + "%123" + theparentid);

x = y;
}
else
{
localStorage.removeItem("menu" + y);
}


}

if (y === 0)
{
theparentid = mainthing;
}

infinitelooppreventer++;

if (infinitelooppreventer === 1500)
{
alert("infinite loop");
alert(y);

x = y;
return false;
}

y--;
}




if (type == "Link")
{

chrome.contextMenus.create({"title": name, "parentId": theparentid,"contexts": ["all"], "onclick": linkfunction(data)});

}

if (type == "Script")
{
   var modifieddata = data.split("%124");
   if (modifieddata[0] != "0" && modifieddata[0] != "2")
   {
      //On visiting specified sites, send to array as well
      whentodoitarray[whentodoitarray.length] = modifieddata[0];
      whattodoarray[whattodoarray.length] = modifieddata[1];
   }
   if (modifieddata[0] == "0")
   {
      //On Click, so the normal way
      data = modifieddata[1];
      chrome.contextMenus.create({"title": name, "parentId": theparentid,"contexts": ["all"], "onclick": scriptfunction(data)});
   }
   if (modifieddata[0] == "2")
   {
      //Always, send to array
      whentodoitarray[whentodoitarray.length] = "always";
      whattodoarray[whattodoarray.length] = modifieddata[1]
   }
      
      
}

if (type == "Divider")
{

chrome.contextMenus.create({"type": "separator","contexts": ["all"], parentId: theparentid});

}

if (type == "Menu")
{

chrome.contextMenus.create({"title": name,"contexts": ["all"], "parentId": theparentid, "id": ("parent"+d)});


//Now for this part


if (rowsinmenu === 0)
{
rowsinmenu = data;
whichid = ("parent"+d);
howmanysubmenus = 1;
localStorage.setItem("menu" + howmanysubmenus, data + "%123" + whichid);
}
else
{
whichid = ("parent"+d);
rowsinmenu = data;
howmanysubmenus++;
localStorage.setItem("menu" + howmanysubmenus, data + "%123" + whichid);
}

//End of this stuff

}

var eminusone = parseInt(e, 10) - parseInt(1, 10);

if (d == eminusone)
{

var localstoragecountingvariablewoob = 0;
var fivehundred = 500;

while (localstoragecountingvariablewoob < fivehundred)
{
if (localStorage.getItem("menu"+localstoragecountingvariablewoob))
{
localStorage.removeItem("menu"+localstoragecountingvariablewoob);
}

localstoragecountingvariablewoob++;
}

}

d++;
}

//Function that gets called when a script-context-menu is clicked
function scriptfunction(data,properties)
{
  return function(properties){
      
   
   var searchvariable = data.search("//execute locally");
  var woobwoobsearchvariable = data.search("execute locally");
  
  if (searchvariable > -1 || woobwoobsearchvariable > -1)
  {
  var parentmenuitemid = properties.parentMenuItemId;
  var mediatype = properties.mediaType;
  var linkurl = properties.linkUrl;
  var srcurl = properties.srcUrl;
  var pageurl = properties.pageUrl;
  var frameurl = properties.frameUrl;
  var selectiontext = properties.selectionText;
  var waschecked = properties.wasChecked;
  var checked = properties.checked;
    
  eval(data);
  }
  else
  {
  chrome.tabs.executeScript(null, {file: "jquery-2.0.3.min.js"});
  chrome.tabs.executeScript(null, {code: data});
  }
   
  };
}

//Function that gets called when a link-context-menu is clicked
function linkfunction(data)
{
  return function(){
  
  if (localStorage.whatpage == "false")
  {  
  chrome.tabs.create({url:data});
  }
  else
  {
  chrome.tabs.update({url:data});
  }
  };
}

//Load options if nessecary
if (localStorage.optionson="true")
{

chrome.contextMenus.create({"type": "separator", parentId: mainthing, contexts: ["page"]});

var options = chrome.contextMenus.create({"title": "options", "parentId": mainthing, "onclick": launchoptions});

function launchoptions()
{
chrome.tabs.create({url:"options.html"});
}

}
}

window.onload = loadSettings();


//Receive messages
chrome.runtime.onMessage.addListener(
 function(request,MessageSender) {
  if (request.sendmethedatapls == "true")
  {

  	var sent = new Object();
  	sent.type = "nd";
  	sent.data = whentodoitarray;

  	chrome.tabs.sendMessage(MessageSender.tab.id, sent);

  	sent.data = whattodoarray;

  	chrome.tabs.sendMessage(MessageSender.tab.id, sent);

  }
  else if (request.adddata) {

  	console.log("dis");

  	var data = request.adddata;
  	var uid = request.uid;

  	var permissions = data.split("%permissions%");
  	var allpermissions = permissions[(permissions.length - 1)];
  	permissions.splice((permissions.length - 1), 1);
  	var withoutpermissions = permissions.join("%permissions%");

  	//ask for permissions
  	//array in which turns all numbers into permissions
  	var permarray = ["alarms", "background", "bookmarks", "browsingData", "clipboardRead", "clipboardWrite", "contentSettings", "cookies", "desktopCapture", "downloads", "", "history", "idle", "notifications", "management", "power", "privacy", "", "pushMessaging", "storage", "topSites", "tabCapture", "TTS", "webNavigation", "webRequest", "webRequestBlocking"];

  	console.log(allpermissions);
  	console.log(withoutpermissions);

  	allpermissions = allpermissions.split(",");

  	var error = false;
  	var stoppedwhere = false;

  	for (var i = 0; i < allpermissions.length && (!error) ; i++) {

  		console.log(i);
  		console.log(permarray[allpermissions[i]]);

  		chrome.permissions.contains({
  			permissions: [permarray[allpermissions[i]]]
  		}, function (result) {

  			if (result) {

  				//Move on to the next one

  			}
  			else {

  				chrome.permissions.request({
  					permissions: [permarray[allpermissions[i]]]
  				}, function (granted) {

  					console.log(granted);
  					//HIERZO
					//altijd granted ook al is ie niet granted

  					if (granted) {

  						//Good

  					}
  					else {

  						error = true;

  						//Send back which one you denied
  						stoppedwhere = permarray[allpermissions[i]];

  					}

  				});

  			}

  		});

  	}

  	if (error) {

  		var problems = "denied," + stoppedwhere;

  		chrome.tabs.sendMessage(MessageSender.tab.id, problems);

  	}
  	else {

  		var entirearray = [];
  		entirearray = withoutpermissions.split("%splitsplit%");
		
  		console.log(entirearray);

  		for (var i = 0; i < entirearray.length; i++) {

  			console.log(entirearray[i]);

  			var type = entirearray[i].split("%type%")[0];
  			var rest = entirearray[i].split("%type%")[1];
			
  			console.log(rest);

  			var title = rest.split("%title%")[0];

  			rest = rest.split("%title%")[1];

  			function toTitleCase(str) {
  				return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  			}

  			var string = title + "%123" + toTitleCase(type) + "%123" + rest;

  			localStorage.setItem(parseInt(localStorage.getItem("numberofrows"), 10) + 1, string);
  			localStorage.setItem("numberofrows", parseInt(localStorage.getItem("numberofrows"), 10) + 1);

  		}

  		loadSettings();

  	}

  }
  else if (request.sendlocalstoragedata) {

  	var sent = new Object();
  	sent.type = "lsdata";
  	sent.data = localStorage;

  	chrome.tabs.sendMessage(MessageSender.tab.id, sent);

  }
});
  

//Reload the settings once you hit save in the options tab
chrome.runtime.onMessage.addListener(
 function(request) {
  if (request.reload == "true")
  {
  loadSettings();
  location.reload();
  }
  });