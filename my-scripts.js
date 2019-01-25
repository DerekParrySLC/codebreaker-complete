// Dot colors
colors = ["red", "green", "blue", "yellow", ];

// Number of dots in a code
number = 4;

// Parts of the web page
banner = document.getElementById("banner");
secret_code = document.getElementById("secret_code");
previous = document.getElementById("previous");
guess = document.getElementById("guess");
menu = document.getElementById("menu");

// Important arrays
secret = [];
code = [];
guess_dots = [];
all_codes = [];
remaining_codes = [];
all_responses = [];

clear_tag = function(tag) { // Clears all children from an html tag
	while (tag.firstChild) {
		tag.removeChild(tag.firstChild);
	}
}

matches = function(a, b) { // Checks if two arrays match perfectly
		// Checks to see if two arrays are equal
		if (a.length !== b.length) {
			return false;
		}

		// After this loop, equals is true if all elements of the array are equal
		var equals = true;
		for (let i=0; i < a.length; i++) {
			equals = equals && (a[i] == b[i]);
		}
		return equals;
	}

make_dot = function(color=colors[0], html_class="dot") { // Makes a dot
	var dot = document.createElement("span");
	dot.setAttribute("class", html_class);
	dot.style.backgroundColor = color;
	return dot;
}

clear = function() { // Clears the current guess
	// Colors are removed from the guess
	code = [];
	guess_dots = [];
	clear_tag(guess);

	// Empty dots are added to guess_dots and the guess tag to be used later
	for (let i=0; i < number; i++) {
		var dot = make_dot("white", "empty");
		guess_dots.push(dot);
		guess.appendChild(dot);
	}
}

add_to_guess = function(color) { // Add the given color to the guess if there is room
	if (code.length < number) {
		guess_dots[code.length].style.backgroundColor = color;
		guess_dots[code.length].classList.remove("empty");
		code.push(color);
	}
}

respond = function(guess, hidden=null) { // Gives response to a guess based on the provided hidden code
	if (hidden == null) { // Uses the secret if no hidden code given
		hidden = secret;
	}

	var full_matches = 0;
	var half_matches = 0;

	// Anything that is not a full-match is saved to review for half-matches
	var unmatched_guess = [];
	var unmatched_hidden = [];
	for (let i=0; i < hidden.length; i++) {
		if (hidden[i] == guess[i]) {
			full_matches++;
		} else {
			unmatched_guess.push(guess[i]);
			unmatched_hidden.push(hidden[i]);
		}
	}

	// Each dot in the guess can only contribute one half-match at most
	for (let i=0; i < unmatched_hidden.length; i++) {
		if (unmatched_guess.includes(unmatched_hidden[i])) {
			half_matches++;
			// The half-matched dot is removed because a color match has been found
			unmatched_guess.splice(unmatched_guess.indexOf(unmatched_hidden[i]), 1);
		}
	}

	return [full_matches, half_matches];
}

eliminate = function(guess, response) { // Gives all codes eliminated by a response
	var eliminated = [];

	// Response mismatch means a remaining code can't be the hidden one
	for (let i=0; i < remaining_codes.length; i++) {
		if (!matches(response, respond(guess, remaining_codes[i]))) {
			eliminated.push(remaining_codes[i]);
		}
	}

	return eliminated;
}

submit = function(code) { // Submits a guess code
	var response = respond(code);
	var eliminated = eliminate(code, response);

	// Remaining possible secrets codes after this guess are determined
	var remaining = [];
	for (let i=0; i < remaining_codes.length; i++) {
		if (!eliminated.includes(remaining_codes[i])) {
			remaining.push(remaining_codes[i]);
		}
	}
	remaining_codes = remaining;

	// The previous_guess and it's response is shown
	var previous_guess = document.createElement("div");

	// The guess is shown at the top
	var guessed_code = document.createElement("div");
	for (let i=0; i < code.length; i++) {
		guessed_code.appendChild(make_dot(code[i]));
	}
	previous_guess.appendChild(guessed_code);

	// The response to the guess is shown below
	var guess_response = document.createElement("div");
	guess_response.setAttribute("class", "response");
	guess_response.innerHTML += "<strong>" + response[0] + "</strong> right color/place | ";
	guess_response.innerHTML += "<strong>" + response[1] + "</strong> right color, wrong place";
	previous_guess.appendChild(guess_response);

	// The response to the guess is shown
	previous.appendChild(previous_guess);

	if (matches(secret, code)) { // The correct code was named
		// The gray question mark dots are replaced with the correct response
		clear_tag(secret_code);
		for (let i=0; i < code.length; i++) {
			secret_code.appendChild(make_dot(secret[i]));
		}

		// Then the question "Can you guess the code?" is changed to "Success!"
		banner.innerText = "Success!";

	}
}

