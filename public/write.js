var teleport = function(){};
var sendalert = function() {};
var findOwner = function() {};
$(document).ready(function() {

var tileWidth = 10;
var tileHeight = 18;
var textSize = 15;
var socket = io.connect();
var fontSize;
var pixelData;
var character;
var dragContainer;
var flipX = 0;


var defaultuser = "anon"+Math.random();
var user_id = Math.random();
var oldname =" ";
var writtenamount = 0;
var old_location;
var chat_is_closed = true;
var unicode_is_closed = true;
var needs_updated = false;
var randomColor = false;
var swal_is_open = false
var position = {
    x: 0,
    y: 0,
    clickX: 0,
    clickY: 0,
    highlightX: 0,
    highlightY: 0
};
function reposition(type){
	if(type == "getpos"){
		position.x = stage.mouseX - dragContainer.x;
		position.y = stage.mouseY - dragContainer.y;
		position.x = (Math.ceil(position.x / tileWidth) * tileWidth) - tileWidth;
		position.y = (Math.ceil(position.y / tileHeight) * tileHeight) - tileHeight;
		position.highlightX = (Math.ceil(position.x / tileWidth) * tileWidth) + dragContainer.x;
		position.highlightY = (Math.ceil(position.y / tileHeight) * tileHeight) + dragContainer.y;
		position.clickX = position.highlightX;
		position.clickY = position.highlightY;
		$("#highlight").css({ "left": "" + (position.highlightX) + "px","top": "" + position.highlightY + "px"});
		}
	else if(type == "enter"){
        position.x = position.clickX - dragContainer.x + tileWidth;
        position.y = (position.clickY - dragContainer.y) + tileHeight;
        position.x = (Math.ceil(position.x / tileWidth) * tileWidth) - tileWidth;
        position.y = (Math.ceil(position.y / tileHeight) * tileHeight);
        position.highlightX = (Math.ceil(position.x / tileWidth) * tileWidth) + dragContainer.x;
        position.highlightY = (Math.ceil(position.y / tileHeight) * tileHeight) + dragContainer.y;
        position.clickX = position.highlightX;
        position.clickY = position.highlightY;
		 $("#highlight").css({"left": "" + (position.highlightX) + "px","top": "" + position.highlightY + "px" });
	}
	else if(type == "font"){
		position.x = (Math.ceil(position.x / tileWidth) * tileWidth) - tileWidth;
		position.y = (Math.ceil(position.y / tileHeight) * tileHeight) - tileHeight;
		position.highlightX = (Math.ceil(position.x / tileWidth) * tileWidth) + dragContainer.x;
		position.highlightY = (Math.ceil(position.y / tileHeight) * tileHeight) + dragContainer.y;
		position.x = (Math.ceil(position.x / tileWidth) * tileWidth) + tileWidth;
		position.y = (Math.ceil(position.y / tileHeight) * tileHeight) + tileHeight;
		position.highlightX = (Math.ceil(position.x / tileWidth) * tileWidth) - dragContainer.x;
		position.highlightY = (Math.ceil(position.y / tileHeight) * tileHeight) - dragContainer.y;
		$("#highlight").height(tileHeight).width(tileWidth);
		$(document).one("input click",function(){$("#highlight").css({ "left": "" + (position.highlightX) + "px","top": "" + position.highlightY + "px"});})
	
	}
}

function paste(word) {
    for (var i in word) {
        if (word[i] == "\n") {
            world.triggerEnter();
        }
        else {
            write(word[i]);
        }
    }
}


var new_location = {
		x:0,
		y:0
};
var updateArea = function (){
	old_location = {
		x:dragContainer.x,
		y:dragContainer.y
	}
	
			dragContainer.removeAllChildren()
		socket.emit('connected',{
			dragContainerX: [dragContainer.x],
			dragContainerY: [dragContainer.y],
			width: $(window).width(),
			height: $(window).height()
			
		})}
	
//		Create two canvases the size of the window.
        $("body").append('<canvas id="canvas" width="' + $(window).width() * 2 + '" height="' + $(window).height() * 2 + '"></canvas><canvas id="canvas_highlight" width="' + $(window).width() * 2 + '" height="' + $(window).height() * 2 + '"></canvas>');

//		Create a stage for the highlights.
        var stage_highlight = new createjs.Stage("canvas_highlight");
//		Create a stage for the general canvas
        var stage = new createjs.Stage("canvas");
//		This runs on every tick.		
        createjs.Ticker.addEventListener("tick", tick);		
		function tick(event) {stage.update();}
//		The DragBox listens to mouse events.
        var dragBox = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, stage.canvas.width, stage.canvas.height));
