import { outputFilters, inputFilters } from "../../src/filter/Builtin.js";

if (Array.prototype.toReversed === undefined) {
  Array.prototype.toReversed = function () {
    const retArray = this.slice();
    retArray.reverse();
    return retArray;
  }
}

if (Array.prototype.toSorted === undefined) {
  Array.prototype.toSorted = function () {
    const retArray = this.slice();
    retArray.sort();
    return retArray;
  }
}

if (Array.prototype.toSpliced === undefined) {
  Array.prototype.toSpliced = function (...args) {
    const retArray = this.slice();
    retArray.splice(...args);
    return retArray;
  }
}

if (Array.prototype.with === undefined) {
  Array.prototype.with = function (...args) {
    const retArray = this.slice();
    retArray[args[0]] = args[1];
    return retArray;
  }
}

test("Builtin outputFilters", () => {
  expect(outputFilters.styleDisplay(true, [])).toBe("");
  expect(outputFilters.styleDisplay(false, [])).toBe("none");
  expect(outputFilters.styleDisplay(true, ["block"])).toBe("block");

  expect(outputFilters.truthy(true, [])).toBe(true);
  expect(outputFilters.truthy(false, [])).toBe(false);

  expect(outputFilters.falsey(true, [])).toBe(false);
  expect(outputFilters.falsey(false, [])).toBe(true);

  expect(outputFilters.not(true, [])).toBe(false);
  expect(outputFilters.not(false, [])).toBe(true);

  expect(outputFilters.eq("100", ["100"])).toBe(true);
  expect(outputFilters.eq(100, [100])).toBe(true);
  expect(outputFilters.eq("100", [100])).toBe(true);
  expect(outputFilters.eq(100, ["100"])).toBe(true);
  expect(outputFilters.eq(100, [101])).toBe(false);

  expect(outputFilters.ne("100", ["100"])).toBe(false);
  expect(outputFilters.ne(100, [100])).toBe(false);
  expect(outputFilters.ne("100", [100])).toBe(false);
  expect(outputFilters.ne(100, ["100"])).toBe(false);
  expect(outputFilters.ne(100, [101])).toBe(true);

  expect(outputFilters.lt("100", ["101"])).toBe(true);
  expect(outputFilters.lt(100, [101])).toBe(true);
  expect(outputFilters.lt("100", [101])).toBe(true);
  expect(outputFilters.lt(100, ["101"])).toBe(true);
  expect(outputFilters.lt(100, [100])).toBe(false);

  expect(outputFilters.le("100", ["100"])).toBe(true);
  expect(outputFilters.le(100, [100])).toBe(true);
  expect(outputFilters.le("100", [100])).toBe(true);
  expect(outputFilters.le(100, ["100"])).toBe(true);
  expect(outputFilters.le(100, [99])).toBe(false);

  expect(outputFilters.gt("101", ["100"])).toBe(true);
  expect(outputFilters.gt(101, [100])).toBe(true);
  expect(outputFilters.gt("101", [100])).toBe(true);
  expect(outputFilters.gt(101, ["100"])).toBe(true);
  expect(outputFilters.gt(100, [100])).toBe(false);

  expect(outputFilters.ge("100", ["100"])).toBe(true);
  expect(outputFilters.ge(100, [100])).toBe(true);
  expect(outputFilters.ge("100", [100])).toBe(true);
  expect(outputFilters.ge(100, ["100"])).toBe(true);
  expect(outputFilters.ge(99, [100])).toBe(false);

  expect(outputFilters.embed("aaa", ["message is %s"])).toBe("message is aaa");
  expect(outputFilters.embed("aaa", [])).toBe("");
  expect(outputFilters.embed(null, [])).toBe(null);

  expect(outputFilters.ifText(true, ["aaaa", "bbbb"])).toBe("aaaa");
  expect(outputFilters.ifText(false, ["aaaa", "bbbb"])).toBe("bbbb");
  expect(outputFilters.ifText(true, [])).toBe(null);
  expect(outputFilters.ifText(false, [])).toBe(null);

  expect(outputFilters.null(null, [])).toBe(true);
  expect(outputFilters.null(true, [])).toBe(false);

});

