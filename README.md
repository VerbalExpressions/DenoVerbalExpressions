# DenoVerbalExpressions

[![License](https://img.shields.io/github/license/VerbalExpressions/JSVerbalExpressions.svg)](LICENSE)

## TypeScript Regular Expressions made easy

DenoVerbalExpressions is a TypeScript library for Deno that helps construct difficult regular expressions.

## How to get started


### On the server (Deno 1.0+)

Import:

In `deps.ts`
```ts
export { 
  Inputs, RegExpFlags, VerbalExpression, VerEx 
} from "https://deno.land/x/verbalexpressions";
```

To use in your Deno app:

```ts
import {
  Inputs, RegExpFlags, VerbalExpression, VerEx
} from "./deps.ts";
```

## Running tests

```sh
sh run_tests.sh
```

## API documentation

You can find the API documentation at [DenoVerbalExpressions](https://github.com/verbalexpressions/DenoVerbalExpressions). You can find the source code for the docs in [`docs`](docs/).

## Examples

Here are some simple examples to give an idea of how VerbalExpressions works:

### Testing if we have a valid URL

```ts
// Create an example of how to test for correctly formed URLs
const tester = VerEx()
    .startOfLine()
    .then("http")
    .maybe("s")
    .then("://")
    .maybe("www.")
    .anythingBut(" ")
    .endOfLine();

// Create an example URL
const testMe = "https://www.google.com";

// Use RegExp object's native test() function
if (tester.test(testMe)) {
    console.log("We have a correct URL"); // This output will fire
} else {
    console.log("The URL is incorrect");
}

console.log(tester); // Outputs the actual expression used: /^(http)(s)?(\:\/\/)(www\.)?([^\ ]*)$/
```

### Replacing strings

```ts
// Create a test string
const replaceMe = "Replace bird with a duck";

// Create an expression that seeks for word "bird"
const expression = VerEx().find("bird");

// Execute the expression like a normal RegExp object
const result = expression.replace(replaceMe, "duck");

// Outputs "Replace duck with a duck"
console.log(result);
```

### Shorthand for string replace

```ts
const result = VerEx().find("red").replace("We have a red house", "blue");

// Outputs "We have a blue house"
console.log(result);
```

## Contributions

Pull requests are warmly welcome!

Clone the repo and fork:

```sh
git clone https://github.com/verbalexpressions/DenoVerbalExpressions.git
```

### Style guide

The [TypeScript Style Guide](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md) style guide is loosely used as a basis for creating clean and readable TypeScript code. Check [`tslint`](https://palantir.github.io/tslint/).

Check out these slide decks for handy Github & git tips:

- [Git and Github Secrets](https://zachholman.com/talk/git-github-secrets/)
- [More Git and Github Secrets](https://zachholman.com/talk/more-git-and-github-secrets/)

## Tools

- https://verbalregex.com - it's a wrapper of JSVerbalExpressions; users can write down the code and compile to regex
- [TypeScript Playground](https://www.typescriptlang.org/play/#src=function%20isDateBoolean(obj%3A%20any)%3A%20boolean%20%7B%0D%0A%20%20%20%20return%20typeof%20obj%20%3D%3D%3D%20'object'%20%26%26%20'toISOString'%20in%20obj%3B%0D%0A%7D%0D%0A%0D%0Afunction%20isDateCast(obj%3A%20any)%3A%20obj%20is%20Date%20%7B%0D%0A%20%20%20%20return%20typeof%20obj%20%3D%3D%3D%20'object'%20%26%26%20'toISOString'%20in%20obj%3B%0D%0A%7D%0D%0A%0D%0Afunction%20getUnknownData()%3A%20any%20%7B%0D%0A%20%20%20%20return%20new%20Date()%3B%0D%0A%7D%0D%0A%0D%0Afunction%20test1()%20%7B%0D%0A%20%20%20%20var%20d%20%3D%20getUnknownData()%3B%0D%0A%20%20%20%20if%20(isDateBoolean(d))%20%7B%0D%0A%20%20%20%20%20%20%20%20console.log(d.toISOString())%3B%0D%0A%20%20%20%20%20%20%20%20console.log(d.toIsoString())%3B%0D%0A%20%20%20%20%7D%0D%0A%7D%0D%0A%0D%0Afunction%20test2()%20%7B%0D%0A%20%20%20%20var%20d%20%3D%20getUnknownData()%3B%0D%0A%20%20%20%20if%20(isDateCast(d))%20%7B%0D%0A%20%20%20%20%20%20%20%20console.log(d.toISOString())%3B%0D%0A%20%20%20%20%20%20%20%20console.log(d.toIsoString())%3B%0D%0A%20%20%20%20%7D%0D%0A%7D) - TS Playground

## Other Implementations

You can see an up to date list of all ports on [VerbalExpressions.github.io](https://VerbalExpressions.github.io).

- [JavaScript](https://github.com/verbalexpressions/jsverbalexpressions)
- [Ruby](https://github.com/ryan-endacott/verbal_expressions)
- [C#](https://github.com/VerbalExpressions/CSharpVerbalExpressions)
- [Python](https://github.com/VerbalExpressions/PythonVerbalExpressions)
- [Java](https://github.com/VerbalExpressions/JavaVerbalExpressions)
- [Groovy](https://github.com/VerbalExpressions/GroovyVerbalExpressions)
- [PHP](https://github.com/VerbalExpressions/PHPVerbalExpressions)
- [Haskell](https://github.com/VerbalExpressions/HaskellVerbalExpressions)
- [Haxe](https://github.com/VerbalExpressions/HaxeVerbalExpressions)
- [C++](https://github.com/VerbalExpressions/CppVerbalExpressions)
- [Objective-C](https://github.com/VerbalExpressions/ObjectiveCVerbalExpressions)
- [Perl](https://github.com/VerbalExpressions/PerlVerbalExpressions)
- [Swift](https://github.com/VerbalExpressions/SwiftVerbalExpressions)

If you would like to contribute another port (which would be awesome!), please [open an issue](https://github.com/VerbalExpressions/implementation/issues/new) specifying the language in the [VerbalExpressions/implementation repo](https://github.com/VerbalExpressions/implementation/issues). Please don't open PRs for other languages against this repo.