//		when the mouse is down drag.		
        dragBox.addEventListener("mousedown", startDrag);
//		whenever the user click on the window thier click position is captured.
        dragBox.addEventListener("click", getPos);
//		add the box to the stage.
        stage.addChild(dragBox);     
// 		Container to drag around
        dragContainer = new createjs.Container();
        stage.addChild(dragContainer);
        // Drag
		var offset = new createjs.Point();
		updateArea();	
		
		
//-----------------------------------------	| public function which writes a letter to the canvas.
  var write = function(one_letter, color) {
// 		if you dont specify a color the color is the jscolor      
		if(typeof color == "undefined" && !randomColor){color = document.getElementById("jscolor_id").style.backgroundColor}
//		if you have random color on do random colors		
		else if (randomColor){ color = ("#"+Math.floor(16777215*Math.random()).toString(16))};
//		send the letter data to socket.

		socket.emit('write_letter', {letter: [one_letter.charCodeAt(0), position.x, position.y, textSize, tileWidth, tileHeight,color,user_id]});
//		move the positions on the page over a character space.
		position.x += tileWidth;position.highlightX += tileWidth;
//		Move the highlight location. | TODO: make the highlight on the canvas.
		$("#highlight").css({"left": "" + (position.highlightX) + "px", "top": "" + position.highlightY + "px"});		
};//write letter
	

//-----------------------------------------	| what to do when you recive write latter command from socket.io
		socket.on('write_letter', function(data) {
//		Data.letter is all of the letter information			
		var letter = data.letter;

//		write the letter to the canvas.
		var text = new createjs.Text("" + String.fromCharCode(data.letter[0]) + "", "" + letter[3] + "px Courier New",letter[6]);
//		make the location of the text.
		text.x = letter[1];
		text.y = letter[2];
//		add text to canvas
		dragContainer.addChild(text);
});//end write letter


//-----------------------------------------	| this is ran when you recieve a replace_letter from the canvas.
		socket.on('replace_letter', function(data) {
//		all letter information from server
		letter = data.letter;
//		cover old text with white square. | TODO : remove letter from canvas instead of hiding it.
		var g = new createjs.Graphics().beginFill("#ffffff").drawRect(letter[1], letter[2] - 1, letter[4], letter[5]); var box = new createjs.Shape(g); dragContainer.addChild(box);
//		write the letter to the canvas.
		var text = new createjs.Text("" + String.fromCharCode(data.letter[0]) + "", "" + letter[3] + "px Courier New",letter[6]);
//		make the location of the text.
		text.x = letter[1];
		text.y = letter[2];
//		add text to canvas
		dragContainer.addChild(text);
});//end replace letter
 
 
//-----------------------------------------	| this is ran when you start to drag.
		function startDrag(event) {
//		move the highlight somewhere away.
		$("#highlight").css({"left": "","top": ""});
		offset.x = stage.mouseX - dragContainer.x;
		offset.y = stage.mouseY - dragContainer.y;
//		once you have the offset, and tou are dragging, run the do drag
		event.addEventListener("mousemove", doDrag);
}
		
//-----------------------------------------	| gets and sets all positions.
        function getPos(event) {
		reposition("getpos");
		}
        
teleport= function(x,y) {
dragContainer.x = Math.ceil(x * -1000);
dragContainer.y = Math.ceil(y * 1000);
//		recalculate the coords
		$("#coord-x").text("X: " + (Math.ceil(offset.x / 1000)-1));
		$("#coord-y").text(" Y: " + (((Math.ceil(offset.y / 1000)) * -1)+1));
		updateArea();
//		reset the location.
		old_location.x = new_location.x;
		old_location.y = new_location.y;
		}
		
//-----------------------------------------	| actually drags the container
        function doDrag(event) {
//		reposition drag container
		dragContainer.x = event.stageX - offset.x;
		dragContainer.y = event.stageY - offset.y;
//		recalculate the coords
		$("#coord-x").text("X: " + (Math.ceil(offset.x / 1000)-1));
		$("#coord-y").text(" Y: " + (((Math.ceil(offset.y / 1000)) * -1)+1));
//		the the new position.
		new_location = {x:dragContainer.x, y:dragContainer.y}
}		// Update the stage