test("Builtin outputFilters string", () => {
  expect(outputFilters["str.at"](null, [])).toBe(null);
  expect(outputFilters["str.at"]("The quick brown fox jumps over the lazy dog.", [5])).toBe("u");
  expect(outputFilters["str.at"]("The quick brown fox jumps over the lazy dog.", [-4])).toBe("d");
  expect(outputFilters["str.at"]("The quick brown fox jumps over the lazy dog.", [])).toBe("T");
  
  expect(outputFilters["str.charAt"](null, [])).toBe(null);
  expect(outputFilters["str.charAt"]("The quick brown fox jumps over the lazy dog.", [4])).toBe("q");
  expect(outputFilters["str.charAt"]("あいうえお", [0])).toBe("あ");
  expect(outputFilters["str.charAt"]("あいうえお", [])).toBe("あ");
  expect(outputFilters["str.charAt"]("あいうえお", [4])).toBe("お");
  expect(outputFilters["str.charAt"]("あいうえお", [-1])).toBe("");
  
  expect(outputFilters["str.charCodeAt"](null, [])).toBe(null);
  expect(outputFilters["str.charCodeAt"]("The quick brown fox jumps over the lazy dog.", [4])).toBe(113);
  expect(outputFilters["str.charCodeAt"]("あいうえお", [0])).toBe(0x3042);
  expect(outputFilters["str.charCodeAt"]("あいうえお", [])).toBe(0x3042);
  expect(outputFilters["str.charCodeAt"]("あいうえお", [4])).toBe(0x304a);
  expect(outputFilters["str.charCodeAt"]("あいうえお", [-1])).toBe(NaN);

  expect(outputFilters["str.codePointAt"](null, [])).toBe(null);
  expect(outputFilters["str.codePointAt"]("あいうえお", [0])).toBe(0x3042);
  expect(outputFilters["str.codePointAt"]("あいうえお", [])).toBe(0x3042);
  expect(outputFilters["str.codePointAt"]("あいうえお", [4])).toBe(0x304a);
  expect(outputFilters["str.codePointAt"]("あいうえお", [-1])).toBe(undefined);

  expect(outputFilters["str.concat"](null, [])).toBe(null);
  expect(outputFilters["str.concat"]("The quick brown fox jumps over the lazy dog.", ["ok"])).toBe("The quick brown fox jumps over the lazy dog.ok");
  expect(outputFilters["str.concat"]("The quick brown fox jumps over the lazy dog.", [])).toBe("The quick brown fox jumps over the lazy dog.");

  expect(outputFilters["str.endsWith"](null, [])).toBe(null);
  expect(outputFilters["str.endsWith"]("To be, or not to be, that is the question.", ["question."])).toBe(true);
  expect(outputFilters["str.endsWith"]("To be, or not to be, that is the question.", ["to be"])).toBe(false);
  expect(outputFilters["str.endsWith"]("To be, or not to be, that is the question.", ["to be", 19])).toBe(true);
  
  expect(outputFilters["str.includes"](null, [])).toBe(null);
  expect(outputFilters["str.includes"]("To be, or not to be, that is the question.", ["To be"])).toBe(true);
  expect(outputFilters["str.includes"]("To be, or not to be, that is the question.", ["question"])).toBe(true);
  expect(outputFilters["str.includes"]("To be, or not to be, that is the question.", ["nonexistent"])).toBe(false);
  expect(outputFilters["str.includes"]("To be, or not to be, that is the question.", ["To be", 1])).toBe(false);
  expect(outputFilters["str.includes"]("To be, or not to be, that is the question.", ["TO BE"])).toBe(false);
  expect(outputFilters["str.includes"]("To be, or not to be, that is the question.", [""])).toBe(true);
  
  expect(outputFilters["str.indexOf"](null, [])).toBe(null);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["Blue"])).toBe(0);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["Blue"])).toBe(0);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["Blute"])).toBe(-1);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["Whale", 0])).toBe(5);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["Whale", 5])).toBe(5);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["Whale", 7])).toBe(-1);
  expect(outputFilters["str.indexOf"]("Blue Whale", [""])).toBe(0);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["", 9])).toBe(9);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["", 10])).toBe(10);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["", 11])).toBe(10);
  expect(outputFilters["str.indexOf"]("Blue Whale", ["blue"])).toBe(-1);
  
