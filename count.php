<?php
if(!isset($_REQUEST["count"])) die("Error : No parameter");
$slot=0;
if(file_exists("logs/count.dat")){
$num=sscanf(file_get_contents("logs/count.dat"),"%d");
}else{
$num=array(0);
}
$num[0]++;
$fp=fopen("logs/count.dat","w");
flock($fp,LOCK_EX);
fwrite($fp,sprintf("%d",$num[0]));
flock($fp,LOCK_UN);
fclose($fp);
die("OK");
?>