//		run specific functions when the mouse is down or up.
		$(document).on("keydown mouseup",function(){
//		If the new location is not the old location 	
		if(new_location.x !== old_location.x && new_location.y !== old_location.y){
//		update the screen
		updateArea();
//		reset the location.
		old_location.x = new_location.x;
		old_location.y = new_location.y;
		}//end if noew laocation
})

//-----------------------------------------	| Just like ywot, constantly selects the input
        setInterval(function() {
//		if the unicode table is not open, if the chatinput is not selected, and if the nickname is not selected
		if (!$(".chatinput").is(":focus") && !$("#nick").is(":focus") && unicode_is_closed && !swal_is_open) {
//		then select the input for the canvas
		$("#capture").select();
		}//if others or not selcted
});



//-----------------------------------------	| similar to old wcammand of ywot
var world = {
//		this is called to create an enter equivelent	
    triggerEnter: function() {
		reposition("enter");
    },
//		this moves the cursor is a specific direction
    moveCursor: function(dir) {
        if (dir == "right") {
            $("#highlight").css({
                "left": "" + (position.highlightX + tileWidth) + "px",
                "top": "" + position.highlightY + "px"
            });
            position.highlightX += tileWidth;
            position.x += tileWidth;
        }
        else if (dir == "left") {
            $("#highlight").css({
                "left": "" + (position.highlightX - tileWidth) + "px",
                "top": "" + position.highlightY + "px"
            });
            position.highlightX -= tileWidth;
            position.x -= tileWidth;
        }
        else if (dir == "up") {
            $("#highlight").css({
                "left": "" + (position.highlightX) + "px",
                "top": "" + (position.highlightY - tileHeight) + "px"
            });
            position.highlightY -= tileHeight;
            position.y -= tileHeight;
        }
        else if (dir == "down") {
            $("#highlight").css({
                "left": "" + (position.highlightX) + "px",
                "top": "" + (position.highlightY + tileHeight) + "px"
            });
            position.highlightY += tileHeight;
            position.y += tileHeight;
        }
//		this moves the cursor 4 spaces right
        else if (dir == "tab") {
            $("#highlight").css({
                "left": "" + (position.highlightX + (tileWidth * 4)) + "px",
                "top": "" + position.highlightY + "px"
            });
            position.highlightX += (tileWidth * 4);
            position.x += (tileWidth * 4);
        }
//		this moves the cursor backwards.	
        else if (dir == "backspace") {
            $("#highlight").css({
                "left": "" + (position.highlightX - (tileWidth * 2)) + "px",
                "top": "" + position.highlightY + "px"
            });
            position.highlightX -= (tileWidth * 2);
            position.x -= (tileWidth * 2);
        }
    }
};


//-----------------------------------------	| whenver capture gets input data
        $("#capture").on("input", function() {
		var capture = $("#capture").val();
//		check if capture is defined
		if (typeof capture[0] !== "undefined") {
//		check if capture is a newline character, if it is, trigger enter.
		if (capture == "\n") {world.triggerEnter();return;}
//		if it is not a newline, paste the data
		paste(capture);
		}//end of not undefined,
});




//-----------------------------------------	| KEYDOWN EVENTS
		$(document).on("keydown", function(e) {
//		if the unicode table is closed, nich and chatinput are not selected			
		if (!$(".chatinput").is(":focus") && !$("#nick").is(":focus") && unicode_is_closed) {
		var key = 'which' in e ? e.which : e.keyCode;
//		down arrow
		if (key == 40) {world.moveCursor("down");}
//		right arrow
		if (key == 39) {world.moveCursor("right");}
//		up arrow
		if (key == 38) {world.moveCursor("up");}
//		left arrow
		if (key == 37) {world.moveCursor("left");}
//		tab
		if (key == 9) {world.moveCursor("tab");}
//		backspace
		if (key == 8) {write(" ");world.moveCursor("backspace");}
		}//only if others are not selected
});


//		This is ran automatically. creates a unicode table.
var stuff = " <tbody><tr>";
for(i=0; i<800;i++){
stuff+="<td>"+(String.fromCharCode(i+9472))+"</td>"
if (i%40==0 && i!==0){stuff += "</tr><tr>"}
}
stuff += "</tr></tbody>"
$(".vertical-center table").html(stuff)