/*
  expect(outputFilters.isWellFormed(null, [])).toBe(null);
  expect(outputFilters.isWellFormed("ab\uD800", [])).toBe(false);
  expect(outputFilters.isWellFormed("ab\uD800c", [])).toBe(false);
  expect(outputFilters.isWellFormed("\uDFFFab", [])).toBe(false);
  expect(outputFilters.isWellFormed("c\uDFFFab", [])).toBe(false);
  expect(outputFilters.isWellFormed("abc", [])).toBe(true);
  expect(outputFilters.isWellFormed("ab\uD83D\uDE04c", [])).toBe(true);
*/

  expect(outputFilters["str.lastIndexOf"](null, [])).toBe(null);
  expect(outputFilters["str.lastIndexOf"]("canal", ["a"])).toBe(3);
  expect(outputFilters["str.lastIndexOf"]("canal", ["a", 2])).toBe(1);
  expect(outputFilters["str.lastIndexOf"]("canal", ["a", 0])).toBe(-1);
  expect(outputFilters["str.lastIndexOf"]("canal", ["x"])).toBe(-1);
  expect(outputFilters["str.lastIndexOf"]("canal", ["c", -5])).toBe(0);
  expect(outputFilters["str.lastIndexOf"]("canal", ["c", 0])).toBe(0);
  expect(outputFilters["str.lastIndexOf"]("canal", [""])).toBe(5);
  expect(outputFilters["str.lastIndexOf"]("canal", ["", 2])).toBe(2);
  expect(outputFilters["str.lastIndexOf"]("Blue Whale, Killer Whale", ["blue"])).toBe(-1);

  expect(outputFilters["str.localeCompare"](null, [])).toBe(null);
  let ret = outputFilters["str.localeCompare"]("ä", ["z", "de"]); // a negative value: in German, ä sorts before z
  expect(ret < 0).toBe(true);
  ret = outputFilters["str.localeCompare"]("ä", ["z", "sv"]); // a positive value: in Swedish, ä sorts after z
  expect(ret > 0).toBe(true);

  JSON.stringify()
  expect(outputFilters["str.match"](null, [])).toBe(null);
  expect(JSON.stringify(outputFilters["str.match"]("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", ["number"]))).toBe(JSON.stringify(["number"]));
  expect(JSON.stringify(outputFilters["str.match"]("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", [NaN]))).toBe(JSON.stringify(["NaN"]));
  expect(JSON.stringify(outputFilters["str.match"]("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", [Infinity]))).toBe(JSON.stringify(["Infinity"]));
  expect(JSON.stringify(outputFilters["str.match"]("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", [+Infinity]))).toBe(JSON.stringify(["Infinity"]));
  expect(JSON.stringify(outputFilters["str.match"]("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", [-Infinity]))).toBe(JSON.stringify(["-Infinity"]));
  expect(JSON.stringify(outputFilters["str.match"]("My grandfather is 65 years old and My grandmother is 63 years old.", [65]))).toBe(JSON.stringify(["65"]));
  expect(JSON.stringify(outputFilters["str.match"]("My grandfather is 65 years old and My grandmother is 63 years old.", [+65]))).toBe(JSON.stringify(["65"]));
  expect(JSON.stringify(outputFilters["str.match"]("The contract was declared null and void.", [null]))).toBe(JSON.stringify(["null"]));
  expect(JSON.stringify(outputFilters["str.match"]("123", ["1.3"]))).toBe(JSON.stringify(["123"]));
  expect(outputFilters["str.match"]("123", ["1\\.3"])).toBe(null);

  //expect(outputFilters["str.matchAll"](null, [])).toBe(null);

  expect(outputFilters["str.normalize"](null, [])).toBe(null);
  expect(outputFilters["str.normalize"]('\u0041\u006d\u00e9\u006c\u0069\u0065', ["NFC"])).toBe(outputFilters["str.normalize"]('\u0041\u006d\u0065\u0301\u006c\u0069\u0065', ["NFC"]));

  expect(outputFilters["str.padEnd"](null, [])).toBe(null);
  expect(outputFilters["str.padEnd"]("abc", [10])).toBe("abc       ");
  expect(outputFilters["str.padEnd"]("abc", [10, "foo"])).toBe("abcfoofoof");
  expect(outputFilters["str.padEnd"]("abc", [6, 123456])).toBe("abc123");
  expect(outputFilters["str.padEnd"]("abc", [1])).toBe("abc");

  expect(outputFilters["str.padStart"](null, [])).toBe(null);
  expect(outputFilters["str.padStart"]("abc", [10])).toBe("       abc");
  expect(outputFilters["str.padStart"]("abc", [10, "foo"])).toBe("foofoofabc");
  expect(outputFilters["str.padStart"]("abc", [6, "123456"])).toBe("123abc");
  expect(outputFilters["str.padStart"]("abc", [8, "0"])).toBe("00000abc");
  expect(outputFilters["str.padStart"]("abc", [1])).toBe("abc");
  
  expect(outputFilters["str.repeat"](null, [])).toBe(null);
  expect(() => outputFilters["str.repeat"]("abc", [-1])).toThrow("Invalid count value");
  expect(outputFilters["str.repeat"]("abc", [0])).toBe('');
  expect(outputFilters["str.repeat"]("abc", [1])).toBe('abc');
  expect(outputFilters["str.repeat"]("abc", [2])).toBe('abcabc');
  expect(outputFilters["str.repeat"]("abc", [3.5])).toBe('abcabcabc');
  expect(() => outputFilters["str.repeat"]("abc", [1/0])).toThrow("Invalid count value");

  expect(outputFilters["str.replace"](null, [])).toBe(null);
  expect(outputFilters["str.replace"]("xxx", ["", "_"])).toBe("_xxx");
  expect(outputFilters["str.replace"]("The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?", ["dog", "monkey"])).toBe("The quick brown fox jumps over the lazy monkey. If the dog reacted, was it really lazy?");

  expect(outputFilters["str.replaceAll"](null, [])).toBe(null);
  expect(outputFilters["str.replaceAll"]("xxx", ["", "_"])).toBe("_x_x_x_");
  expect(outputFilters["str.replaceAll"]("The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?", ["dog", "monkey"])).toBe("The quick brown fox jumps over the lazy monkey. If the monkey reacted, was it really lazy?");

  expect(outputFilters["str.search"](null, [])).toBe(null);
  expect(outputFilters["str.search"]('The quick brown fox jumps over the lazy dog. If the dog barked, was it really lazy?', ["quick"])).toBe(4);
  
  expect(outputFilters["str.slice"](null, [])).toBe(null);
  expect(outputFilters["str.slice"]('The quick brown fox jumps over the lazy dog.', [31])).toBe("the lazy dog.");
  expect(outputFilters["str.slice"]('The quick brown fox jumps over the lazy dog.', [4, 19])).toBe("quick brown fox");
  expect(outputFilters["str.slice"]('The quick brown fox jumps over the lazy dog.', [-4])).toBe("dog.");
  expect(outputFilters["str.slice"]('The quick brown fox jumps over the lazy dog.', [-9, -5])).toBe("lazy");

  expect(outputFilters["str.split"](null, [])).toBe(null);
  expect(outputFilters["str.split"]("The quick brown", [" "])).toEqual(["The", "quick", "brown"]);
  expect(outputFilters["str.split"]("The quick brown", [""])).toEqual(["T", "h", "e", " ", "q", "u", "i", "c", "k", " ", "b", "r", "o", "w", "n"]);
  expect(outputFilters["str.split"]("The quick brown", [])).toEqual(["The quick brown"]);

  expect(outputFilters["str.startsWith"](null, [])).toBe(null);
  expect(outputFilters["str.startsWith"]("To be, or not to be, that is the question.", ["To be"])).toBe(true);
  expect(outputFilters["str.startsWith"]("To be, or not to be, that is the question.", ["not to be"])).toBe(false);
  expect(outputFilters["str.startsWith"]("To be, or not to be, that is the question.", ["not to be", 10])).toBe(true);

  expect(outputFilters["str.substring"](null, [])).toBe(null);
  expect(outputFilters["str.substring"]("Mozilla", [0, 1])).toBe("M");
  expect(outputFilters["str.substring"]("Mozilla", [1, 0])).toBe("M");
  expect(outputFilters["str.substring"]("Mozilla", [0, 6])).toBe("Mozill");
  expect(outputFilters["str.substring"]("Mozilla", [4])).toBe("lla");
  expect(outputFilters["str.substring"]("Mozilla", [4, 7])).toBe("lla");
  expect(outputFilters["str.substring"]("Mozilla", [7, 4])).toBe("lla");
  expect(outputFilters["str.substring"]("Mozilla", [0, 7])).toBe("Mozilla");
  expect(outputFilters["str.substring"]("Mozilla", [0, 10])).toBe("Mozilla");

  expect(outputFilters["str.toLocaleLowerCase"](null, [])).toBe(null);
  expect(outputFilters["str.toLocaleLowerCase"]("İstanbul", ['en-US'])).toBe("i̇stanbul");
  expect(outputFilters["str.toLocaleLowerCase"]("İstanbul", ['tr'])).toBe("istanbul");

  expect(outputFilters["str.toLocaleUpperCase"](null, [])).toBe(null);
  expect(outputFilters["str.toLocaleUpperCase"]("istanbul", ['en-US'])).toBe("ISTANBUL");
  expect(outputFilters["str.toLocaleUpperCase"]("istanbul", ['TR'])).toBe("İSTANBUL");

  expect(outputFilters["str.toLowerCase"](null, [])).toBe(null);
  expect(outputFilters["str.toLowerCase"]("ALPHABET", [])).toBe("alphabet");

  expect(outputFilters["str.toUpperCase"](null, [])).toBe(null);
  expect(outputFilters["str.toUpperCase"]("alphabet", [])).toBe("ALPHABET");

//  expect(outputFilters["str.toWellFormed"](null, [])).toBe(null);

  expect(outputFilters["str.trim"](null, [])).toBe(null);
  expect(outputFilters["str.trim"]('   Hello world!   ', [])).toBe('Hello world!');

  expect(outputFilters["str.trimEnd"](null, [])).toBe(null);
  expect(outputFilters["str.trimEnd"]('   Hello world!   ', [])).toBe('   Hello world!');

  expect(outputFilters["str.trimStart"](null, [])).toBe(null);
  expect(outputFilters["str.trimStart"]('   Hello world!   ', [])).toBe('Hello world!   ');

});

