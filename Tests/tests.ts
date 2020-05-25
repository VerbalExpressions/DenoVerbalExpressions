
import {
  assert,
  assertNotEquals,
  assertStrContains,
  assertArrayContains,
  assertMatch,
  assertEquals,
  assertStrictEq,
  assertThrows,
  AssertionError,
  equal,
  fail,
  unimplemented,
  unreachable,
} from "./test_deps.ts";

import {
  RegExpFlags,
  Inputs,
  VerbalExpression,
  VerEx
} from "./test_deps.ts";



function resetLastIndex(regex: VerbalExpression) {
  regex.lastIndex = 0;
}


Deno.test("constructor", async () => {
  const testRegex = VerEx();

  assertEquals(testRegex.toString(), "/(?:)/gm", "Should be empty regex with global, multiline matching");
});


// Utility //

Deno.test("sanitize", async () => {
  const testString = '$a^b\\c|d(e)f[g]h{i}j.k*l+m?n:o=p';
  const escaped = '\\$a\\^b\\\\c\\|d\\(e\\)f\\[g\\]h\\{i\\}j\\.k\\*l\\+m\\?n\\:o\\=p';

  assertEquals(VerbalExpression.sanitize(testString), escaped, "Special characters should be sanitized");

  assertEquals(VerbalExpression.sanitize(42), "42");
  assertEquals(VerbalExpression.sanitize(/foo/), "foo");
});

Deno.test("add", async () => {
  let testRegex = VerEx().startOfLine().withAnyCase().endOfLine();
  testRegex = testRegex.add("(?:foo)?");

  assertEquals(testRegex.source.startsWith("^"), true, "Should retain old prefixes");
  assertEquals(testRegex.source.endsWith("$"), true, "Should retain old suffixes");

  assertEquals(testRegex.test("foo"), true, "Should add new rules");
  resetLastIndex(testRegex);
  assertEquals(testRegex.test(""), true, "Should add new rules");
  assertEquals(testRegex.flags.includes("i"), true, "Should retain old modifiers");
});

Deno.test("startOfLine", async () => {
  let testRegex = VerEx().startOfLine().then("a");
  let testString = 'a';

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = 'ba';
  assertEquals(testRegex.test(testString), false);

  testRegex = testRegex.startOfLine(false); // start of line is no longer necessary
  testString = "ba";
  assertEquals(testRegex.test(testString), true);
});

Deno.test("endOfLine", async () => {
  let testRegex = VerEx().find("a").endOfLine();
  let testString = "a";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "ab";
  assertEquals(testRegex.test(testString), false);

  testRegex = testRegex.endOfLine(false); // end of line is no longer necessary
  testString = "ab";
  assertEquals(testRegex.test(testString), true);
});

function then(name: string) {
  let testRegex = VerEx()[name]("a");
  let testString = "a";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "b";
  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "";
  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx()[name]("a")[name]("b");
  testString = "ab";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "ac";
  assertEquals(testRegex.test(testString), false);
}

Deno.test("then", async () => {
  then("then");
});

Deno.test("find", async () => {
  then("find");
});


Deno.test("maybe", async () => {
  const testRegex = VerEx().startOfLine().then("a").maybe("b");
  let testString = "acb";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "abc";
  assertEquals(testRegex.test(testString), true);
});

Deno.test("or", async () => {
  let testRegex = VerEx().startOfLine().then("abc").or("def");
  let testString = "defzzz";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "abczzz";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "xyzabc";
  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx().startOfLine().then("abc").or().then("def");
  testString = "defzzz";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "abczzz";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "xyzabc";
  assertEquals(testRegex.test(testString), false);
});

Deno.test("anything", async () => {
  const testRegex = VerEx().startOfLine().anything();
  let testString = "foo";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "";
  assertEquals(testRegex.test(testString), true, "Should be able to match zero characters");
});

Deno.test("anythingBut", async () => {
  let testRegex = VerEx().startOfLine().anythingBut("br").endOfLine();
  let testString = "foobar";

  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "foo_a_";
  assertEquals(testRegex.test(testString), true);

  testRegex = VerEx().startOfLine().anythingBut("br");
  testString = "bar";
  assertEquals(testRegex.test(testString), true, "Should be able to match zero characters");

  testRegex = VerEx().startOfLine().anythingBut(["b", "r"]).endOfLine();
  testString = "foobar";
  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "foo_a_";
  assertEquals(testRegex.test(testString), true);

  testRegex = VerEx().startOfLine().anythingBut(["b", "r"]);
  testString = "bar";
  assertEquals(testRegex.test(testString), true, "Should be able to match zero characters");
});

