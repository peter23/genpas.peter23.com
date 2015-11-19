/* 
 * pwgen.js
 * 
 * (c) Peter <i@peter.am> 2011
 * Based on code of:
 * KATO Kazuyoshi <kzys@8-p.info>  http://8-p.info/pwgen/
 * Frank4DD  http://www.frank4dd.com/howto/various/pwgen.htm
 * 
 * This program is a JavaScript port of pwgen.
 * The original C source code written by Theodore Ts'o.
 * <http://sourceforge.net/projects/pwgen/>
 * 
 * This file may be distributed under the terms of the GNU General
 * Public License.
 */


var pwgen_CONSONANT = 1;
var pwgen_VOWEL = (1 << 1);
var pwgen_DIPTHONG = (1 << 2);
var pwgen_NOT_FIRST = (1 << 3);

var pwgen_ELEMENTS = [
	[ "a",  pwgen_VOWEL ],
	[ "ae", pwgen_VOWEL | pwgen_DIPTHONG ],
	[ "ah", pwgen_VOWEL | pwgen_DIPTHONG ],
	[ "ai", pwgen_VOWEL | pwgen_DIPTHONG ],
	[ "b",  pwgen_CONSONANT ],
	[ "c",  pwgen_CONSONANT ],
	[ "ch", pwgen_CONSONANT | pwgen_DIPTHONG ],
	[ "d",  pwgen_CONSONANT ],
	[ "e",  pwgen_VOWEL ],
	[ "ee", pwgen_VOWEL | pwgen_DIPTHONG ],
	[ "ei", pwgen_VOWEL | pwgen_DIPTHONG ],
	[ "f",  pwgen_CONSONANT ],
	[ "g",  pwgen_CONSONANT ],
	[ "gh", pwgen_CONSONANT | pwgen_DIPTHONG | pwgen_NOT_FIRST ],
	[ "h",  pwgen_CONSONANT ],
	[ "i",  pwgen_VOWEL ],
	[ "ie", pwgen_VOWEL | pwgen_DIPTHONG ],
	[ "j",  pwgen_CONSONANT ],
	[ "k",  pwgen_CONSONANT ],
	[ "l",  pwgen_CONSONANT ],
	[ "m",  pwgen_CONSONANT ],
	[ "n",  pwgen_CONSONANT ],
	[ "ng", pwgen_CONSONANT | pwgen_DIPTHONG | pwgen_NOT_FIRST ],
	[ "o",  pwgen_VOWEL ],
	[ "oh", pwgen_VOWEL | pwgen_DIPTHONG ],
	[ "oo", pwgen_VOWEL | pwgen_DIPTHONG],
	[ "p",  pwgen_CONSONANT ],
	[ "ph", pwgen_CONSONANT | pwgen_DIPTHONG ],
	[ "qu", pwgen_CONSONANT | pwgen_DIPTHONG],
	[ "r",  pwgen_CONSONANT ],
	[ "s",  pwgen_CONSONANT ],
	[ "sh", pwgen_CONSONANT | pwgen_DIPTHONG],
	[ "t",  pwgen_CONSONANT ],
	[ "th", pwgen_CONSONANT | pwgen_DIPTHONG],
	[ "u",  pwgen_VOWEL ],
	[ "v",  pwgen_CONSONANT ],
	[ "w",  pwgen_CONSONANT ],
	[ "x",  pwgen_CONSONANT ],
	[ "y",  pwgen_CONSONANT ],
	[ "z",  pwgen_CONSONANT ]
];


function pwgen_generate(pwlen, inc_capital, inc_number, inc_spec) {
	var result = null;
	
	while (! result)
		result = pwgen_generate0(pwlen, inc_capital, inc_number, inc_spec);
	
	return result;
}

function pwgen_generate0(pwlen, inc_capital, inc_number, inc_spec) {
	var result = "";
	var prev = 0;
	var isFirst = true;
	
	var shouldBe = (gen_rand0() < 0.5) ? pwgen_VOWEL : pwgen_CONSONANT;
	
	while (result.length < pwlen) {
		i = Math.floor((pwgen_ELEMENTS.length - 1) * gen_rand0());
		str = pwgen_ELEMENTS[i][0];
		flags = pwgen_ELEMENTS[i][1];
		
		/* Filter on the basic type of the next element */
		if ((flags & shouldBe) == 0) {
			continue;
		}
		/* Handle the NOT_FIRST flag */
		if (isFirst && (flags & pwgen_NOT_FIRST)) {
			continue;
		}
		/* Don't allow VOWEL followed a Vowel/Dipthong pair */
		if ((prev & pwgen_VOWEL) && (flags & pwgen_VOWEL) && (flags & pwgen_DIPTHONG)) {
			continue;
		}
		/* Don't allow us to overflow the buffer */
		if ( (result.length + str.length) > pwlen) {
			continue;
		}
		
		if (inc_capital) {
			if ((isFirst || (flags & pwgen_CONSONANT)) &&
				(gen_rand0() > 0.3)) {
				str = str.slice(0, 1).toUpperCase() + str.slice(1, str.length);
				inc_capital = false;
			}
		}
		
		/*
		 * OK, we found an element which matches our criteria,
		 * let's do it!
		 */
		result += str;
		
		if (inc_number) {
			if (!isFirst && (gen_rand0() < 0.3)) {
				if ( (result.length + str.length) > pwlen)
					result = result.slice(0,-1);
				result += Math.floor(10 * gen_rand0()).toString();
				inc_number = false;
				
				isFirst = true;
				prev = 0;
				shouldBe = (gen_rand0() < 0.5) ? pwgen_VOWEL : pwgen_CONSONANT;
				continue;
			}
		}
		
		if (inc_spec) {
			if (!isFirst && (gen_rand0() < 0.3)) {
				if ( (result.length + str.length) > pwlen)
					result = result.slice(0,-1);
				var possible = genpas_spec_symbols;
				result += possible.charAt(Math.floor(gen_rand0() * possible.length));
				inc_spec = false;
				
				isFirst = true;
				prev = 0;
				shouldBe = (gen_rand0() < 0.5) ? pwgen_VOWEL : pwgen_CONSONANT;
				continue;
			}
		}
		
		/*
		 * OK, figure out what the next element should be
		 */
		if (shouldBe == pwgen_CONSONANT) {
			shouldBe = pwgen_VOWEL;
		} else { /* should_be == VOWEL */
			if ((prev & pwgen_VOWEL) ||
				(flags & pwgen_DIPTHONG) || (gen_rand0() > 0.3)) {
				shouldBe = pwgen_CONSONANT;
			} else {
				shouldBe = pwgen_VOWEL;
			}
		}
		prev = flags;
		isFirst = false;
	}
	if (inc_capital || inc_number || inc_spec)
		return null;
	
	return result;
}
