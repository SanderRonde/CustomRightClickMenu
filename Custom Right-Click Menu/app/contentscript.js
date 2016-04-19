//Get the current URL and see if scripts are even allowed to run
var var1 = document.URL;

var pagedata = new Object;

var exception = false;

chrome.runtime.onMessage.addListener(function (message) {
	if (message.type == "lsdata") {

		exception = true;
		$("#commelement").attr("class","crm").html(JSON.stringify(message.data));

	}
	else if (message.data.split(",")[0] == "problems") {

		alert("You have denied the permissions " + message.data.split(",")[1] + ", the data has not been installed");

	}
});

function parsedata(data) {
	if (data != "" && !exception) {

		if (data == "datapls") {

			//Start data transfer
			//Fetch data from the background page
			chrome.runtime.sendMessage({ sendlocalstoragedata: true });

		}
	}
	else {
		exception = false;
	}
}

$("#commelement").bind("DOMSubtreeModified", function(){ setTimeout(function() { parsedata($("#commelement").html()) },0); });

//Check if we need to upload a script
if (var1.search("upload.php") > -1 && (var1.search("t=item") > -1 || var1.search("t=menu") > -1) && $("#keycheck")[0]) {
	if ($("#keycheck").html() == "cabc8dffe28b832e15ccc6badebd12e8") {

		//Let it know this extension is installed
		exception = true;
		$("#commelement").attr("class","crm").html("hi");

	}
}

//Check if we need to download a script
if (var1.search("/download.php?") > -1 && document.getElementById("closingkey") && document.getElementById("closingkey").innerHTML == "&lt;--cabc8dffe28b832e15ccc6badebd12e8--&gt;"
	&& document.getElementById("openingstring") && document.getElementById("openingstring").innerHTML.search("CRM") > -1 && document.getElementById("maindata"))
{

	//Parse the data
	var datatoinstall = document.getElementById("maindata").innerHTML;

	//Ask if the user wants to install the data

	function continueinstallation(install) {

		$("#downloaded").html("true");

		if (install) {

			var uid = $("#uid").html();

			var id = location.href.split("?i=")[1].split("&t=")[0];

			chrome.runtime.sendMessage({ adddata: datatoinstall, uid: uid, id: id });

			$("#comdiv").html("Downloaded%123" + uid + "%123" + id);

			function closepage() {
				window.close();
			}

			//Ask if they want to close this page
			$("#confirmwindow")
				.css("display", "block")
				.css("margin-left","40%")
				.children("#mainmsg")
				.html("Data has been installed, close this window?");

			$(".yesbutton").unbind("click").click(function () {
				closepage();
			});

			$(".nobutton").unbind("click").click(function () {
				$(this).parent().remove();
			});

		}
	}
	
	$("<div id='confirmwindow'></div>")
		.html("<span id='mainmsg'>Install the data on this page?<br>If you're unsure press no</span><br><br><div class='yesbutton'>Yes</div><div class='nobutton'>No</div>")
		.css({
			position: "absolute",
			marginLeft: "45%",
			marginTop: "20%",
			backgroundColor: "rgb(224, 224, 224)",
			padding: "15px",
			border: "5px solid black",
			borderRadius: "10px"
		})
		.appendTo("#msgdiv");

	$(".yesbutton").css({
		display: "inline",
		fontSize: "150%",
		paddingLeft: "10px",
		marginLeft: "10px",
		paddingRight: "10px",
		borderRadius: "5px",
		border: "2px solid rgba(0,0,0,0)",
		cursor: "pointer"
	}).mouseenter(function () {
		$(this).css("border", "2px solid black");
	}).mouseleave(function () {
		$(this).css("border", "2px solid rgba(0,0,0,0)");
	}).click(function () {
		$(this).parent().css("display", "none");
		continueinstallation(true);
	});

	$(".nobutton").css({
		display: "inline",
		fontSize: "150%",
		paddingRight: "10px",
		marginRight: "10px",
		paddingLeft: "10px",
		cursor: "pointer",
		border: "2px solid rgba(0,0,0,0)",
		borderRadius: "5px",
		marginTop: "-3px",
		float: "right"
	}).mouseenter(function () {
		$(this).css("border", "2px solid black");
	}).mouseleave(function () {
		$(this).css("border", "2px solid rgba(0,0,0,0)");
	}).click(function () {
		$(this).parent().css("display","none");
		continueinstallation(false);
	});
}

