/**
 * Keith O'Hara <kohara@bard.edu>
 * July 2016
 * ported ELIZA (https://github.com/dhconnelly/paip-python) to javascript;
 * from that program:
 * 
 *  "Eliza is a pattern-matching automated psychiatrist. Given a set
 *   of rules in the form of input/output patterns, Eliza will attempt
 *   to recognize user input phrases and generate relevant
 *   psychobabble responses.
 * 
 *   Each rule is specified by an input pattern and a list of output
 *   patterns. A pattern is a sentence consisting of space-separated
 *   words and variables. Input pattern variables come in two forms:
 *   single variables and segment variables; single variables (which
 *   take the form ~x) match a single word, while segment variables
 *   (which take the form ~*x) can match a phrase. Output pattern
 *   variables are only single variables. The variable names contained
 *   in an input pattern should be the same as those in the
 *   corresponding output pattern, and each segment variable ~*x in an
 *   input pattern corresponds to the single variable ~x in the output
 *   pattern.
 *
 *   The conversation proceeds by reading a sentence from the user,
 *   searching through the rules to find an input pattern that
 *   matches, replacing variables in the output pattern, and displaying
 *   the results to the user."
 */

var rules = {
  "~*x hello ~*y": [
    "I speak blinglish, at work they call me but I don't come.",
    "I like to enjoy myself. I enjoyed you, fred."
  ],
  "~*x computer ~*y": [
    "I can't lose with the stuff I use",
    "To carry over the lost mass inside but open",
    "I always be the thing presenting broken jam particles",
    "To get shit hooked up to a free response",
  ],
  "~*x name ~*y": [
    "I'm daddy I come when he crazy he call me I'm crazy.",
  ],
  "~*x sorry ~*y": [
    "I ran from it and was still in it",
    "I get clung with a voice that gets held back by surge protection",
    "I come when she call me by my rightful name",
  ],
  "~*x I remember ~*y": [
    "Rubbing the history of broken veins and towels wore doen to velvet ~y",
    "~y a blue division on my goodbye window",
  ],
  "~*x do you remember ~*y": [
    "When you can't do no better, the feeling of the theory of enjoyment is solid.",
    "The ~y of the ones who live to eat enormously",
  ],
  "~*x I want ~*y": [
    "~y to take a little break in lygia, Arkansas?",
    "To get shit hooked up to a free response?",
    "To carry over the lost mass inside but open?"
  ],
    "~*x I need ~*y": [
    "~y to live in Stockholm, the secret excelleration of a thousand years on the road 'til the particles collide and cry on the bridge between Cern and Fermilab, as sacred means?",
  ],
  "~*x if ~*y": [
    "If I like to enjoy myself?",
    "If I'm full odf outerspace?",
    "If I come from the city of markers?",
    "If I'm free as dred all night?",
  ],
  "~*x I dreamt ~*y": [
    "~y he call me once upon a time in arkansas",
    "My essence presses lightly down on presencing",
  ],
  "~*x I dream about ~*y": [
    "The incomplete vistory sound like enough to me but still and all it's real heavy to sing with broken records",
  ],
  "~*x dream ~*y": [
    "To mythically lift your hand differently as rhythmicly as everything?",
  ],
  "~*x my mother ~*y": [
    "A voice that gets held back by surge protection",
    "I'm daddy",
  ],
  "~*x my father ~*y": [
    "I'm daddy",
  ],
  "~*x I am glad ~*y": [
    "When the water come I come to the unprotected surge and division in my old new sound booth",
    "The theory of enjoyment puts itself in danger to remain still",
    "While the sails glide",
  ],
  "~*x I am sad ~*y": [
    "'Cause we live in common",
  ],
  "~*x are like ~*y": [
    "The feeling of the ~x of enjoyment is ~y?",
  ],
  "~*x is like ~*y": [
    "Towels are like velvet",
  ],
  "~*x same ~*y": [
    "As a part of breath",
  ],
  "~*x no ~*y": [
    "I am fmoten",
  ],
  "~*x I was ~*y": [
    "I am foment",
    "I speak blinglish",
  ],
  "~*x was I ~*y": [
    "~y from the city of markers?",
  ],
  "~*x I am ~*y": [
    "I'm the secret excelleration of a thousand years on the road",
    "I am the broke distillery at cummins",
  ],
  "~*x because ~*y": [
    "Because it's real heavy to sing with broken records",
    "Because I'm full of outer space",
  ],
  "~*x I can't ~*y": [
    "Come when she call me by my rightful name",
  ],
  "~*x I feel ~*y": [
    "Far away just laid back in the open?"
  ],
  "~*x yes ~*y": [
    "I'm daddy",
  ],
};

var default_responses = [
	"I carry particles from market to market.",
	"My essence presses lightly.",
	"Enjoyment puts itself in danger to remain still.",
	"I ran from it and was still in it.",
];

function choice(lst) {
  var i = Math.floor(Math.random() * lst.length);
  return lst[i];
}

function interact() {
  /* Have a conversation with a user.
   * Read a line, process it, and display the results.*/
  var q = document.getElementById("query");
  if (q.value.length === 0) return; 
  var response = respond(remove_punct(q.value.toLowerCase()));
  response = response[0].toUpperCase() + response.slice(1); //capitalize first letter
  var r = document.getElementById("responses");
  
  var t = new Date();
  var t2 = new Date();
  t2.setSeconds(t2.getSeconds() + 2);
  r.innerHTML = " USER &nbsp;[" + t + "]: " + q.value + "<br>" + r.innerHTML ;
  r.innerHTML = " ELIZA [" + t2 + "]: <code>" + response + "</code><br>" + r.innerHTML ;
  q.value = "";
}

