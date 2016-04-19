var rows = localStorage.numberofrows;
var rowsplusone = parseInt(localStorage.numberofrows,10) + parseInt(1,10);
var randomvar = "no";
var otherrandomvar = "no";
var checkedall = "false";


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

while (aa < rowsplusone)
{
   //Getting the name of the row from localstorage
   var ae = localStorage.getItem(aa);
   var af = [];
   af = ae.split("%123");
   var ag = af[0];
   
   //If menu-stuff happened before
   if (cg != "nothing")
   {
      //Vars to use here, whatrow, cg, ch
      
       document.getElementById("rownumber" + whatrow).innerHTML += ('<input type="checkbox" id="itemcheckbox' + aa +
           '"" class="checkboxes"><div id="rowie' + aa + '" class="aroundblock"><div id="add' + aa +
           '" class="addbutton">+</div><div id="remove' + aa +
           '" class="removebutton">x</div><div id="thingy' + aa +
           '" class="tenpercent"></div><div id="block' + aa +
           '" class="block"><div id="otherthing' + aa + '" class="fifteenpercent"></div>' + ag + '</div></div><br>');
      
      $("#add" + aa).hide();
      $("#remove" + aa).hide();
      
      if (justchanged == "true")
      {
         justchanged = "false";
         
         var ck = 24.3 * ch;
         ck = ck - 24.3;
         
         //What if this row was already written to
         var qa = $("#rowie" + aa).parent().attr("id");
         var qb = $("#" + qa + "> div").size();
         if (qb > 1)
         {
            var qc = document.getElementById(qa).getElementsByTagName("div");
            var qd = qc.length;
            var qe = 0;
            
            while (qd > qe)
            {
               var qf = qc[qe];
               if ($(qf).margin().top !== 0 && $(qf).margin().top != "auto")
               {
                  if (qh != 0)
                  {
                     qg = $(qf).css("margin-top");
                     
                     if (typeof qg == "string")
                        {
                           //WHY JQuery WHY!?
                           
                           //Sometimes it DOES work -_-
                     if (qg.search("%") > -1)
                        {
                           //Convert to pixels, because jquery decided to work differently on different pages and return % instead
                           var qh = qg.split("%");
                           qh = qh[0];
                           
                           qh = parseInt(qh,10) /100;
                           qh = qh * 247.363683128;
                        }
                        if (qg.search("px") > -1)
                        {
                           var qh = qg.split("px");
                           qh = qh[0];
                        }
                                             
                        qh = parseInt(qh, 10) + parseInt(qg, 10);
                        
                        }
                        else
                        {
                           
                     
                     //Sometimes it DOES work -_-
                     if (toString(qg).search("%") > -1)
                        {
                           //Convert to pixels, because jquery decided to work differently on different pages and return % instead
                           var qh = qg.split("%");
                           qh = qh[0];
                           
                           qh = parseInt(qh,10) /100;
                           qh = qh * 247.363683128;
                        }
                        if (toString(qg).search("px") > -1)
                        {
                           var qh = qg.split("px");
                           qh = qh[0];
                        }
                                             
                        qh = parseInt(qh, 10) + parseInt(qg, 10);
                        }
                     }
                     else
                     {
                        var qg = $(qf).css("margin-top");
                        if (typeof qg == "string")
                        {
                           //WHY JQuery WHY!?
                                                      
                           //Sometimes it DOES work -_-
                        if (qg.search("%") > -1)
                        {
                           //Convert to pixels, because jquery decided to work differently on different pages and return % instead
                           var qh = qg.split("%");
                           qh = qh[0];
                           
                           qh = parseInt(qh,10) /100;
                           qh = qh * 247.363683128;
                        }
                        if (qg.search("px") > -1)
                        {
                           var qh = qg.split("px");
                           qh = qh[0];
                        }
                        
                        }
                        else
                        {
                           
                        //Sometimes it DOES work -_-
                        if (toString(qg).search("%") > -1)
                        {
                           //Convert to pixels, because jquery decided to work differently on different pages and return % instead
                           var qh = qg.split("%");
                           qh = qh[0];
                           
                           qh = parseInt(qh,10) /100;
                           qh = qh * 247.363683128;
                        }
                        if (toString(qg).search("px") > -1)
                        {
                           var qh = qg.split("px");
                           qh = qh[0];
                        }
                        
                        }
                        
                  }
               }
               qe++;
            }
            qh = parseInt(qh, 10) - 20.640625;
            
            qb--;
            //The ones that are actually there, the blocks themselves
            var qj = parseInt(qb,10) * 0.0555555 * parseInt(screen.height,10);
            qj = qj + parseInt(qh,10);
            
            //Turn ck (percentage from whole top) to pixels
            ck = parseInt(ck, 10)/100;
            ck = ck * 247.374399863;

            ck = ck - qj;
            ck = ck - 20.109375
            document.getElementById("rowie" + aa).style.marginTop = (ck + "px");
            document.getElementById("itemcheckbox" + aa).style.marginTop = (ck + "px");
            qh = 0;
         }
         else
         {
            document.getElementById("rowie" + aa).style.marginTop = (ck + "%");            
            document.getElementById("itemcheckbox" + aa).style.marginTop = (ck + "%");
            qh = 0;
         }
         
      }
      
      var co = 0;
      var cq = whatrow;
      
      cq--;
      
      while (cq > co)
      {
         if (cj != "0")
         {
            document.getElementById("rownumber" + cq).innerHTML += ('<div class="aroundblock"></div><br>');  
         }
         
         cq--;
      }
      
   }else
   {
         
   //writing a block
   document.getElementById("rownumber1").innerHTML += ('<input type="checkbox" id="itemcheckbox' + aa + '"" class="checkboxes"><div id="rowie' + aa + '" class="aroundblock"><div id="add' + aa + '" class="addbutton">+</div><div id="remove' + aa + '" class="removebutton">x</div><div id="thingy' + aa + '" class="tenpercent"></div><div id="block' + aa + '" class="block"><div id="otherthing' + aa + '" class="fifteenpercent"></div>' + ag + '</div></div><br>');
   
   $("#add" + aa).hide();
   $("#remove" + aa).hide();

   }
   
   if (af[1] == "Menu")
   {
      //Create new row
      
      ca++;
      document.getElementById("wheretheboxesgo").innerHTML += ('<div class="boxesrow" id="rownumber' + ca + '"></div>');
      document.getElementById("block" + aa).innerHTML = ('<div id="otherthing' + aa + '"class="fifteenpercent"></div>' + ag + ' ->');
      
      localStorage.setItem("waitingthing" + ca, af[2] + "," + othervar + "," + 1);
      othervar--;
   }
   
   cd = 1;
   ce = 100;
   
   while (ce > cd)
   {
      if (localStorage.getItem("waitingthing" + ce))
      {
         var cb = localStorage.getItem("waitingthing" + ce);
         var cf = [];
         cf = cb.split(",");
         
         cg = cf[0];
         ch = cf[1];
         
         var cj = parseInt(cg, 10) - parseInt(1, 10);
         
         if (cg == "0")
         {
            localStorage.removeItem("waitingthing" + ce);
            ca--;
         }
         else
         {
            localStorage.setItem("waitingthing" + ce, cj + "," + ch);
            whatrow = ce;
            
            if (cf[2] == "1")
            {
               justchanged = "true";
            }
            
            if (whatrow > highestwidth)
            {
               highestwidth = whatrow;
            }
            
            ce = cd;
         }
      }
      
      var ci = parseInt(ce, 10) - parseInt(1, 10);
      
      if (ci == cd)
      {
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
while (var2 > var1)
{
   if (localStorage.getItem("waitingthing" + var2))
   {
      localStorage.removeItem("waitingthing" + var2);
   }
   var2--;
}

//Setting the margin-top for the stuff below
var db = 70 * $("#rownumber1 > div").size();
db = db - 40;
var distancefromtop = db + "px";
db = db - 120
var dc = db - 160;
dc = dc/2;

//Showing the numbers on top
var hd = highestwidth;
hd++;
var ha = 1;
var hb = 10.8;
while (hd > ha)
{
   var hc = hb + "%";
   document.getElementById("wheretheboxesgo").innerHTML += ('<div class="numberdiv" style="margin-left:' + hc + ';"><b>' + ha + '</b></div>');   
      
   hb = hb + 15.4;
   ha++;
}


//Now putting all that stuff on the right width-hight stuff
var da = highestwidth/2;


            var fa = da * 2
            var gb = fa;
            fa++;
            var fb = 4.8;
            var fc = 1;
            var buttoncreated = "no";
            

            while (fa > fc)
            {

               document.getElementById("rownumber" + fc).style.marginLeft = fb + "%";
                        
               fc++;
               fb = fb + 15.4;
            }

            
            if (da > 3)
            {
               
                        
            //Scrolling to right      
            
            //document.getElementById("sidethingsdiv").innerHTML += ('<div id="leftscrolldivider" style="height:' + db + 'px" class="scrolldiv"><img src="Thumbnails/arrow.png" style="width:50%; height:136px; margin-left:30px; margin-top:' + dc + 'px;"></div>');
            
            document.getElementById("sidethingsdiv").innerHTML += ('<div id="rightscrolldivider" style="height:' + db + 'px" class="scrolldiv"><img src="Thumbnails/arrowright.png" style="width:80%; height:136px; margin-left:5px; margin-top:' + dc + 'px;"></div>');
            
            var ff = 1;
            
            //invisible ones
            var fh = da - 3;
            var fi = da + 4;

                     
            //Scroll right
            document.getElementById("rightscrolldivider").onclick = function()
            {
               ff = 1;
               
               $("#wheretheboxesgo").animate({marginLeft:"-=15.4%"});
               
               setTimeout(function()
               {
               
               //Create the go-to-left-button
               if (buttoncreated == "no")
                  {
                   document.getElementById("sidethingsdiv").innerHTML += ('<div id="leftscrolldivider" style="height:'
                       + db + 'px" class="scrolldiv"><img src="Thumbnails/arrow.png" style="width:50%; height:136px; margin-left:30px; margin-top:' + dc + 'px;"></div>');
               
                     //Declare the go-to-right-onclicks again
                     document.getElementById("rightscrolldivider").onclick = function()
                     {
                     ff = 1;
                        
                     $("#wheretheboxesgo").animate({marginLeft:"-=15.4%"});
                     
                     //Deciding if left one needs to be shown again
                     setTimeout(function()
                     {
            
                     //Making the right-thing disappear when it has to again
                     var ha = document.getElementById("rownumber1").style.marginLeft;
                     ha = ha.split("%");
                     ha = ha[0];
                     var hc = document.getElementById("wheretheboxesgo").style.marginLeft;
                     hc = hc.split("%");
                     hc = hc[0];
                     if (hc.search("-") > -1)
                     {
                        hc = hc.split("-");
                        hc = hc[1];
                     }
                     var hd = parseInt(ha, 10) - parseInt(hc, 10);
                     //Show left bar
                     if (hd < 4)
                     {
                        $("#leftscrolldivider").css("display","");
                     }
                     },400);
                     
                     setTimeout(function()
                     {
                        
                                 
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
                     if (gd < 95)
                     {
                        $("#rightscrolldivider").css("display","none");
                     }
                     //End of right onclicks
                     //Now declaring go-to-left-onclicks      
                     
                     document.getElementById("leftscrolldivider").onclick = function()
                     {
                        $("#wheretheboxesgo").animate({marginLeft:"+=15.4%"});
                        
                        setTimeout(function()
                        {
                        
                        //Making the left-thing disappear when it has to again
                        var ga = document.getElementById("rownumber1").style.marginLeft;
                        ga = ga.split("%");
                        ga = ga[0];
                        var gc = document.getElementById("wheretheboxesgo").style.marginLeft;
                        gc = gc.split("%");
                        gc = gc[0];
                        var gd = parseInt(ga, 10) - parseInt(gc, 10);
                        //Remove left bar
                        if (gd == 4)
                        {
                           $("#leftscrolldivider").css("display","none");
                        }
                        },400);
                        
                        setTimeout(function()
                        {
                                                
                        //Making the right thingy appear again when it has to
                        var ge = document.getElementById("rownumber" + gb).style.marginLeft;
                        ge = ge.split("%");
                        ge = ge[0];
                        var gf = document.getElementById("wheretheboxesgo").style.marginLeft;
                        gf = gf.split("%");
                        gf = gf[0];
                        if (gf.search("-") > -1)
                        {
                           gf = gf.split("-");
                           gf = gf[1];  
                        }
                        var gg = parseInt(ge, 10) - parseInt(gf, 10);
                        //Show right bar
                        if (gg > 95)
                        {
                           $("#rightscrolldivider").css("display","");
                        }
                        
                        },400);
                        
                     }
                  
                  },400);
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
               if (gd < 95)
               {
                  $("#rightscrolldivider").css("display","none");
               }            
               
               
               if (buttoncreated == "yes")
               {
               
               //Deciding if left one needs to be shown again
               setTimeout(function()
               {
            
               //Making the left-thing disappear when it has to again
               var ha = document.getElementById("rownumber1").style.marginLeft;
               ha = ha.split("%");
               ha = ha[0];
               var hc = document.getElementById("wheretheboxesgo").style.marginLeft;
               hc = hc.split("%");
               hc = hc[0];
               if (hc.search("-") > -1)
               {
                  hc = hc.split("-");
                  hc = hc[1];
               }
               var hd = parseInt(ha, 10) - parseInt(hc, 10);
               //Show left bar
               if (gd < 4)
               {
                  $("#leftscrolldivider").css("display","");
               }
               }, 400);

               
               //Now declaring go-to-left-onclicks      
               document.getElementById("leftscrolldivider").onclick = function()
               {
               $("#wheretheboxesgo").animate({marginLeft:"+=15.4%"});
                  
                  
                  setTimeout(function()
                  {
                  
                  //Making the left-thing disappear when it has to again
                  var ga = document.getElementById("rownumber1").style.marginLeft;
                  ga = ga.split("%");
                  ga = ga[0];
                  var gc = document.getElementById("wheretheboxesgo").style.marginLeft;
                  gc = gc.split("%");
                  gc = gc[0];
                  var gd = parseInt(ga, 10) - parseInt(gc, 10);
                  //Remove left bar
                  if (gd == 4)
                  {
                     $("#leftscrolldivider").css("display","none");
                  }
                  },400);
                  
                  setTimeout(function()
                  {
                                 
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
                  if (gg > 95)
                  {
                     $("#rightscrolldivider").css("display","");
                  }
                  
                  },400);
                  
               }
               
               }
               
               
               },400);
               
            }
            }

            $(".adddiv").html('<div color="black" style="display: block;"><hr color="black"></div><div class="actualboxes">' + $("#wheretheboxesgo").html() +
                '</div><br><button class="canceladding" style="margin-top:' + distancefromtop + '">Cancel</button><hr color="black">');

//remove unnessecary things
$(".checkboxes").each(function () {
    if ($(this).parent().parent().attr("class") == "actualboxes") {
        $(this).remove();
    }
});

//Apply onclicks only for those that are on the thingy below if you know what im saying, you probably don't but yeah.
$(".aroundblock").each(function()
{
    if ($(this).parent().parent()["0"].className == "actualboxes")
    {
        $(this).click(function()
        {
            var theid = $(this).attr("id");
            theid = theid.split("rowie")[1];

            var code = $(this).parent().parent().parent().parent().children(".codediv").children(".codeyo").html();

            code = code.replace(/<br class="noncodebr">/g, "");

            //Now add it
            //get original localstrorage val
            var origval = localStorage.getItem(theid);
            origval = origval.split("%123");
            if (origval[1] != "Script")
            {
                var thatword = '';
                switch (origval[1]) {
                    case "Link":
                        thatword = "link";
                        break;
                    case "Divider":
                        thatword = "divider";
                        break;
                    case "Menu":
                        thatword = "menu";
                        break;
                }
                
                var changetype = confirm("This item is currently a " + thatword + ", are you sure you want to change it into a script and replace whatever data it is carrying?");
            }
            else if (!(origval[2] == "" || origval[2] == "0%124"))
            {
                var checkifsomething = origval[2].split("%124");
                var checkotherstuff = checkifsomething[0].split(",");
                if (!(checkotherstuff[0] == "1" && checkifsomething[1] != ""))
                {
                    var changedata = confirm("There is already some data in this script, are you sure you want to replace it?");
                }
            }
            var goon = false;
            if (changetype !== undefined || changedata !== undefined)
            {
                goon = false;
                if (changetype !== undefined)
                {
                    if (changetype)
                    {
                        goon = true;
                    }
                }
                else if (changedata !== undefined)
                {
                    if (changedata)
                    {
                        goon = true;
                    }
                }
            }
            else
            {
                goon = true;
            }
            if (goon)
            {
                //go on, replace it

                var runwhen = $(this).parent().parent().parent().parent().children(".codediv").children(".runwhen").html();

                var changeintowhat = origval[0] + "%123Script%123" + runwhen + code;
                localStorage.setItem(theid, changeintowhat);

                alert("Succes!");

                $(this).parent().parent().parent().hide(1000);

            }

        });
    }
});
   
var shownornot = "0"

$("#sidethingsdiv").hide();
$("#wheretheboxesgo").hide();
$(".hrthing").hide();
$("#greentext").hide();
   
$("#whattoshare").click(function()
{
   if (shownornot == "0")
   {
      alert("You can click the items to check the corresponding checkboxs")
      $("#wheretheboxesgo").show(1000);
      $("#sidethingsdiv").show(1000);
      $("#randomanchor").css("margin-top",distancefromtop);
      $(".hrthing").show(1000);
      
      shownornot = "1";
   }
   else
   {
      $("#wheretheboxesgo").hide(1000);
      $("#sidethingsdiv").hide(1000);
      $(".hrthing").hide(1000);
      
      setTimeout(function()
      {
         $("#randomanchor").css("margin-top","0px");
      },1000);
      
      shownornot = "0";
   }
})


$(".aroundblock").click(function(event)
{
   var ab = event.target.id;
   if (ab.search("rowie") > -1)
   {
      var ac = ab.split("rowie");
      var ad = ac[1];
   }
   if (ab.search("thingy") > -1)
   {
      var ac = ab.split("thingy");
      var ad = ac[1];
   }
   if (ab.search("block") > -1)
   {
      var ac = ab.split("block");      
      var ad = ac[1];   
   }
   if (ab.search("otherthing") > -1)
   {
      var ac = ab.split("otherthing");    
      var ad = ac[1];
   }
   
   if (!ad)
   {
      return false;
   }
     
   if (document.getElementById("itemcheckbox" + ad).checked === false)
   {
      $("#itemcheckbox" + ad).attr("checked","true");
   }
   else
   {
      $("#itemcheckbox" + ad).removeAttr("checked");
   }
});   

var greentextvar = "0";
      
$("#shareit").click(function()
{
   var arrayvar = 1;
   var numbersarray = [];
   
      while (arrayvar < rowsplusone)   
      {
         var checkedvar = document.getElementById("itemcheckbox"+arrayvar).checked;
         
         if (checkedvar === true)
         {
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
   
   while (checkvar < numbersarray.length) 
   {    
      var comparevar = parseInt(numbersarray[checkvar], 10) - parseInt(arrayvariablewoob, 10);
      
      arrayvarplusone = parseInt(arrayvar, 10) + parseInt(1,10); 
      if (comparevar == arrayvarplusone)
      {
         actualarray[arrayvar] = comparevar;
         checkvar++;
      }
      else
      {
         actualarray[arrayvar] = "empty";
      }
   
   arrayvar++;
   }

   var alldataarray = [];
   
   var outputcountingvar = 0;
   var othercheckvar = 0;
   
   //Writing it all
   
   var woobzelflits = 0;
   
   var allemaildatastored = "";
   
   while (woobzelflits < actualarray.length)
   {
      var woobzelflitsplusone = parseInt(woobzelflits, 10) + parseInt(1, 10);
      if (woobzelflitsplusone == actualarray.length)
      {
         allemaildatastored += actualarray[woobzelflits];
         woobzelflits++;
      }
      else
      {
         allemaildatastored += actualarray[woobzelflits];
         allemaildatastored += "%146%";
         woobzelflits++;
      }
   }


   while (outputcountingvar < actualarray.length)
   {
      
      if (actualarray[outputcountingvar] == "empty")
      {
         allemaildatastored += "%146%";  
         allemaildatastored += "name%123Link%123";
      }
      else
      {
         allemaildatastored += "%146%";  
         allemaildatastored += localStorage.getItem(numbersarray[othercheckvar]);
         othercheckvar++;     
      }

   infinitelooppreventer++;
   
   if (infinitelooppreventer == 100)
   {
      alert("infinite loop");
      checkvar = numbersarray.length;
      return false;
   }

   outputcountingvar++;
   }
   
   var thaturl = "mailto:awsdfgvhbjn@gmail.com?subject=Custom Script/Menu&body="+ allemaildatastored;
   chrome.tabs.create({url:thaturl});

   $("#wheretheboxesgo").hide(1000);
   $("#sidethingsdiv").hide(1000);
   $(".hrthing").hide(1000);
   
   greentextvar = "0";
   
   window.addEventListener("focus", function()
   {
      if (greentextvar == "0")
      {
       
         $("#greentext").show(); 
         setTimeout(function()
         {
            $("#greentext").hide(1000);
         },5000);
         greentextvar++;
      }
      else
      {
         return false;
      }
     
   })
   
   setTimeout(function()
   {
      $("#randomanchor").css("margin-top","0px");
   },1000);
      
   shownornot = "0";

})

$(".codebutton").click(function () {

    if ($(this).html() == "Hide Code") {
        $(this).html("Show Code");
        $(this).parent().children(".codediv").css("display", "none");
    }
    else {
        $(this).html("Hide Code");
        $(this).parent().children(".codediv").css("display", "block");
    }

});

$(".applycode").click(function () {
    $(this).parent().children(".adddiv").show(1000);
});

$(".canceladding").click(function () {
    $(this).parent().hide(1000);
});

$(".sephr").attr("color", "black");