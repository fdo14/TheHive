<?php
session_start ();
function loginForm() {
	echo '
    <div id="loginform">
	<span style="width: 100%; text-align: left; margin-left: 10px; margin-top: 10px" class="glyphicon glyphicon-chevron-left"></span>
	<br>
	<img src="assets/img/logo.png" class="logo"></img>
    <form action="index.php" method="post">

        <label for="name">Name:</label>
        <input type="text" name="name" id="name" style="padding-left:5px"/>
        <input type="submit" name="enter" id="enter" value="Enter" />
    </form>
    </div>
    ';
}

if (isset ( $_POST ['enter'] )) {
	if ($_POST ['name'] != "") {
		$_SESSION ['name'] = stripslashes ( htmlspecialchars ( $_POST ['name'] ) );
		$fp = fopen ( "log.html", 'a' );
		fwrite ( $fp, "<div class='msgln loginMsg' style='margin-bottom: 8px'>" . $_SESSION ['name'] . " is here to chat.<br></div>" );
		fclose ( $fp );
	} else {
		echo '<span class="error">Please type in a name</span>';
	}
}


?>

<head>
<title>The Hive. - Connect!</title>
<link rel="stylesheet" href="assets/css/style.css">
<link href="assets/css/bootstrap.min.css" rel="stylesheet"/>
<link rel="icon" href="/../img/icon.png">
<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no, width=device-width">
</head>

<body style="background-color:#494A4A; overflow:hidden">

<div class="outer">
  	<div class="middle">
	
	<?php
	if (! isset ( $_SESSION ['name'] )) {
		loginForm ();
	} else {
		?>
<div id="wrapper">
		<div id="menu">
			<br>
			<p class="welcome">
				Welcome, <b><?php echo $_SESSION['name']; ?></b>
			</p>
			<p class="exit"><a href="/"><span class="glyphicon glyphicon-chevron-left"></span></a></p>
			<div style="clear: both"></div>
		</div>
		<hr></hr>
		<div id="chatbox"><?php
		if (file_exists ( "log.html" ) && filesize ( "log.html" ) > 0) {
			$handle = fopen ( "log.html", "r" );
			$contents = fread ( $handle, filesize ( "log.html" ) );
			fclose ( $handle );

			echo $contents;
		}
		?></div>

		<form name="message" action="">
			<input name="usermsg" type="text" id="usermsg" size="63" /> <input
				name="submitmsg" type="submit" id="submitmsg" value="Send" />
		</form>
	</div>
</div>
</div>

	<script type="text/javascript"
		src="assets/js/jquery.min.js"></script>
	<script type="text/javascript">
// jQuery Document
$(document).ready(function(){
});


//If user submits the form
$("#submitmsg").click(function(){
		var clientmsg = $("#usermsg").val();
		if(clientmsg){
			$.post("post.php", {text: clientmsg});
			$("#usermsg").attr("value", "");
			loadLog;
			
		} else if(clientmsg === ""){
			
		}
		return false;
});

function loadLog(){
	var oldscrollHeight = $("#chatbox").attr("scrollHeight") - 20; //Scroll height before the request
	$.ajax({
		url: "log.html",
		cache: false,
		success: function(html){
			$("#chatbox").html(html); //Insert chat log into the #chatbox div

			//Auto-scroll
			var newscrollHeight = $("#chatbox").attr("scrollHeight") - 20; //Scroll height after the request
			if(newscrollHeight > oldscrollHeight){
				$("#chatbox").animate({ scrollTop: newscrollHeight }, 'normal'); //Autoscroll to bottom of div
			}
	  	},
	});
}

setInterval (loadLog, 1000);
</script>
<?php
	}
	?>
</body>
</html>