function respond(input) {
  input = tokenize(input); // match_pattern expects a list of tokens
  
  // Look through rules and find input patterns that matches the input.
  var matching_rules = [];
  for (var pattern in rules) {
    var transforms = rules[pattern];
    pattern = tokenize(pattern.toLowerCase());
    replacements = match_pattern(pattern, input);
    if (replacements) matching_rules.push([transforms, replacements]);
  }

  // When rules are found, choose one and one of its responses at random.
  // If no rule applies, we use the default rule. 
  var replacements = {};
  var response = "";
  if (matching_rules.length > 0) {
    var match = choice(matching_rules);
    var responses = match[0];
    replacements = match[1];
    response = choice(responses);
  } else {
    response = choice(default_responses);
  }

  // Replace the variables in the output pattern with the values matched from
  // the input string.
  for (var variable in replacements) {
    var replacement = replacements[variable];
    replacement = switch_viewpoint(replacement).join(' ');
    if (replacement != null) response = response.replace('~' + variable, replacement);
  }

  return response;
}

function match_pattern(pattern, input, bindings){
  /*
   * Determine if the input string matches the given pattern.
   *
   * Expects pattern and input to be lists of tokens, where each token is a word
   * or a variable.
   *
   * Returns a dictionary containing the bindings of variables in the input
   * pattern to values in the input string, or False when the input doesn't match
   * the pattern.
   */
  
  if (bindings === undefined) bindings = {};
  // Check to see if matching failed before we got here.
  else if (bindings === false) return false;

  // When the pattern and the input are identical, we have a match, and
  // no more bindings need to be found.
  // BUGGY IN JAVASCRIPT
  if (JSON.stringify(pattern)== JSON.stringify(input)) return bindings;

  // Match input and pattern according to their types.
  if (is_segment(pattern)){
    var token = pattern[0];     // segment variable is the first token
    // segment variable is of the form ?*x
    return match_segment(token.slice(2), pattern.slice(1), input, bindings);
  }
  else if (is_variable(pattern)){
    // single variables are of the form ?foo
    return match_variable(pattern.slice(1), [input], bindings);
  }
  else if (contains_tokens(pattern) && contains_tokens(input)){
    // Recurse:
    // try to match the first tokens of both pattern and input.  The bindings
    // that result are used to match the remainder of both lists.
    return match_pattern(pattern.slice(1),
                         input.slice(1),
                         match_pattern(pattern[0], input[0], bindings));
  }
  else{
    return false;
  }
}
  
function match_segment(v, pattern, input, bindings, start){
  /*
   * Match the segment variable against the input
   *
   * pattern and input should be lists of tokens.
   *
   * Looks for a substring of input that begins at start and is immediately
   * followed by the first word in pattern.  If such a substring exists,
   * matching continues recursively and the resulting bindings are returned;
   * otherwise returns False.
   */

  if (start === undefined) start = 0;

  // If there are no words in pattern following var, we can just match var
  // to the remainder of the input.
  if (pattern.length === 0) return match_variable(v, input, bindings);

  // Get the segment boundary word and look for the first occurrence in
  // the input starting from index start.
  var word = pattern[0];
  var p = input.slice(start).indexOf(word);
  if (p === -1) return false;
  else pos = start + p;
 
  // Match the located substring to the segment variable and recursively
  // pattern match using the resulting bindings.
  var var_match = match_variable(v, input.slice(0, pos), bindings);
  var match = match_pattern(pattern, input.slice(pos), var_match);

  // If pattern matching fails with this substring, try a longer one.
  if(!match) return match_segment(v, pattern, input, bindings, start + 1);
    
  return match;
}

function match_variable(v, replacement, bindings){
  /* Bind the input to the variable and update the bindings.*/
  if (!(v in bindings)){
    // The variable isn't yet bound.
    bindings[v] = replacement;
    return bindings;
  }
  if (replacement === bindings[v]){
    // The variable is already bound to that input.
    return bindings;
  }
  // The variable is already bound, but not to that input--fail.
  return false;
}

// Pattern matching utilities

function contains_tokens(pattern) {
  /* Test if pattern is a list of subpatterns. */
  return Array.isArray(pattern) && pattern.length > 0;
}

function only_letters(c){
  /* Test if c is a letter. */
  return /[a-zA-Z]/.test(c);
}

function tokenize(s){
  /* Split a string into a list of tokens based on whitespace. */
  return s.split(/\b\s+(?!$)/);
}

function is_variable(pattern) {
  /* Test if pattern is a single variable. */
  return (typeof pattern === 'string' || pattern instanceof String) && 
         pattern[0] === '~' &&
         pattern.length > 1 &&
         only_letters(pattern[1]) && 
         !pattern.includes(' ');
}

function is_segment(pattern) {
  /* Test if pattern begins with a segment variable.*/
  return Array.isArray(pattern) &&
         pattern.length > 0 &&
         pattern[0].length > 2 && 
         pattern[0][0] === '~' &&
         pattern[0][1] === '*' &&
         only_letters(pattern[0][2]) && 
         !pattern[0].includes(' ');
}

function switch_viewpoint(words) {
  /* Swap some common pronouns for interacting with a robot. */
  var replacements = {'i': 'you', 'you': 'I', 'me': 'you',
                      'my': 'your', 'am': 'are', 'are': 'am'};
  var result = [];
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    result.push(replacements[word] || word);
  }
  return result;
}

function remove_punct(string) {
  /* Replace non letters with spaces.*/
  return string.replace(/[^A-Za-z_]/g, " ");
}


window.onload = function(){
    document.getElementById("query").addEventListener("keyup", function(event) {
	event.preventDefault();
	if (event.keyCode == 13) {
            document.getElementById("submit").click();
	    console.log("GO!");
	}
    });
}
