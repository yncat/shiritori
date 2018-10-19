//shiritori main implementation
// Must be used with shiritori.html
var srCurrentWord = "";//current word
var srCurrentSelectionsNum = 0//How many selections are available
var srLevel = 0;// +1 when answered 1 correctly
var srChosen;//chosen? flags
var srDb;
var srNnUsed = false;//has nn been used?
var srScore = 0;//score
var xhr = new XMLHttpRequest();//request to count.php
//constants
const SRMAXSCORE = 50;//maximum score for each answer
//usable / not usable messages
const SRMSG_USABLE = "選択できます";
const SRMSG_NNUSABLE = "「ン」で終わる選択肢は1回だけ使用できます";
const SRMSG_ALREADYUSED = "すでに使用しました";
const SRMSG_NNALREADYUSED = "「ン」で終わる選択肢をすでに使用しました";
//Ingame messages
const SRUI_NNCONFIRM = "「ン」で終わる選択肢を選ぶと、次のお題はランダムに選ばれます。一度使うと、この戦略は使用できなくなります。選択してもいいですか？";
const SRUI_FIRSTRANDOMBEFORE="";
const SRUI_FIRSTRANDOMAFTER=" が、最初のお題に選ばれました。";
const SRUI_INSTRUCTIONBEFORE="「";
const SRUI_INSTRUCTIONAFTER="」から始まる言葉を答えてください。";
const SRUI_TABLECAPTION = "選択肢";
const SRUI_ROW_NAME = "名前";
const SRUI_ROW_USABLE = "選択";
const SRUI_ROW__DESCRIPTION = "説明";
const SRUI_CONGRATS="すごい！全てのお題を答え尽くしました！";
const SRUI_GAMEOVER="残念。選択肢がなくなってしまいました。ゲームオーバー！";
const SRUI_RESELECTBEFORE="";
const SRUI_RESELECTMIDDLE=" を使い、 ";
const SRUI_RESELECTAFTER=" が選び直されました。";
const SRUI_SELECTBEFORE="";
const SRUI_SELECTAFTER=" を選びました。";

window.onload = function () {
	srUpdateTable();
}

function srVerifyDb(db) {
	/* Checks if the db has enough words (10) */
	return db.length < 10;
}

function srStart(db) {
	/*
	Selects a random word and registers it along with the database reference.
	The database should not be modified after calling this function.
	The db must be checked by srVerifyDb prior to passing to this function.
	*/
	document.startForm.gameStartBTN.disabled = "true";
	xhr.open("GET", "count.php?count=0");
	xhr.send();
	srDb = db;
	srChosen = new Array(srDb.length);
	srNnUsed = false;
	srLevel = 1;
	srGetRandom();
	document.getElementById("scoreArea").innerHTML = "----";
	document.getElementById("messageArea").innerHTML = "1: " + SRUI_FIRSTRANDOMBEFORE + srCurrentWord + SRUI_FIRSTRANDOMAFTER;
	srUpdate();
}

function srGetRandom() {
	/*
	Gets a random element from the db.
	It sets answered flag.
	It doesn't select an nn-ending word.
	sets "" when nothing can be selected.
	*/
	var found = false;
	for (var i = 0; i < srDb.length; i++) {
		if (srGetLastChar(srDb[i]) != "ン" && srChosen[i] !== true) {
			found = true;
			break;
		}
	}
	if (!found) return "";
	while (true) {
		var r = Math.floor(Math.random() * srDb.length);
		if (srGetLastChar(srDb[r]) != "ン" && srChosen[r] !== true) {
			found = r;
			break;
		}
	}
	srCurrentWord = srDb[found];
	srChosen[found] = true;
}

function srUpdate() {
	if (srCurrentWord == "") {
		alert(SRUI_CONGRATS);
		gameover();
		return;
	}
	/*
	Updates instructions and table contents.
	srDB and srCurrentWord must be set properly prior to calling this function.
	*/
	srCurrentSelectionsNum = 0;
	var last = srGetLastChar(srCurrentWord);
	document.getElementById("instructionArea").innerHTML = SRUI_INSTRUCTIONBEFORE+ last + SRUI_INSTRUCTIONAFTER;
	var tableContents = "";
	for (var i = 0; i < srDb.length; i++) {
		if (srCheckValidity(last, i)) {
			var ret = srMakeTableEntry(i);
			tableContents += ret[0];
			if (ret[1] === true) srCurrentSelectionsNum++;
		}//if
	}//for
	srUpdateTable(tableContents);
	if (srCurrentSelectionsNum == 0) {
		alert(SRUI_GAMEOVER);
		gameover();
	}
}

function srGetLastChar(word) {
	/*
	Retrieves the last char from word.
	This function assumes UTF-16 binary without surrogate pairs.
	Currently it supports Katakana only (others would work, but auto correction doesn't do anything).
	"ー" is ignored.
	"ャュョァィゥェォ" are converted to "ヤユヨアイウエオ" respectively.
*/
	var ret;
	for (var i = word.length - 1; i >= 0; i--) {
		if (i == word.length - 1) {
			ret = word.substring(word.length - 1);
		} else {
			ret = word.substring(i, i + 1);
		}
		if (ret == "ー") continue;
		break;
	}//for
	if (ret == "ャ") ret = "ヤ";
	if (ret == "ュ") ret = "ユ";
	if (ret == "ョ") ret = "ヨ";
	if (ret == "ァ") ret = "ア";
	if (ret == "ィ") ret = "イ";
	if (ret == "ゥ") ret = "ウ";
	if (ret == "ェ") ret = "エ";
	if (ret == "ォ") ret = "オ";
	return ret;
}

