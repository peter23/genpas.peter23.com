// (c) Peter <i@peter.am> 2011
// * This file may be distributed under the terms of the GNU General
// * Public License.

var rnd_data = '';
var max_rnd = 15000;
var max_rnd_1perc = max_rnd / 100;
var genpas_spec_symbols = '!"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~';

function eventHandler(e, isClick, type) {
	if(rnd_data.length >= max_rnd) {
		$(document).unbind('mousemove');
		$(document).unbind('click');
		$(document).unbind('keydown');
		setTimeout(entropy_done,1);
		return false;
	}
	if(type == 0) {
		rnd_data = rnd_data + e.pageX + e.pageY + e.clientX + e.clientY + $(document).height() + $(document).width() + isClick;
	} else if(type == 1) {
		rnd_data = rnd_data + e.keyCode;
	}
	$('#counter').text(Math.round(rnd_data.length/max_rnd_1perc) + '%');
}

function entropy_done() {
	var d = new Date();
	rnd_data = rnd_data + d.getTime();
	Math.seedrandom(rnd_data);
	$('#diventropy').hide('fast');
	$('#text').text('');
	$('#counter').text('');
	setTimeout(gen_pw2,1);
}

function start_capture() {
	$('#text').html('Перемещайте мышку, кликайте, нажимайте клавиши на клавиатуре,<br>изменяйте размеры окна браузера для генерации случайных данных.');
	$('#counter').text('0%');
	$('#diventropy').show('fast');
	var d = new Date();
	rnd_data = '' + d.getTime();
	$(document).mousemove(function(e){
		eventHandler(e, 0, 0);
	});
	$(document).click(function(e){
		eventHandler(e, 1, 0);
	});
	$(document).keydown(function(e){
		eventHandler(e, 1, 1);
	});
}


function htmlspecialchars(text) {
	var chars = Array("&", "<", ">", '"', "'");
	var replacements = Array("&amp;", "&lt;", "&gt;", "&quot;", "'");
	for (var i=0; i<chars.length; i++) {
		var re = new RegExp(chars[i], "gi");
		if(re.test(text)) {
			text = text.replace(re, replacements[i]);
		}
	}
	return text;
}

function gen_pw() {
	$('#genbutton').attr('disabled', 'disabled');
	$('#pass_cmnt').html('');
	$('#pass').hide();
	$('#pass').html('');
	if($('#use_entropy').attr('checked')) {
		start_capture();
	} else {
		gen_pw2();
	}
}

function gen_rand0() {
	var rand;
	if($('#use_entropy').attr('checked')) {
		rand = Math.random2();
	} else {
		rand = Math.random();
	}
	return rand;
}

function gen_rand(min, max) {
	return Math.floor(gen_rand0() * (max - min + 1)) + min;
}

function gen_pw2() {
	var pwlen = $('#pwlen').val();
	var pwnum = $('#pwnum').val();
	var symbols = '';
	if($('#az').attr('checked')) symbols = symbols + 'abcdefghijklmnopqrstuvwxyz';
	if($('#az2').attr('checked')) symbols = symbols + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	if($('#n09').attr('checked')) symbols = symbols + '1234567890';
	if($('#schr').attr('checked')) symbols = symbols + genpas_spec_symbols;
	if($('#skipamb').attr('checked')) {
		symbols = symbols.replace(new RegExp('[B8G6I1l\|0OQDS5Z2]','g'),'');
	}
	var symblen = symbols.length - 1;
	$('#pass_cmnt').html('Стойкость одного пароля: <i>'+Math.floor(Math.log(symblen)*(pwlen/Math.log(2)))
						+' bits</i><br>Стойкость всего списка паролей: <i>'+Math.floor(Math.log(symblen)*((pwlen*pwnum)/Math.log(2)))
						+' bits</i>');
	var f_fullrand = $('#fullrand').attr('checked');
	var f_pwgen = $('#pwgen').attr('checked');
	for(j=1;j<=pwnum;j++) {
		var pw = '';
		if(f_fullrand) {
			for(i=1;i<=pwlen;i++) {
				pw = pw + symbols.substr(gen_rand(0,symblen),1);
			}
		} else if(f_pwgen) {
			pw = pwgen_generate(pwlen, $('#az2').attr('checked'), $('#n09').attr('checked'), $('#schr').attr('checked'));
		}
		$('#pass').html($('#pass').html() + htmlspecialchars(pw) + '<br>');
	}
	$('#pass').fadeIn('fast');
	$('#genbutton').removeAttr('disabled');
}


$(function() {
	$('#genbutton').click(gen_pw);
	$('#fullrand').change(function() {$('#skipamb').removeAttr('disabled');});
	$('#pwgen').change(function() {$('#skipamb').attr('disabled', 'disabled'); $('#skipamb').removeAttr('checked');});
});