//-----------------------------------------	| this changes font sizes.
fontSize = function(size) {
    if (size == "bigger") {
        if (tileWidth < 80) {
            tileWidth = tileWidth * 2;
            tileHeight = tileHeight * 2;
            textSize = (textSize * 2) + 1;
        }
    }
    if (size == "smaller") {
        if (tileWidth > 10) {
            tileWidth = tileWidth / 2;
            tileHeight = tileHeight / 2;
            textSize = (textSize - 1) / 2;
        }
    }
	    if (size == "smallest") {

            tileWidth = 5;
            tileHeight = 7;
            textSize = 9;
    }
		    if (size == "biggest") {
            tileWidth = 160;
            tileHeight = 288;
            textSize = 255;
    }
reposition("font");
   
};


//make sure mouse is not hidden
var mousehide = false;
// finds position
function findPos(obj) {var curleft = 0,curtop = 0;if (obj.offsetParent) {do { curleft += obj.offsetLeft;curtop += obj.offsetTop;} while (obj = obj.offsetParent);return {x: curleft, y: curtop};}return undefined;}	
// changes rgb values into hex values 
function rgbToHex(r, g, b) {if (r > 255 || g > 255 || b > 255) {throw "Invalid color component";}return ((r << 16) | (g << 8) | b).toString(16);}
//When the mouse moves the tooltip moves.
		$(document).on("mousemove.tooltip", function(e) {$("#tooltip").offset({left: e.clientX + 20,top: e.clientY});});
//when a tool is hovered make the tooltip text change
		$(".toolbar-tool").hover(function() {$("#tooltip").html($(this).data("tooltip").replace(/ /g, "&nbsp;"));});
//This variable sends a message to the chat area for the users.	
		var sendmsg = function(msg,user) {socket.emit('say_message', {message: [msg,user,user_id] });};
//This public variable sends a mass alert message to users.	
		sendalert = function(msg,amount,owner) {socket.emit('alert_message', {alert: [msg,amount,user_id,owner]});};
//This public variable finds the owner of some text.
		findOwner = function(amount,warning){socket.emit('find_owner', {owner: [position.x,position.y,amount,user_id,warning]});};


		
//-----------------------------------------	| CHEAT test function. Used during the send button cheat menu
var checkCheats = function(){
//		if the nickname is "cheat"
		if( ( /^cheat$/i).test($("#nick").val())){
//		if you write random color on then cheat will be activiated	
			if ((/random(| )color( |=)on/i).test($(".chatinput").val())) {	
//		the cheat unlocks the function random color          
		$(".chatinput").val("CHEAT ACTIVATED");randomColor = true;setTimeout(function(){$(".chatinput").val("");$("#nick").val("")},1000);
        }
//		if you make it off the cheat is deactivated		
		else if ((/random(| )color( |=)off/i).test($(".chatinput").val())) {
            $(".chatinput").val("CHEAT DEACTIVATED");randomColor = false;
			setTimeout(function(){$(".chatinput").val("");$("#nick").val("")},1000);
        }
//		tiny font		
		else if ((/^yellow ?(polka|poka) ?dot ?bikini$/i).test($(".chatinput").val())) {
            $(".chatinput").val("CHEAT ACTIVATED");fontSize("smallest");
			setTimeout(function(){$(".chatinput").val("");$("#nick").val("")},1000);
        }
//		giant font		
		else if ((/^bill ?board$/i).test($(".chatinput").val())) {
            $(".chatinput").val("CHEAT ACTIVATED");fontSize("biggest");
			setTimeout(function(){$(".chatinput").val("");$("#nick").val("")},1000);
        }
//		if you cheated, dont send anything	
		return true;
		}
//CHEATS END
};//check cheats



//-----------------------------------------	| Sending messages on the chat area.
 socket.on('say_message', function(data) {	 
//		init some the variables
		var write_name = false;
		var user_color = "";
//		check if the messagename has been said before. if not, writename should be true so we can write the name.
		if (data.message[1] !== oldname){write_name = true}
//		check if the user id is yours. if it is then change color.
		if(data.message[2] == user_id){user_color = "#2795EE;"}
//		if not, check to see if it is a new message at least.
		else if(data.message[2] !== user_id && data.connect!=="new"){user_color = "#5827EE;"}
//		make sure that what we are attempting to write exists.
		if(typeof data.message[1]!== "undefined"){
//		check to see if we should write the username.		
		if(write_name)	{$("#messages").append('<div class="username"style="color:'+user_color+'">' + data.message[1].replace(/ /g, "&ensp;") + '</div>'); oldname = data.message[1];}
//		now we will write the message.	
		$("#messages").append('<p class="msg">' + data.message[0].replace(/ /g, "&ensp;") + '</p>');	
		}//if exists
});	//say message
   
   
   