make_all_codes = function make_all_codes(base=null) { // Provides all possible codes
	if (base == null) { // This is the first time through this function
		base = []
		for (let i=0; i < colors.length; i++) {
			base.push([colors[i]]);
		}
	} else { // This is recursion in this function
		var longer = [];
		for (let i=0; i < base.length; i++) { // For each base array
			for (let j=0; j < colors.length; j++) { // Add another array with the next color at the end
				longer.push(base[i].concat([colors[j]]));
			}
		}
		base = longer;
	}

	// If the arrays need to be longer, continue recursion
	if (base[0].length < number) {
		return make_all_codes(base);
	} else { // Otherwise, return the result
		return base;
	}
}

make_all_responses = function make_all_responses() { // Provides all possible reponses
	// Every combination of full and half matches smaller than number is produced
	var responses = [];
	for (let i=0; i <= number; i++) {
		for (let j=0; i + j <= number; j++) {
			responses.push([i, j]);
		}
	}
	return responses;
}

random = function() { // Provides a random code of colors
	choose = function(choices) { // Picks a random element choices
		return choices[Math.floor(Math.random() * choices.length)];
	}

	// A result filled with random elements from colors is returned
	var result = [];
	while (result.length < number) {
		result = result.concat(choose(colors));
	}
	return result;
}

ai = function() { // Artificial intelligence that plays the game
	// Start with assuming the first in the list is best, but look for something better
	var guess = remaining_codes[0];
	var best = 1;

	for (let i=0; i < all_codes.length; i++) { // Each potential code is checked
		var eliminations = [];
		for (let j=0; j < all_responses.length; j++) { // against each potential response
			eliminations.push(eliminate(all_codes[i], all_responses[j]).length);
		}
		if (Math.min(...eliminations) > best) { // and the code with the best minimum is found
			guess = all_codes[i];
			best = Math.min(...eliminations);
		}
	}

	// The code with the best guaranteed elimination rate is submitted
	submit(guess);
}

reset = function reset() {
	// Everything from the last game is cleared out
	clear_tag(secret_code);
	clear_tag(previous);
	clear_tag(guess);
	clear_tag(menu);

	// Everything for the new game is setup
	secret = random();
	all_codes = make_all_codes();
	remaining_codes = make_all_codes();
	all_responses = make_all_responses();
	
	// The banner is reset
	banner.innerText = "Can you guess the code?";

	// Dummy question marks are put in place of the secret code
	for (let i=0; i < number; i++) {
		var dot = make_dot("gray", "dots");
		dot.appendChild(document.createTextNode("?"));
		secret_code.appendChild(dot);
	}

	// The empty circles for the guess are prepared by using clear
	clear();

	// The colored circles to click when making a guess are added
	var click_dots = document.createElement("div");
	for (let i=0; i < number; i++) {
		var dot = make_dot(colors[i]);
		dot.addEventListener("click", function () {
			add_to_guess(colors[i]);
		})
		click_dots.appendChild(dot);
	}
	menu.appendChild(click_dots);

	// Buttons are created
	var submit_button = document.createElement("button");
	submit_button.addEventListener("click", function () {
		// Submits the current guess
		submit(code);
		clear();
	});
	submit_button.appendChild(document.createTextNode("Submit"));
	menu.appendChild(submit_button);
	
	var clear_button = document.createElement("button");
	clear_button.addEventListener("click", clear);
	clear_button.appendChild(document.createTextNode("Clear"));
	menu.appendChild(clear_button);

	var ai_button = document.createElement("button");
	ai_button.addEventListener("click", ai);
	ai_button.appendChild(document.createTextNode("A.I."));
	menu.appendChild(ai_button);

	var new_game_button = document.createElement("button");
	new_game_button.addEventListener("click", reset);
	new_game_button.appendChild(document.createTextNode("New Game"));
	menu.appendChild(new_game_button);
}

// The game is started
reset();
