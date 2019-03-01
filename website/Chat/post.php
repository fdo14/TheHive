<?php
session_start();
date_default_timezone_set("America/New_York");
if(isset($_SESSION['name'])){
    $text = $_POST['text'];

    $fp = fopen("log.html", 'a');
    fwrite($fp, "<div class='msgln' style='padding-bottom: 8px'> <b>".$_SESSION['name']."</b>: ".stripslashes(htmlspecialchars($text))."<br></div>");
    fclose($fp);
}
//(".date("h:i:sa").")
?>
