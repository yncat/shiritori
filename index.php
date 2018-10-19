<?php
if(file_exists("logs/count.dat")){
$num=sscanf(file_get_contents("logs/count.dat"),"%d");
}else{
$num=array(0);
}
?>
<html lang="ja">
<head>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<title> ポケモンしりとり </title>
<meta http-equiv="Content-Script-Type" content="text/javascript">
</head>
<body bgcolor="white" Text="black" 
Link="blue" Vlink="red" Alink="lime">
<h1>ポケモンしりとり</h1>
<p>
<a href="shiritori.html">ゲームを始める</a> (プレイ回数:
<?php
echo($num[0]);
?>
</p>

<hr>
<p>
<a href="help.html">説明を見る</a>　<a href="score.php">ランキングを見る</a>
</p>
</body>
</html>