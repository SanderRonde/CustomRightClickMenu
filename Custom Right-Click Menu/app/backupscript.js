//Declaring var that says if it's finished or not
var finished = "false";

//Listening for messages
chrome.runtime.onMessage.addListener(
function(request) {
   if (request.loading == "started")
   {
      //Started loading
      //Set a timeout for about two seconds, if it isn't done by then, give an error alert
      setTimeout(function()
      {
         if (finished == "true")
         {
            //Done loading, nothing bad happened
         }
         else
         {
            //Something went wrong, now do all the JS
            $("#evenout").click(function()
            {
               var a = 1;
               var b = 0;
               var c = 0;
               while (a > b)
               {
                  if (localStorage.getItem(a))
                  {
                     c = a;
                  }
                  else
                  {
                     b = 1000;
                     
                  }
                  
                  if (a === 300)
                  {
                     console.log("error");
                     alert("infinite loop error, please report a bug by going to the extension's chrome web store page and including what's in your localstorage.");
                     var d = confirm("do you want to know how to get to your localstorage?");
                     if (d === true)
                     {
                        alert("After this message is gone, rightclick the page, hit inspect element and go to resources. There hit localstorage and print screen it or do it the way like to send the data");
                     }
                     a = b;
                     return false;
                  }
                  
                  a++;
               }
               
               localStorage.setItem("numberofrows", c);
               window.location.reload()
            })
            
            $("#removewaitingthings").click(function()
            {
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
               window.location.reload();
            })
            
            $("#resetalmostall").click(function()
            {
               //Reset all these
               localStorage.setItem("firsttime","no");
               localStorage.setItem("optionson","true");
               localStorage.setItem("waitforsearch","false");
               localStorage.setItem("whatpage","false");
               window.location.reload();
            })
            
            $("#resetexceptrows").click(function()
            {
               //Clear again
               localStorage.setItem("firsttime","no");
               localStorage.setItem("optionson","true");
               localStorage.setItem("waitforsearch","false");
               localStorage.setItem("whatpage","false");
               
               localStorage.setItem("scriptoptions","0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")
               
               window.location.reload();
            })
            
            $("#resetall").click(function()
            {
               var e = confirm("Would you like to email the developer the contents of the extension's localstorage? This will help fix bugs.");
               var f = "";
               if (e === true)
               {
                  for (var key in localStorage){
                     f = f + key + "=" + localStorage.getItem(key) + ",";
                  }
                  
                 var g = "mailto:awsdfgvhbjn@gmail.com?subject=Error Report&body=" + f;
                 chrome.tabs.create({url:g});
                 
                 $("#replaceablediv").html('<br><button style="height:50px;" id="continuethisstuff">Click this button to continue resetting</button><br><br><br>');
                 
                 //Declare what happens when you hit that new button
                 $("#continuethisstuff").click(function()
                 {
                     localStorage.setItem("firsttime","no");
                     localStorage.setItem("optionson","true");
                     localStorage.setItem("waitforsearch","false");
                     localStorage.setItem("whatpage","false");
                     localStorage.setItem("scriptoptions","0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")
                     
                     var h = 0;
                     var i = localStorage.numberofrows;
                     while (i > h)
                     {
                        localStorage.removeItem(i);
                        
                        i--;
                     }
                     
                     localStorage.setItem("1", "Name%123Link%123http://www.google.com");
                     localStorage.setItem("numberofrows","1");
                     
                     window.location.reload();
                 });
               }
               else
               {
                  localStorage.setItem("firsttime","no");
                  localStorage.setItem("optionson","true");
                  localStorage.setItem("waitforsearch","false");
                  localStorage.setItem("whatpage","false");
                  localStorage.setItem("scriptoptions","0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")
                  
                  var h = 0;
                  var i = localStorage.numberofrows;
                  while (i > h)
                  {
                     localStorage.removeItem(i);
                     
                     i--;
                  }
                  
                  localStorage.setItem("1", "Name%123Link%123http://www.google.com");
                  localStorage.setItem("numberofrows","1");
                  
                  window.location.reload();
               }
               
            })
            
            var j = 1;
            var k = localStorage.numberofrows;
            k = parseInt(k, 10) + parseInt(1, 10);
            
            while (k > j)
            {
               if (localStorage.getItem(j))
               {
                  var q = localStorage.getItem(j);
                  q = q.replace(/\n/g, " ");
                  document.getElementById("datatextarea").innerHTML += (q + '\n')
               }
               else
               {
                  document.getElementById("datatextarea").innerHTML += ('not found \n');
               }
               
               j++;
            }
            
            $("#applyandtry").click(function()
            {
               var l = document.getElementById("datatextarea").value;
               
               var m = [];
               m = l.split("\n");
               
               var n = 0;
               var o = parseInt(m.length, 10) - parseInt(1, 10);
               
               while (n < o)
               {
                  var p = parseInt(n, 10) + parseInt(1, 10);
                  localStorage.setItem(p, m[n])
                  
                  n++;
               }
               
               window.location.reload();
            })
            
            //alert("something went wrong loading, you can use this page to try and fix it");
         }
      })
   }
});

chrome.runtime.onMessage.addListener(
function(request) {
   if (request.loading == "done")
   {
      finished = "true";
   }
})