Deno.test("something", async () => {
  const testRegex = VerEx().something();
  let testString = "";

  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "a";
  assertEquals(testRegex.test(testString), true);
});

Deno.test("somethingBut", async () => {
  let testRegex = VerEx().startOfLine().somethingBut("abc").endOfLine();
  let testString = "";

  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "foo";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "fab";
  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx().startOfLine().somethingBut(["a", "b", "c"]).endOfLine();
  testString = "";
  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "foo";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "fab";
  assertEquals(testRegex.test(testString), false);
});

function anyOf(name : string) {
  let testRegex = VerEx().startOfLine().then("a")[name]('xyz');
  let testString = 'ay';

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "ab";
  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "a";
  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx().startOfLine().then("a")[name](["x", "y", "z"]);
  testString = "ay";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "ab";
  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "a";
  assertEquals(testRegex.test(testString), false);
}

Deno.test("anyOf", async () => {
  anyOf("anyOf");
});

Deno.test("any", async () => {
  anyOf("any");
});

Deno.test("not", async () => {
  const testRegex = VerEx().startOfLine().not("foo").anything().endOfLine();
  let testString = "foobar";

  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "bar";
  assertEquals(testRegex.test(testString), true);
});

Deno.test("range", async () => {
  let testRegex = VerEx().startOfLine().range("a", "z", "0", "9").oneOrMore().endOfLine();
  let testString = "foobarbaz123";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "fooBarBaz_123";
  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx().startOfLine().range("a", "z", "0").oneOrMore().endOfLine();
  testString = "foobarbaz";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "foobarbaz123";
  assertEquals(testRegex.test(testString), false, 'Should ignore extra parameters');
});


// Special characters //

function lineBreak(name: string) {
  const testRegex = VerEx().startOfLine().then("abc")[name]().then("def");
  let testString = "abc\r\ndef";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "abc\ndef";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "abc\rdef";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "abc\r\n\ndef";
  assertEquals(testRegex.test(testString), false);
}

Deno.test("lineBreak", async () => {
  lineBreak("lineBreak");
});

Deno.test("br", async () => {
  lineBreak("br");
});

Deno.test("tab", async () => {
  const testRegex = VerEx().startOfLine().tab().then("abc");
  let testString = "\tabc";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "abc";
  assertEquals(testRegex.test(testString), false);
});

Deno.test("word", async () => {
  let testRegex = VerEx().startOfLine().word().endOfLine();
  let testString = "azertyuiopqsdfghjklmwxcvbn0123456789_";

  assertEquals(testRegex.test(testString), true);

  testRegex = VerEx().word();
  testString = ". @[]|,&~-";
  assertEquals(testRegex.test(testString), false);
});

Deno.test("digit", async () => {
  let testRegex = VerEx().startOfLine().digit().oneOrMore().endOfLine();
  let testString = "0123456789";

  assertEquals(testRegex.test(testString), true);

  testRegex = VerEx().digit();
  testString = "-.azertyuiopqsdfghjklmwxcvbn @[]|,_&~";
  assertEquals(testRegex.test(testString), false);
});

Deno.test("whitespace", async () => {
  const testRegex = VerEx().startOfLine().whitespace().oneOrMore().searchOneLine().endOfLine();
  let testString = " \t\r\n\v\f";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "a z";
  assertEquals(testRegex.test(testString), false);
});


// Modifiers //

Deno.test("addModifier", async () => {
  let testRegex = VerEx().addModifier("y");
  assertEquals(testRegex.flags.includes("y"), true);

  //t.notThrows(() => {
  //  testRegex = VerEx().addModifier('g');
  //}, 'Should not add extra modifier if it already exists');
});

Deno.test("removeModifier", async () => {
  const testRegex = VerEx().removeModifier("g");
  assertEquals(testRegex.flags.includes("g"), false);
});

Deno.test("withAnyCase", async () => {
  let testRegex = VerEx().startOfLine().then("a");
  let testString = "A";

  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx().startOfLine().then("a").withAnyCase();
  testString = "A";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "a";
  assertEquals(testRegex.test(testString), true);

  testRegex = VerEx().startOfLine().then("a").withAnyCase(false);
  testString = "A";
  assertEquals(testRegex.test(testString), false);
});