//-----------------------------------------	| Used for sending a mass alert messages.
socket.on('alert_message', function(data) {
//		check to see if the message exists		
		if(typeof data.alert!== "undefined"){
//		check if you are not the sender.
		if(user_id!==data.alert[2]){
//		Go ahead and send a basic alert of the message: 
		swal({title:"Notice",text:data.alert[0]});
		}//	if not sender
//		If you are the sender.
		else{console.log(data.notify);}
		return false;
		}//if exists
//		If something fails send a warning.
		console.warn(data.notify);		
});	//send alert message



//-----------------------------------------	| Find the owner of a written message.
socket.on('find_owner', function(data) {
	
//		check to see if the message exists	and owner exists	
		if(typeof data.owner!== "undefined" && typeof data.findOwner!== "undefined"){
//		check to see if the owner
		if(data.findOwner==user_id){
//		alert message and refresh page.
		swal({  allowEscapeKey: false, closeOnConfirm:false, allowOutsideClick:false, title: 'Warning',  text: data.owner[4], type: 'warning' },function(isConfirm) { if(isConfirm){location.reload();}});setTimeout(function(){location.reload();},10000);}
		}//if exists	
});	//find owner



//================================	| SIDEBAR BUTTONS		
//		when the increase size of text icon is clicked, make the font size bigger
        $(".icon-add").on("click", function() {fontSize("bigger");});
//		when the decrease size of text icon is clicked, make the font size smaller		
        $(".icon-minus").on("click", function() {fontSize("smaller");});

		
		
//-----------------------------------------	| When unicode table is clicked.
$(".unicode-table").on("click", function(event) {
//		set variable to check what you are clicking
		var Localtype = event.target.localName;
//		If you dont click on anything in th table hide the table and set inicode table to close.
		if (Localtype !== "td" && Localtype !== "tr" && Localtype !== "tbody" && Localtype !== "table") {$(".unicode-table").hide();unicode_is_closed = true;}
});



//-----------------------------------------	| When the send button is pressed.
    $("#send-btn").on("click", function() {
//		if the nickname is blank make it anon.
		if((/(^\s*$|^[\W]*$)/).test($("#nick").val())){user = defaultuser;}
//		if the nickname is valid, use that
		else{user = $("#nick").val();}
//		check for cheatcodes		
		if (checkCheats()){	
//		if cheat, dont send
		return false;}
//		Check to see if you have written anything.		
        if ($(".chatinput").val().trim() !== "") {	
//		If you have, we will split your message with any newlines.				
		var message_to_send = $(".chatinput").val().split("\n");
//		for each line in the message send the message	
		for (var i in message_to_send) {sendmsg(message_to_send[i],user);}
//		remove the chat value.	
            $(".chatinput").val("");
        }//if not empty
});



//-----------------------------------------	| When overlay button is clicked hide the unicode table;
$(".overlay").on("click", function() { $(".unicode-table").hide();unicode_is_closed = true;});



