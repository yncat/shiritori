<html lang="ja">
<head>
<meta http-equiv=Content-Type content="text/html; charset=utf-8">
<title> ランキング - ポケモンしりとり </title>
<meta http-equiv="Content-Script-Type" content="text/javascript">
</head>
<body bgcolor="white" Text="black" 
Link="blue" Vlink="red" Alink="lime">
<h1>スコアランキング</h1>


<?php
date_default_timezone_set('Asia/Tokyo'); 
// function to read the score file into an array.
//file format: name<>score<>time in gmt<>data
function read_scores($filename)
{
$array = array();
if (!file_exists($filename)) {
return $array;
}
$fp = fopen($filename, "r");
while (($line = fgets($fp)) !== false) {
$line = trim($line);
array_push($array, explode("<>", $line));
}
usort($array, 'cmp');
fclose($fp);
return $array;
} //read_scores
// comparison function. We want the highest score to go on top.
function cmp($a, $b)
{
if ($a[1] === $b[1]) {
//equal points, different times?
if ($a[2] === $b[2]) return 0;
return ($a[2] < $b[2]) ? 1 : -1;
} // equal points
return ($a[1] < $b[1]) ? 1 : -1;
} // cmp
if (isset($_REQUEST['game']) && !in_array($_REQUEST['game'], $gamenames)) {
echo "Error: invalid game\n";
exit;
}

//score submission
if (isset($_POST["info"]) && isset($_POST['score']) && isset($_POST['player'])) {
$scores = read_scores("logs/score_data.dat");
$_POST['player'] = str_Replace("<>", "", $_POST['player']);
$time = time(); //need this for tracking our score
array_push($scores, array($_POST['player'], $_POST['score'], $time, $_POST['info']));
usort($scores, 'cmp');
$scores = array_slice($scores, 0, 1000);
//rewrite the scores
$fp = fopen("logs/score_data.dat", "w");
if ($fp) {
flock($fp, LOCK_EX);
foreach ($scores as $score) {
$line = implode("<>", $score) . "\n";
fwrite($fp, $line);
}
flock($fp, LOCK_UN);
fclose($fp);
}
// Did we make the top score list?
$pos = 0; // no
$n=1;
foreach ($scores as $score) {
if ($score[2] == $time) {
$pos = $n;
break;
}
$n++;
}
if($n==0){
echo("<h2>結果:残念、ランク外でした。</h2>\r\n");
}else{
echo("<h2>結果:おめでとう、".$n."位にランクイン！</h2>\r\n");
}
} // submitted a score

//display the ranking
?>
<hr>
<?php
echo("<table border=\"1\" cellpadding=\"5\" cellspacing=\"0\" summary=\"ランキングテーブル\">\r\n");
echo("<tr><th>順位</th><th>プレイヤー名</th><th>得点</th><th>情報</th><th>日時</th></tr>\n");
$scores = read_scores("logs/score_data.dat");
usort($scores, 'cmp');
$n = 1;
foreach ($scores as $score) {
$date = date("Y-m-d H:i:s", $score[2]);
if($n<=1000){
$out = "<tr><td>$n</td><td>$score[0]</td><td>$score[1]</td><td>$score[3]</td><td>$date</td></tr>";
echo "$out\n";
}
$n++;
}
echo("</table>\n");
?>
<hr>
<a href="index.php">メニューに戻る</a>
</body>
</html>