if (var1.search("http://") === 0 || var1.search("https://") === 0)
{
   //Change var1 to remove http://
   var1 = var1.replace("http://","");
   var1 = var1.replace("https://","");
   var1 = var1.replace("www.","");
   
   //Declare onmessage
   //Now compare the URL to where we can run it
   
   var firstonedone = "";
   var when = [];
   var what = [];
   
   chrome.runtime.onMessage.addListener(function(message)
   {
   	if (message.type == "nd") {
   		message = message.data;
   		if (firstonedone == "") {
   			when = message;
   			firstonedone = "woob";
   		}
   		else {
   			what = message;
   		}

   		if (what == message) {
   			//Do the actual comparing since we've got both and stuff

   			var var2 = 0;

   			while (when.length > var2) {
   				var var3 = when[var2];

   				if (var3 == "always") {

   					//Always, so just do that stuff

   					//Insert the code
   					//First get the code, that would be quite handy
   					var var11 = what[var2];


   					//Check if it has execute locally in it
   					if (var11.search("execute locally") > -1) {
   						chrome.tabs.executeScript(null, { file: "jquery-2.0.3.min.js" });
   						chrome.tabs.executeScript(null, { code: data });
   					}
   					else {
   						eval(var11);
   					}
   				}
   				else {
   					//Do it the normal way, im not gonna presss tab 50 times, fuck that shit


   					//Turn it into what i really is, without the 1,

   					var var3 = var3.split("1,");
   					var var5 = [];

   					if (var3.length > 2) {
   						var var4 = 1;

   						var var6 = parseInt(var4, 10) - parseInt(1, 10);

   						var5[var6] = var3[var4];

   						var4++;
   					}
   					else {
   						if (var3[0] == "" && var3[1] == "") {
   							var5 = "nositeselected";
   						}
   						else {
   							var5 = var3[1];
   						}
   					}

   					//Do the actual comparing

   					if (var5 != "nositeselected") {

   						if (var5.search(",") > -1) {
   							//Do this stuff
   							var var6 = [];
   							var6 = var5.split(",");
   						}
   						else {
   							var var6 = [];
   							var6[0] = var5;
   						}

   						var var7 = 0;

   						while (var6.length > var7) {
   							var var10 = var6[var7].replace("http://www.", "");
   							var10 = var10.replace("https://www.", "");
   							var10 = var10.replace("http://", "");
   							var10 = var10.replace("https://", "");
   							var10 = var10.replace("wwww.", "");

   							var10 = var10.replace("*", "foundanasterisk");
   							if (var10.search("foundanasterisk") > -1) {
   								//Gotta do that star stuff
   								var var8 = var1;
   								var var9 = var10.split("foundanasterisk");

   								if (var9.length > 2) {
   									alert("You can only have one asterisk in the site, please change it to only include one asterisk");
   								}
   								else {
   									if (var9[0] != "") {
   										if (var1.search(var9[0]) > -1) {
   											//It's in there

   											//Insert the code
   											//First get the code, that would be quite handy
   											var var11 = what[var2];

   											//Check if it has execute locally in it
   											if (var11.search("execute locally") > -1) {
   												chrome.tabs.executeScript(null, { file: "jquery-2.0.3.min.js" });
   												chrome.tabs.executeScript(null, { code: data });
   											}
   											else {
   												eval(var11);
   											}

   										}
   									}
   									if (var9[1] != "") {
   										if (var1.search(var9[1]) > -1) {
   											//It's in there

   											//Insert the code
   											//First get the code, that would be quite handy
   											var var11 = what[var2];

   											//Check if it has execute locally in it
   											if (var11.search("execute locally") > -1) {
   												chrome.tabs.executeScript(null, { file: "jquery-2.0.3.min.js" });
   												chrome.tabs.executeScript(null, { code: data });
   											}
   											else {
   												eval(var11);
   											}

   										}
   									}
   								}

   							}
   							else {
   								if (var10 == var1) {
   									//It's in there

   									//Insert the code
   									//First get the code, that would be quite handy
   									var var11 = what[var2];

   									//Check if it has execute locally in it
   									if (var11.search("execute locally") > -1) {
   										chrome.tabs.executeScript(null, { file: "jquery-2.0.3.min.js" });
   										chrome.tabs.executeScript(null, { code: data });
   									}
   									else {
   										eval(var11);
   									}

   									var7 = var6.length;

   								}
   							}
   							var7++;
   						}
   					}

   				}

   				var2++;
   			}

   		}
   	}
   });
   
   //It's allowed to run
   //Now send a message to the background page requesting the URL's and the scripts
   chrome.runtime.sendMessage ({sendmethedatapls: "true"});
   
   
}