test("Builtin outputFilters number", () => {
  expect(outputFilters["num.toExponential"](null, [])).toBe(null);
  expect(outputFilters["num.toExponential"](123456, [])).toBe("1.23456e+5");
  expect(outputFilters["num.toExponential"](123456, [2])).toBe("1.23e+5");
  expect(outputFilters["num.toExponential"]("abc", [])).toBe("abc");

  expect(outputFilters["num.toFixed"](null, [])).toBe(null);
  expect(outputFilters["num.toFixed"](10, [])).toBe("10");
  expect(outputFilters["num.toFixed"](10, [2])).toBe("10.00");
  expect(outputFilters["num.toFixed"]("abc", [])).toBe("abc");

  expect(outputFilters["num.toLocaleString"](null, [])).toBe(null);
  expect(outputFilters["num.toLocaleString"](100, [])).toBe("100");
  expect(outputFilters["num.toLocaleString"](1000, [])).toBe("1,000");
  expect(outputFilters["num.toLocaleString"]("abc", [])).toBe("abc");

  expect(outputFilters["num.toPrecision"](null, [])).toBe(null);
  expect(outputFilters["num.toPrecision"](5.123456, [])).toBe('5.123456');
  expect(outputFilters["num.toPrecision"](5.123456, [5])).toBe('5.1235');
  expect(outputFilters["num.toPrecision"](5.123456, [2])).toBe('5.1');
  expect(outputFilters["num.toPrecision"](5.123456, [1])).toBe('5');
  expect(outputFilters["num.toPrecision"](0.000123, [])).toBe('0.000123');
  expect(outputFilters["num.toPrecision"](0.000123, [5])).toBe('0.00012300');
  expect(outputFilters["num.toPrecision"](0.000123, [2])).toBe('0.00012');
  expect(outputFilters["num.toPrecision"](0.000123, [1])).toBe('0.0001');
  expect(outputFilters["num.toPrecision"](1234.5, [2])).toBe('1.2e+3');
  
});

test("Builtin outputFilters array", () => {
  expect(outputFilters["arr.at"](null, [])).toBe(null);
  expect(outputFilters["arr.at"]([5, 12, 8, 130, 44], [2])).toBe(8);
  expect(outputFilters["arr.at"]([5, 12, 8, 130, 44], [-2])).toBe(130);
  
  expect(outputFilters["arr.concat"](null, [])).toBe(null);
  expect(outputFilters["arr.concat"]([5, 12, 8, 130, 44], [2])).toEqual([5, 12, 8, 130, 44, 2]);
  expect(outputFilters["arr.concat"]([5, 12, 8, 130, 44], [2, 3])).toEqual([5, 12, 8, 130, 44, 2, 3]);

  expect(outputFilters["arr.copyWithin"](null, [])).toBe(null);
  expect(outputFilters["arr.copyWithin"]([1, 2, 3, 4, 5], [-2])).toEqual([1, 2, 3, 1, 2]);
  expect(outputFilters["arr.copyWithin"]([1, 2, 3, 4, 5], [0, 3])).toEqual([4, 5, 3, 4, 5]);
  expect(outputFilters["arr.copyWithin"]([1, 2, 3, 4, 5], [0, 3, 4])).toEqual([4, 2, 3, 4, 5]);
  expect(outputFilters["arr.copyWithin"]([1, 2, 3, 4, 5], [-2, -3, -1])).toEqual([1, 2, 3, 3, 4]);

  expect(outputFilters["arr.entries"](null, [])).toBe(null);
  expect(Array.from(outputFilters["arr.entries"](["a", "b", "c"], []))).toEqual([[0, "a"], [1, "b"], [2, "c"]]);

  expect(outputFilters["arr.fill"](null, [])).toBe(null);
  expect(outputFilters["arr.fill"]([1, 2, 3, 4], [0, 2, 4])).toEqual([1, 2, 0, 0]);
  expect(outputFilters["arr.fill"]([1, 2, 3, 4], [5, 1])).toEqual([1, 5, 5, 5]);
  expect(outputFilters["arr.fill"]([1, 2, 3, 4], [6])).toEqual([6, 6, 6, 6]);
  
  expect(outputFilters["arr.flat"](null, [])).toBe(null);
  expect(outputFilters["arr.flat"]([0, 1, 2, [3, 4]], [])).toEqual([0, 1, 2, 3, 4]);
  expect(outputFilters["arr.flat"]([0, 1, 2, [[[3, 4]]]], [2])).toEqual([0, 1, 2, [3, 4]]);

  expect(outputFilters["arr.includes"](null, [])).toBe(null);
  expect(outputFilters["arr.includes"]([1, 2, 3], [2])).toBe(true);
  expect(outputFilters["arr.includes"](['cat', 'dog', 'bat'], ["cat"])).toBe(true);
  expect(outputFilters["arr.includes"](['cat', 'dog', 'bat'], ["at"])).toBe(false);

  expect(outputFilters["arr.indexOf"](null, [])).toBe(null);
  expect(outputFilters["arr.indexOf"](['ant', 'bison', 'camel', 'duck', 'bison'], ['bison'])).toBe(1);
  expect(outputFilters["arr.indexOf"](['ant', 'bison', 'camel', 'duck', 'bison'], ['bison', 2])).toBe(4);
  expect(outputFilters["arr.indexOf"](['ant', 'bison', 'camel', 'duck', 'bison'], ['giraffe'])).toBe(-1);

  expect(outputFilters["arr.join"](null, [])).toBe(null);
  expect(outputFilters["arr.join"](['Fire', 'Air', 'Water'], [])).toBe("Fire,Air,Water");
  expect(outputFilters["arr.join"](['Fire', 'Air', 'Water'], [""])).toBe("FireAirWater");
  expect(outputFilters["arr.join"](['Fire', 'Air', 'Water'], ["-"])).toBe("Fire-Air-Water");
  
  expect(outputFilters["arr.keys"](null, [])).toBe(null);
  expect(Array.from(outputFilters["arr.keys"](['a', 'b', 'c'], []))).toEqual([0, 1, 2]);
 
  expect(outputFilters["arr.lastIndexOf"](null, [])).toBe(null);
  expect(outputFilters["arr.lastIndexOf"](['Dodo', 'Tiger', 'Penguin', 'Dodo'], ['Dodo'])).toBe(3);
  expect(outputFilters["arr.lastIndexOf"](['Dodo', 'Tiger', 'Penguin', 'Dodo'], ['Tiger'])).toBe(1);

  expect(outputFilters["arr.slice"](null, [])).toBe(null);
  expect(outputFilters["arr.slice"](['ant', 'bison', 'camel', 'duck', 'elephant'], [2])).toEqual(["camel", "duck", "elephant"]);
  expect(outputFilters["arr.slice"](['ant', 'bison', 'camel', 'duck', 'elephant'], [2, 4])).toEqual(["camel", "duck"]);
  expect(outputFilters["arr.slice"](['ant', 'bison', 'camel', 'duck', 'elephant'], [1, 5])).toEqual(["bison", "camel", "duck", "elephant"]);
  expect(outputFilters["arr.slice"](['ant', 'bison', 'camel', 'duck', 'elephant'], [-2])).toEqual(["duck", "elephant"]);
  expect(outputFilters["arr.slice"](['ant', 'bison', 'camel', 'duck', 'elephant'], [2, -1])).toEqual(["camel", "duck"]);
  expect(outputFilters["arr.slice"](['ant', 'bison', 'camel', 'duck', 'elephant'], [])).toEqual(["ant", "bison", "camel", "duck", "elephant"]);

  expect(outputFilters["arr.toLocaleString"](null, [])).toBe(null);
  expect(outputFilters["arr.toLocaleString"]([1000], [])).toEqual("1,000");

  expect(outputFilters["arr.toReversed"](null, [])).toBe(null);
  expect(outputFilters["arr.toReversed"]([1, 5, 4, 2], [])).toEqual([2, 4, 5, 1]);

  expect(outputFilters["arr.toSorted"](null, [])).toBe(null);
  expect(outputFilters["arr.toSorted"]([1, 5, 4, 2], [])).toEqual([1, 2, 4, 5]);

  expect(outputFilters["arr.toSpliced"](null, [])).toBe(null);
  expect(outputFilters["arr.toSpliced"](["Jan", "Mar", "Apr", "May"], [1, 0, "Feb"])).toEqual(["Jan", "Feb", "Mar", "Apr", "May"]);
  expect(outputFilters["arr.toSpliced"](["Jan", "Feb", "Mar", "Apr", "May"], [2, 2])).toEqual(["Jan", "Feb", "May"]);
  expect(outputFilters["arr.toSpliced"](["Jan", "Feb", "May"], [1, 1, "Feb", "Mar"])).toEqual(["Jan", "Feb", "Mar", "May"]);

  expect(outputFilters["arr.values"](null, [])).toBe(null);
  expect(Array.from(outputFilters["arr.values"](['a', 'b', 'c'], []))).toEqual(['a', 'b', 'c']);

  expect(outputFilters["arr.with"](null, [])).toBe(null);
  expect(outputFilters["arr.with"]([1, 2, 3, 4, 5], [2, 6])).toEqual([1, 2, 6, 4, 5]  );
});