Deno.test("stopAtFirst", async () => {
  let testRegex: string = VerEx().find("foo");
  const testString: string = "foofoofoo";

  // @ts-ignore
  assertEquals(testString.match(testRegex).length, 3, "Should match all 'foo's");

  testRegex = VerEx().find("foo").stopAtFirst();

  // @ts-ignore
  assertEquals(testString.match(testRegex).length, 1, "Should match one 'foo'");

  testRegex = VerEx().find("foo").stopAtFirst(false);

  // @ts-ignore
  assertEquals(testString.match(testRegex).length, 3, "Should match all 'foo's");
});

Deno.test("searchOneLine", async () => {
  let testRegex = VerEx().startOfLine().then("b").endOfLine();
  const testString = "a\nb\nc";

  assertEquals(testRegex.test(testString), true);

  testRegex = VerEx().startOfLine().then("b").endOfLine().searchOneLine();
  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx().startOfLine().then("b").endOfLine().searchOneLine(false);
  assertEquals(testRegex.test(testString), true);
});


// Loops //

Deno.test("repeatPrevious", async () => {
  let testRegex = VerEx().startOfLine().find("foo").repeatPrevious(3).endOfLine();
  let testString = "foofoofoo";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "foofoo";
  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "foofoofoofoo";
  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "bar";
  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx().startOfLine().find("foo").repeatPrevious(1, 3).endOfLine();

  for (let i = 0; i <= 4; i++) {
    resetLastIndex(testRegex);
    testString = "foo".repeat(i);

    if (i < 1 || i > 3) {
      assertEquals(testRegex.test(testString), false);
    } else {
      assertEquals(testRegex.test(testString), true);
    }
  }

  testRegex = VerEx().startOfLine().find("foo").repeatPrevious().endOfLine();
  testString = "foofoo";
  assertEquals(testRegex.test(testString), false, 'Should silently fail on edge cases');

  testRegex = VerEx().startOfLine().find("foo").repeatPrevious(1, 2, 3).endOfLine();
  testString = "foofoo";
  assertEquals(testRegex.test(testString), false, 'Should silently fail on edge cases');
});

Deno.test("oneOrMore", async () => {
  const testRegex = VerEx().startOfLine().then("foo").oneOrMore().endOfLine();
  let testString = "foo";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "foofoo";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "bar";
  assertEquals(testRegex.test(testString), false);
});

Deno.test("multiple", async () => {
  let testRegex = VerEx().startOfLine().find(" ").multiple().endOfLine();
  let testString = "   ";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = " a ";
  assertEquals(testRegex.test(testString), false);

  testRegex = VerEx().startOfLine().multiple("foo").endOfLine();
  testString = "foo";

  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "foofoofoo";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "";
  assertEquals(testRegex.test(testString), true);

  testRegex = VerEx().startOfLine().multiple("foo", 2).endOfLine();
  testString = "foo";
  assertEquals(testRegex.test(testString), false);

  resetLastIndex(testRegex);
  testString = "foofoo";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  testString = "foofoofoo";
  assertEquals(testRegex.test(testString), true);

  testRegex = VerEx().startOfLine().multiple("foo", 2, 5).endOfLine();

  for (let i = 0; i <= 6; i++) {
    resetLastIndex(testRegex);
    testString = "foo".repeat(i);

    if (i < 2 || i > 5) {
      assertEquals(testRegex.test(testString), false);
    } else {
      assertEquals(testRegex.test(testString), true);
    }
  }
});


// Capture groups //

Deno.test("capture groups", async () => {
  let testRegex = VerEx().find("foo").beginCapture().then("bar");
  let testString = "foobar";

  assertEquals(testRegex.test(testString), true, "Expressions with incomplete capture groups should work");

  testRegex = testRegex.endCapture().then("baz");
  testString = "foobarbaz";
  assertEquals(testRegex.test(testString), true);

  resetLastIndex(testRegex);
  const matches = testRegex.exec(testString);
  assertEquals(matches[1], "bar");
});

// Miscellaneous //

Deno.test("replace", async () => {
  const testRegex = VerEx().find(" ");
  const testString = "foo bar baz";

  assertEquals(testRegex.replace(testString, "_"), "foo_bar_baz");
});

Deno.test("toRegExp", async () => {
  const testRegex = VerEx().anything();
  const converted = testRegex.toRegExp();

  assertEquals(converted.toString(), testRegex.toString(), "Converted regex should have same behaviour");
});