function srGetFirstChar(word) {
	/* Retrieves the first char from word. This function doesn't expect the input starts with what needs to be auto corrected. */
	return word.substring(0, 1);
}

function srMakeTableEntry(index) {
	/*
	Makes a table entry of the specified db index. Returns an array containing the generated string as the first element and a boolean value representing the row is selectable as the second element.
	It doesn't check for duplicates.
	*/
	var out = "";
	out += "<tr>";
	var msg;
	var usable = srCheckUsability(index);
	if (usable[0] === true) {
		out += "<td><a href=\"javascript:srChoose(" + index + ")\">" + srDb[index] + "</a></td> ";
		out += "<td>○</td> ";
	} else {
		out += "<td>" + srDb[index] + "</td> ";
		out += "<td>×</td> ";
	}
	out += "<td>" + usable[1] + "</td> ";
	out += "</tr>";
	return new Array(out, usable[0]);
}

function srCheckUsability(index) {
	/* Checks if specified db index is usable in the current context. 
	srCurrentWord and srChosen must be properly set prior to calling this function.
	This function doesn't check the end / start connection validity; use srCheckValidity if required.
	*/
	var isnn = srGetLastChar(srDb[index]) == "ン";
	if (isnn) {
		if (srNnUsed) {
			return new Array(false, SRMSG_NNALREADYUSED);
		} else {
			return new Array(true, SRMSG_NNUSABLE);
		}
	}
	if (srChosen[index]) {
		return new Array(false, SRMSG_ALREADYUSED);
	} else {
		return new Array(true, SRMSG_USABLE);
	}
}

function srCheckValidity(last, index) {
	/* checks the end /start connection. last must be the last character retrieved by srGetLastChar. This is for reducing the number of srGetLastChar for same object. Index is the db index; not an actual string. */
	return last == srGetFirstChar(srDb[index]);
}

function srChoose(index) {
	/*
	Selects the specified index.
	It first does validity check. If the selection is invalid, returns immediately.
	*/
	if (!srCheckValidity(srGetLastChar(srCurrentWord), index)) return;
	var usable = srCheckUsability(index);
	if (usable[0] !== true) return;
	var nn = srGetLastChar(srDb[index]) == "ン";
	if (nn) {
		if (!confirm(SRUI_NNCONFIRM)) return;
	}
	srChosen[index] = true;
	var score = Math.floor(SRMAXSCORE / srCurrentSelectionsNum);
	if (score < 1) score = 1;
	srScore += score;
	document.getElementById("scoreArea").innerHTML = "スコア: +" + score + "(合計 " + srScore + ")";
	srCurrentWord = srDb[index];
	if (srGetLastChar(srDb[index]) == "ン") srNnUsed = true;
	srLevel++;
	if (nn) {
		srGetRandom();
		document.getElementById("messageArea").innerHTML = "" + srLevel + ": " + SRUI_RESELCTBEFORE + srDb[index] + SRUI_RESELECTMIDDLE + srCurrentWord + SRUI_RESELECTAFTER;
	} else {
		document.getElementById("messageArea").innerHTML = "" + srLevel + ": " + SRUI_SELECTBEFORE + srDb[index] + SRUI_SELECTAFTER;
	}
	srUpdate();
}

function srUpdateTable(contents = null) {
	/*
	Updates the table.
	If contents value is specified, appends it as well.
	It should have been better using createElement series functions, but meh.
	*/
	var c = "<table caption=\"" + SRUI_TABLECAPTION + "\">";
	c += "<tr> <th>" + SRUI_ROW_NAME + "</th> <th>" + SRUI_ROW_USABLE + "</th> <th>" + SRUI_ROW_DESCRIPTION + "</th> </tr>";
	if (contents != null) c += contents;
	c += "</table>";
	document.getElementById("tableArea").innerHTML = c;
}

function gameover() {
	document.getElementById("messageArea").innerHTML = "選べる選択肢がなくなりました。ゲームオーバー！";
	document.getElementById("instructionArea").innerHTML = "";
	document.startForm.gameStartBTN.disabled = "";
	srUpdateTable();
	createScorePost();
}

function createScorePost() {
	/* Generates score posting form. */
	if (srScore == 0) return;
	var ratio = srScore / srLevel;
	var info = "回答数" + srLevel + ", スコア効率" + ratio.toFixed(2);
	var scorePostText = "<hr>\n";
	scorePostText += "<h2>ランキングにエントリーできます</h2>\n";
	scorePostText += "<form action=\"score.php\" method=\"post\" name=\"scorePostForm\">\n";
	scorePostText += "<input type=\"hidden\" name=\"score\" value=\"" + srScore + "\">\n";
	scorePostText += "<input type=\"hidden\" name=\"info\" value=\"" + info + "\">\n";
	scorePostText += "<label><input type=\"text\" name=\"player\" maxlength=\"20\">名前</label>\n";
	scorePostText += "<input type=\"submit\" value=\"エントリー\" onclick=\"return checkInput();\">\n";
	scorePostText += "</form>\n";
	document.getElementById("scorePostArea").innerHTML = scorePostText;
}
function checkInput() {//名前が入力されてるか確認
	if (document.scorePostForm.player.value == "") {
		alert("エントリーしたい名前を入力してください。");
		return false;
	} else {
		return true;
	}
}