test("Builtin outputFilters namespace", () => {
  expect(outputFilters.at(null, [])).toBe(null);
  expect(outputFilters.at([5, 12, 8, 130, 44], [2])).toBe(8);
  expect(outputFilters.at([5, 12, 8, 130, 44], [-2])).toBe(130);
  expect(outputFilters.at("The quick brown fox jumps over the lazy dog.", [5])).toBe("u");
  expect(outputFilters.at("The quick brown fox jumps over the lazy dog.", [-4])).toBe("d");
  expect(outputFilters.at("The quick brown fox jumps over the lazy dog.", [])).toBe("T");

  expect(outputFilters.charAt(null, [])).toBe(null);
  expect(outputFilters.charAt("The quick brown fox jumps over the lazy dog.", [4])).toBe("q");
  expect(outputFilters.charAt("あいうえお", [0])).toBe("あ");
  expect(outputFilters.charAt("あいうえお", [])).toBe("あ");
  expect(outputFilters.charAt("あいうえお", [4])).toBe("お");
  expect(outputFilters.charAt("あいうえお", [-1])).toBe("");

  expect(outputFilters.charCodeAt(null, [])).toBe(null);
  expect(outputFilters.charCodeAt("The quick brown fox jumps over the lazy dog.", [4])).toBe(113);
  expect(outputFilters.charCodeAt("あいうえお", [0])).toBe(0x3042);
  expect(outputFilters.charCodeAt("あいうえお", [])).toBe(0x3042);
  expect(outputFilters.charCodeAt("あいうえお", [4])).toBe(0x304a);
  expect(outputFilters.charCodeAt("あいうえお", [-1])).toBe(NaN);

  expect(outputFilters.codePointAt(null, [])).toBe(null);
  expect(outputFilters.codePointAt("あいうえお", [0])).toBe(0x3042);
  expect(outputFilters.codePointAt("あいうえお", [])).toBe(0x3042);
  expect(outputFilters.codePointAt("あいうえお", [4])).toBe(0x304a);
  expect(outputFilters.codePointAt("あいうえお", [-1])).toBe(undefined);
  
  expect(outputFilters.concat(null, [])).toBe(null);
  expect(outputFilters.concat("The quick brown fox jumps over the lazy dog.", ["ok"])).toBe("The quick brown fox jumps over the lazy dog.ok");
  expect(outputFilters.concat("The quick brown fox jumps over the lazy dog.", [])).toBe("The quick brown fox jumps over the lazy dog.");
  expect(outputFilters.concat([5, 12, 8, 130, 44], [2])).toEqual([5, 12, 8, 130, 44, 2]);
  expect(outputFilters.concat([5, 12, 8, 130, 44], [2, 3])).toEqual([5, 12, 8, 130, 44, 2, 3]);

  expect(outputFilters.copyWithin(null, [])).toBe(null);
  expect(outputFilters.copyWithin([1, 2, 3, 4, 5], [-2])).toEqual([1, 2, 3, 1, 2]);
  expect(outputFilters.copyWithin([1, 2, 3, 4, 5], [0, 3])).toEqual([4, 5, 3, 4, 5]);
  expect(outputFilters.copyWithin([1, 2, 3, 4, 5], [0, 3, 4])).toEqual([4, 2, 3, 4, 5]);
  expect(outputFilters.copyWithin([1, 2, 3, 4, 5], [-2, -3, -1])).toEqual([1, 2, 3, 3, 4]);

  expect(outputFilters.endsWith(null, [])).toBe(null);
  expect(outputFilters.endsWith("To be, or not to be, that is the question.", ["question."])).toBe(true);
  expect(outputFilters.endsWith("To be, or not to be, that is the question.", ["to be"])).toBe(false);
  expect(outputFilters.endsWith("To be, or not to be, that is the question.", ["to be", 19])).toBe(true);

  expect(outputFilters.entries(null, [])).toBe(null);
  expect(Array.from(outputFilters.entries(["a", "b", "c"], []))).toEqual([[0, "a"], [1, "b"], [2, "c"]]);

  expect(outputFilters.fill(null, [])).toBe(null);
  expect(outputFilters.fill([1, 2, 3, 4], [0, 2, 4])).toEqual([1, 2, 0, 0]);
  expect(outputFilters.fill([1, 2, 3, 4], [5, 1])).toEqual([1, 5, 5, 5]);
  expect(outputFilters.fill([1, 2, 3, 4], [6])).toEqual([6, 6, 6, 6]);

  expect(outputFilters.flat(null, [])).toBe(null);
  expect(outputFilters.flat([0, 1, 2, [3, 4]], [])).toEqual([0, 1, 2, 3, 4]);
  expect(outputFilters.flat([0, 1, 2, [[[3, 4]]]], [2])).toEqual([0, 1, 2, [3, 4]]);

  expect(outputFilters.includes(null, [])).toBe(null);
  expect(outputFilters.includes("To be, or not to be, that is the question.", ["To be"])).toBe(true);
  expect(outputFilters.includes("To be, or not to be, that is the question.", ["question"])).toBe(true);
  expect(outputFilters.includes("To be, or not to be, that is the question.", ["nonexistent"])).toBe(false);
  expect(outputFilters.includes("To be, or not to be, that is the question.", ["To be", 1])).toBe(false);
  expect(outputFilters.includes("To be, or not to be, that is the question.", ["TO BE"])).toBe(false);
  expect(outputFilters.includes("To be, or not to be, that is the question.", [""])).toBe(true);
  expect(outputFilters.includes([1, 2, 3], [2])).toBe(true);
  expect(outputFilters.includes(['cat', 'dog', 'bat'], ["cat"])).toBe(true);
  expect(outputFilters.includes(['cat', 'dog', 'bat'], ["at"])).toBe(false);

  expect(outputFilters.indexOf(null, [])).toBe(null);
  expect(outputFilters.indexOf("Blue Whale", ["Blue"])).toBe(0);
  expect(outputFilters.indexOf("Blue Whale", ["Blue"])).toBe(0);
  expect(outputFilters.indexOf("Blue Whale", ["Blute"])).toBe(-1);
  expect(outputFilters.indexOf("Blue Whale", ["Whale", 0])).toBe(5);
  expect(outputFilters.indexOf("Blue Whale", ["Whale", 5])).toBe(5);
  expect(outputFilters.indexOf("Blue Whale", ["Whale", 7])).toBe(-1);
  expect(outputFilters.indexOf("Blue Whale", [""])).toBe(0);
  expect(outputFilters.indexOf("Blue Whale", ["", 9])).toBe(9);
  expect(outputFilters.indexOf("Blue Whale", ["", 10])).toBe(10);
  expect(outputFilters.indexOf("Blue Whale", ["", 11])).toBe(10);
  expect(outputFilters.indexOf("Blue Whale", ["blue"])).toBe(-1);
  expect(outputFilters.indexOf(['ant', 'bison', 'camel', 'duck', 'bison'], ['bison'])).toBe(1);
  expect(outputFilters.indexOf(['ant', 'bison', 'camel', 'duck', 'bison'], ['bison', 2])).toBe(4);
  expect(outputFilters.indexOf(['ant', 'bison', 'camel', 'duck', 'bison'], ['giraffe'])).toBe(-1);

  expect(outputFilters.join(null, [])).toBe(null);
  expect(outputFilters.join(['Fire', 'Air', 'Water'], [])).toBe("Fire,Air,Water");
  expect(outputFilters.join(['Fire', 'Air', 'Water'], [""])).toBe("FireAirWater");
  expect(outputFilters.join(['Fire', 'Air', 'Water'], ["-"])).toBe("Fire-Air-Water");

  expect(outputFilters.keys(null, [])).toBe(null);
  expect(Array.from(outputFilters.keys(['a', 'b', 'c'], []))).toEqual([0, 1, 2]);
  
  expect(outputFilters.lastIndexOf(null, [])).toBe(null);
  expect(outputFilters.lastIndexOf("canal", ["a"])).toBe(3);
  expect(outputFilters.lastIndexOf("canal", ["a", 2])).toBe(1);
  expect(outputFilters.lastIndexOf("canal", ["a", 0])).toBe(-1);
  expect(outputFilters.lastIndexOf("canal", ["x"])).toBe(-1);
  expect(outputFilters.lastIndexOf("canal", ["c", -5])).toBe(0);
  expect(outputFilters.lastIndexOf("canal", ["c", 0])).toBe(0);
  expect(outputFilters.lastIndexOf("canal", [""])).toBe(5);
  expect(outputFilters.lastIndexOf("canal", ["", 2])).toBe(2);
  expect(outputFilters.lastIndexOf("Blue Whale, Killer Whale", ["blue"])).toBe(-1);
  expect(outputFilters.lastIndexOf(['Dodo', 'Tiger', 'Penguin', 'Dodo'], ['Dodo'])).toBe(3);
  expect(outputFilters.lastIndexOf(['Dodo', 'Tiger', 'Penguin', 'Dodo'], ['Tiger'])).toBe(1);

  expect(outputFilters.localeCompare(null, [])).toBe(null);
  let ret = outputFilters.localeCompare("ä", ["z", "de"]); // a negative value: in German, ä sorts before z
  expect(ret < 0).toBe(true);
  ret = outputFilters.localeCompare("ä", ["z", "sv"]); // a positive value: in Swedish, ä sorts after z
  expect(ret > 0).toBe(true);

  expect(outputFilters.match(null, [])).toBe(null);
  expect(JSON.stringify(outputFilters.match("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", ["number"]))).toBe(JSON.stringify(["number"]));
  expect(JSON.stringify(outputFilters.match("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", [NaN]))).toBe(JSON.stringify(["NaN"]));
  expect(JSON.stringify(outputFilters.match("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", [Infinity]))).toBe(JSON.stringify(["Infinity"]));
  expect(JSON.stringify(outputFilters.match("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", [+Infinity]))).toBe(JSON.stringify(["Infinity"]));
  expect(JSON.stringify(outputFilters.match("NaN means not a number. Infinity contains -Infinity and +Infinity in JavaScript.", [-Infinity]))).toBe(JSON.stringify(["-Infinity"]));
  expect(JSON.stringify(outputFilters.match("My grandfather is 65 years old and My grandmother is 63 years old.", [65]))).toBe(JSON.stringify(["65"]));
  expect(JSON.stringify(outputFilters.match("My grandfather is 65 years old and My grandmother is 63 years old.", [+65]))).toBe(JSON.stringify(["65"]));
  expect(JSON.stringify(outputFilters.match("The contract was declared null and void.", [null]))).toBe(JSON.stringify(["null"]));
  expect(JSON.stringify(outputFilters.match("123", ["1.3"]))).toBe(JSON.stringify(["123"]));
  expect(outputFilters.match("123", ["1\\.3"])).toBe(null);

  expect(outputFilters.normalize(null, [])).toBe(null);
  expect(outputFilters.normalize('\u0041\u006d\u00e9\u006c\u0069\u0065', ["NFC"])).toBe(outputFilters.normalize('\u0041\u006d\u0065\u0301\u006c\u0069\u0065', ["NFC"]));

  expect(outputFilters.padEnd(null, [])).toBe(null);
  expect(outputFilters.padEnd("abc", [10])).toBe("abc       ");
  expect(outputFilters.padEnd("abc", [10, "foo"])).toBe("abcfoofoof");
  expect(outputFilters.padEnd("abc", [6, 123456])).toBe("abc123");
  expect(outputFilters.padEnd("abc", [1])).toBe("abc");

  expect(outputFilters.padStart(null, [])).toBe(null);
  expect(outputFilters.padStart("abc", [10])).toBe("       abc");
  expect(outputFilters.padStart("abc", [10, "foo"])).toBe("foofoofabc");
  expect(outputFilters.padStart("abc", [6, "123456"])).toBe("123abc");
  expect(outputFilters.padStart("abc", [8, "0"])).toBe("00000abc");
  expect(outputFilters.padStart("abc", [1])).toBe("abc");

  expect(outputFilters.repeat(null, [])).toBe(null);
  expect(() => outputFilters.repeat("abc", [-1])).toThrow("Invalid count value");
  expect(outputFilters.repeat("abc", [0])).toBe('');
  expect(outputFilters.repeat("abc", [1])).toBe('abc');
  expect(outputFilters.repeat("abc", [2])).toBe('abcabc');
  expect(outputFilters.repeat("abc", [3.5])).toBe('abcabcabc');
  expect(() => outputFilters.repeat("abc", [1/0])).toThrow("Invalid count value");

  expect(outputFilters.replace(null, [])).toBe(null);
  expect(outputFilters.replace("xxx", ["", "_"])).toBe("_xxx");
  expect(outputFilters.replace("The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?", ["dog", "monkey"])).toBe("The quick brown fox jumps over the lazy monkey. If the dog reacted, was it really lazy?");

  expect(outputFilters.replaceAll(null, [])).toBe(null);
  expect(outputFilters.replaceAll("xxx", ["", "_"])).toBe("_x_x_x_");
  expect(outputFilters.replaceAll("The quick brown fox jumps over the lazy dog. If the dog reacted, was it really lazy?", ["dog", "monkey"])).toBe("The quick brown fox jumps over the lazy monkey. If the monkey reacted, was it really lazy?");

  expect(outputFilters.search(null, [])).toBe(null);
  expect(outputFilters.search('The quick brown fox jumps over the lazy dog. If the dog barked, was it really lazy?', ["quick"])).toBe(4);

  expect(outputFilters.slice(null, [])).toBe(null);
  expect(outputFilters.slice('The quick brown fox jumps over the lazy dog.', [31])).toBe("the lazy dog.");
  expect(outputFilters.slice('The quick brown fox jumps over the lazy dog.', [4, 19])).toBe("quick brown fox");
  expect(outputFilters.slice('The quick brown fox jumps over the lazy dog.', [-4])).toBe("dog.");
  expect(outputFilters.slice('The quick brown fox jumps over the lazy dog.', [-9, -5])).toBe("lazy");
  expect(outputFilters.slice(['ant', 'bison', 'camel', 'duck', 'elephant'], [2])).toEqual(["camel", "duck", "elephant"]);
  expect(outputFilters.slice(['ant', 'bison', 'camel', 'duck', 'elephant'], [2, 4])).toEqual(["camel", "duck"]);
  expect(outputFilters.slice(['ant', 'bison', 'camel', 'duck', 'elephant'], [1, 5])).toEqual(["bison", "camel", "duck", "elephant"]);
  expect(outputFilters.slice(['ant', 'bison', 'camel', 'duck', 'elephant'], [-2])).toEqual(["duck", "elephant"]);
  expect(outputFilters.slice(['ant', 'bison', 'camel', 'duck', 'elephant'], [2, -1])).toEqual(["camel", "duck"]);
  expect(outputFilters.slice(['ant', 'bison', 'camel', 'duck', 'elephant'], [])).toEqual(["ant", "bison", "camel", "duck", "elephant"]);

  expect(outputFilters.split(null, [])).toBe(null);
  expect(outputFilters.split("The quick brown", [" "])).toEqual(["The", "quick", "brown"]);
  expect(outputFilters.split("The quick brown", [""])).toEqual(["T", "h", "e", " ", "q", "u", "i", "c", "k", " ", "b", "r", "o", "w", "n"]);
  expect(outputFilters.split("The quick brown", [])).toEqual(["The quick brown"]);

  expect(outputFilters.startsWith(null, [])).toBe(null);
  expect(outputFilters.startsWith("To be, or not to be, that is the question.", ["To be"])).toBe(true);
  expect(outputFilters.startsWith("To be, or not to be, that is the question.", ["not to be"])).toBe(false);
  expect(outputFilters.startsWith("To be, or not to be, that is the question.", ["not to be", 10])).toBe(true);

  expect(outputFilters.substring(null, [])).toBe(null);
  expect(outputFilters.substring("Mozilla", [0, 1])).toBe("M");
  expect(outputFilters.substring("Mozilla", [1, 0])).toBe("M");
  expect(outputFilters.substring("Mozilla", [0, 6])).toBe("Mozill");
  expect(outputFilters.substring("Mozilla", [4])).toBe("lla");
  expect(outputFilters.substring("Mozilla", [4, 7])).toBe("lla");
  expect(outputFilters.substring("Mozilla", [7, 4])).toBe("lla");
  expect(outputFilters.substring("Mozilla", [0, 7])).toBe("Mozilla");
  expect(outputFilters.substring("Mozilla", [0, 10])).toBe("Mozilla");

  expect(outputFilters.toExponential(null, [])).toBe(null);
  expect(outputFilters.toExponential(123456, [])).toBe("1.23456e+5");
  expect(outputFilters.toExponential(123456, [2])).toBe("1.23e+5");
  expect(outputFilters.toExponential("abc", [])).toBe("abc");

  expect(outputFilters.toFixed(null, [])).toBe(null);
  expect(outputFilters.toFixed(10, [])).toBe("10");
  expect(outputFilters.toFixed(10, [2])).toBe("10.00");
  expect(outputFilters.toFixed("abc", [])).toBe("abc");

  expect(outputFilters.toLocaleString(null, [])).toBe(null);
  expect(outputFilters.toLocaleString(100, [])).toBe("100");
  expect(outputFilters.toLocaleString(1000, [])).toBe("1,000");
  expect(outputFilters.toLocaleString("abc", [])).toBe("abc");
  expect(outputFilters.toLocaleString([1000], [])).toEqual("1,000");

  expect(outputFilters.toLocaleLowerCase(null, [])).toBe(null);
  expect(outputFilters.toLocaleLowerCase("İstanbul", ['en-US'])).toBe("i̇stanbul");
  expect(outputFilters.toLocaleLowerCase("İstanbul", ['tr'])).toBe("istanbul");

  expect(outputFilters.toLocaleUpperCase(null, [])).toBe(null);
  expect(outputFilters.toLocaleUpperCase("istanbul", ['en-US'])).toBe("ISTANBUL");
  expect(outputFilters.toLocaleUpperCase("istanbul", ['TR'])).toBe("İSTANBUL");

  expect(outputFilters.toLowerCase(null, [])).toBe(null);
  expect(outputFilters.toLowerCase("ALPHABET", [])).toBe("alphabet");

  expect(outputFilters.toPrecision(null, [])).toBe(null);
  expect(outputFilters.toPrecision(5.123456, [])).toBe('5.123456');
  expect(outputFilters.toPrecision(5.123456, [5])).toBe('5.1235');
  expect(outputFilters.toPrecision(5.123456, [2])).toBe('5.1');
  expect(outputFilters.toPrecision(5.123456, [1])).toBe('5');
  expect(outputFilters.toPrecision(0.000123, [])).toBe('0.000123');
  expect(outputFilters.toPrecision(0.000123, [5])).toBe('0.00012300');
  expect(outputFilters.toPrecision(0.000123, [2])).toBe('0.00012');
  expect(outputFilters.toPrecision(0.000123, [1])).toBe('0.0001');
  expect(outputFilters.toPrecision(1234.5, [2])).toBe('1.2e+3');

  expect(outputFilters.toReversed(null, [])).toBe(null);
  expect(outputFilters.toReversed([1, 5, 4, 2], [])).toEqual([2, 4, 5, 1]);

  expect(outputFilters.toSorted(null, [])).toBe(null);
  expect(outputFilters.toSorted([1, 5, 4, 2], [])).toEqual([1, 2, 4, 5]);

  expect(outputFilters.toSpliced(null, [])).toBe(null);
  expect(outputFilters.toSpliced(["Jan", "Mar", "Apr", "May"], [1, 0, "Feb"])).toEqual(["Jan", "Feb", "Mar", "Apr", "May"]);
  expect(outputFilters.toSpliced(["Jan", "Feb", "Mar", "Apr", "May"], [2, 2])).toEqual(["Jan", "Feb", "May"]);
  expect(outputFilters.toSpliced(["Jan", "Feb", "May"], [1, 1, "Feb", "Mar"])).toEqual(["Jan", "Feb", "Mar", "May"]);

  expect(outputFilters.toUpperCase(null, [])).toBe(null);
  expect(outputFilters.toUpperCase("alphabet", [])).toBe("ALPHABET");

  expect(outputFilters.trim(null, [])).toBe(null);
  expect(outputFilters.trim('   Hello world!   ', [])).toBe('Hello world!');

  expect(outputFilters.trimEnd(null, [])).toBe(null);
  expect(outputFilters.trimEnd('   Hello world!   ', [])).toBe('   Hello world!');

  expect(outputFilters.trimStart(null, [])).toBe(null);
  expect(outputFilters.trimStart('   Hello world!   ', [])).toBe('Hello world!   ');

  expect(outputFilters.values(null, [])).toBe(null);
  expect(Array.from(outputFilters.values(['a', 'b', 'c'], []))).toEqual(['a', 'b', 'c']);

  expect(outputFilters.with(null, [])).toBe(null);
  expect(outputFilters.with([1, 2, 3, 4, 5], [2, 6])).toEqual([1, 2, 6, 4, 5]  );
});

test("Builtin inputFilters", () => {
  expect(inputFilters.number("", [])).toBe(null);
  expect(inputFilters.number("10", [])).toBe(10);

  expect(inputFilters.boolean("", [])).toBe(null);
  expect(inputFilters.boolean("1", [])).toBe(true);
  expect(inputFilters.boolean(undefined, [])).toBe(false); //
});