//-----------------------------------------	| when a toolbar tool is clicked
$(".toolbar-tool").on("click", function() {

//----RESET VALUES
		mousehide = false;
//		remove any colorpicker functions
		$(document).off(".picker");	
		$(document).off(".toggled");	
		
//		cursor recives pointer again	
		$("#canvas").css("cursor","");		
//		reset cursor	
		$("#cursor").css("color","");$("#cursor").hide();$("#cursor").text("");
//		reset cursor icon	
		$(".make-cursor").css("opacity", 1);		
			
//----CHAT ICON
		if ($(this).data("tooltip") == "Chat") {
//		if the chatbar is already closed;	show it and now its open
        if (chat_is_closed) {$(".chatbar").show();chat_is_closed = false;}
//		if the chatbar is already open then hide it and now its closed.
		else {$(".chatbar").hide();chat_is_closed = true;}		
        }//chat
		
//----UNICODE ICON
		else if ($(this).data("tooltip") == "Unicode Symboles") {
//		if the unicode is already closed;	show it and now its open
		if (unicode_is_closed) {$(".unicode-table").show();unicode_is_closed = false;}
//		if the chatbar is already open then hide it and now its closed.
		else {$(".unicode-table").hide();unicode_is_closed = true;}
        }//unicode
		
		else if ($(this).data("tooltip") == "Teleport") {
		
swal_is_open = true;
swal({
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'Teleport',
    cancelButtonText: 'Cancel',
    confirmButtonClass: 'confirm-class',
    cancelButtonClass: 'cancel-class',
    closeOnCancel: false,
    title: "Teleport",
    html: "Enter the coordinates that you would like to teleport to.<input id='input-x' placeholder='Enter x coordinate'><input id='input-y' placeholder='Enter y coordinate'>"
}, function(isConfirm) {
	if($("#input-x").val() == ""){
		$("#input-x").val(0)
	}
		if($("#input-y").val() == ""){
		$("#input-y").val(0)
	}
    if (isConfirm && (/^-?\d{0,5}.\d{0,5}$/).test($("#input-x").val()) && (/^-?\d{0,5}.\d{0,5}$/).test($("#input-y").val()) ) {
       if($("#input-x").val()<31000 && $("#input-y").val()<31000 ){
	   teleport($("#input-x").val(), $("#input-y").val());
		swal_is_open = false;
		}
		else{
			alert('Teleport has been canceled, the number was too high.');
		}
    }
    else {
        swal('Cancelled', 'Teleport has been canceled', 'error');
		swal_is_open = false;
    }
});	

        }//unicode
				
//----FONT SIZE BIGGER
        else if ($(this).data("tooltip") == "Font size +") {fontSize("bigger");}
		
//----FONT SIZE SAMLLER
        else if ($(this).data("tooltip") == "Font size -") {fontSize("smaller");}

//----if you clicked something toggleable
		if ($(this).hasClass("toggleable")) {			
//		create the cursor;	
		$(".make-cursor").css("opacity", 1);
//		if it is aready toggled
		if ($(this).hasClass("toggled")) {
//		Untoggle it		
		$(this).removeClass("toggled"); $("#cursor").hide(); $("#cursor").text("");
}		
//		if it isnt toggled			
		else {			
//		Remove anything toggled			
		$(window).off(".toggled");$(".toggleable").removeClass("toggled");
//		add the toggle class
		$(this).addClass("toggled");	
		
//----if makecursor 
		if ($(this).hasClass("make-cursor")) {
//		hide the mouse
		mousehide = true;
//		make the toggleable button hidden;
		$(this).css("opacity", 0);		
//		if it has the class flip, flipit.
		if ($(this).hasClass("flip")) {$("#cursor").addClass("flip");flipX = -15;}		
//		if it does not have the class flip, unflip it
		else {$("#cursor").removeClass("flip");}		
//		make the cursor the same as the icon
		$("#cursor").text($(this).text());$("#cursor").show();
		}//end if make cursor
        }//end if not toggled
        }//end if toggleable
});//toolbutton on click


	
//-----------------------------------------	| what happens when the mose moves with a toggled button	
		$("#canvas").on("mousemove.toggled", function(e) {
			if(mousehide){
// 		move the fake cursor
		$("#cursor").offset({left: e.clientX + flipX,top: e.clientY - 25});
//----remove the normal cursor
		$("#canvas, #cursor").css("cursor","none");		
//----If the cursor is colorize 
		if($("#cursor").text() == "colorize"){
//		check position of mouse on the screen.	
		var pos = findPos(this);
//		get x an y coords
		var x = e.pageX - pos.x;
		var y = e.pageY - pos.y;
//		get basic context
		var c = this.getContext('2d');
//		get imagedata from location of mouse
		var p = c.getImageData(x, y, 1, 1).data; 
//		parse the rgb data into hex.
		var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
//		make the cursor the same color as the hex color	
		$("#cursor").css("color",hex);
//		when the document is clicked and the mouse is on the canvas, get hex into js color		
		$("#canvas").on("click.picker",function(){
			if(mousehide){document.getElementById("jscolor_id").style.backgroundColor = hex;}})
		}//end if colorized
		}//end if mouse hide
    });//end mousemove toggled
	
    }); //ready