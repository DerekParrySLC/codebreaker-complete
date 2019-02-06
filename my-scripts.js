// Dot colors
colors = ["red", "green", "blue", "yellow",];

// Number of dots in a code
number = 4;

// Parts of the web page
banner = document.getElementById("banner");
secret_code = document.getElementById("secret_code");
previous = document.getElementById("previous");
guess = document.getElementById("guess");
menu = document.getElementById("menu");

secret = []; // The secret code
code = []; // The guess being built
guess_dots = []; // Dots that show the guess being built
remaining_codes = []; // Codes that haven't been eliminated

clear_tag = function(tag) { // Clears all children from an HTML tag
	while (tag.firstChild) {
		tag.removeChild(tag.firstChild);
	}
}

matches = function(a, b) { // Checks if two arrays match perfectly
		if (a.length !== b.length) {
			return false;
		}

		// After this loop, equals is true if all elements of the array are equal
		let equals = true;
		for (let i=0; i < a.length; i++) {
			equals = equals && (a[i] == b[i]);
		}
		return equals;
	}

make_dot = function(color=colors[0], html_class="dot") { // Makes dot of given class
	let dot = document.createElement("span");
	dot.classList.add(html_class);
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
		let dot = make_dot("white", "empty");
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

	let full_matches = 0;
	let half_matches = 0;

	// Anything that is not a full-match is saved to review for half-matches
	let unmatched_guess = [];
	let unmatched_hidden = [];
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
	let eliminated = [];

	// Response mismatch means a remaining code can't be the hidden one
	for (let i=0; i < remaining_codes.length; i++) {
		if (!matches(response, respond(guess, remaining_codes[i]))) {
			eliminated.push(remaining_codes[i]);
		}
	}

	return eliminated;
}

function submit(code) { // Submits a guess code
	let response = respond(code);
	let eliminated = eliminate(code, response);

	// Remaining possible secrets codes after this guess are determined
	let remaining = [];
	for (let i=0; i < remaining_codes.length; i++) {
		if (!eliminated.includes(remaining_codes[i])) {
			remaining.push(remaining_codes[i]);
		}
	}
	remaining_codes = remaining;

	// The previous_guess and it's response is shown
	let previous_guess = document.createElement("div");

	// The guess is shown at the top
	let guessed_code = document.createElement("div");
	for (let i=0; i < code.length; i++) {
		guessed_code.appendChild(make_dot(code[i]));
	}
	previous_guess.appendChild(guessed_code);

	// The response to the guess is shown below
	let guess_response = document.createElement("div");
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

	// The guess is cleared
	clear();
}

make_all_codes = function make_all_codes(base=null) { // Provides all possible codes
	if (base == null) { // This is the first time through this function
		base = []
		for (let i=0; i < colors.length; i++) {
			base.push([colors[i]]);
		}
	} else { // This is recursion in this function
		let longer = [];
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
	let responses = [];
	for (let i=0; i <= number; i++) {
		for (let j=0; i + j <= number; j++) {
			responses.push([i, j]);
		}
	}
	return responses;
}

random = function() { // Provides a random code of colors
	choose = function(choices) { // Picks a random element from choices
		return choices[Math.floor(Math.random() * choices.length)];
	}

	// An array of random colors is returned
	let result = [];
	while (result.length < number) {
		result[result.length] = choose(colors);
	}
	return result;
}

ai = function() { // Game playing artificial intelligence
	// The first remaining code will win or at least eliminate itself
	let guess = remaining_codes[0];
	let best = 1;

	for (let i=0; i < all_codes.length; i++) { // Each potential code is checked
		let eliminations = [];

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
		let dot = make_dot("gray", "dots");
		dot.appendChild(document.createTextNode("?"));
		secret_code.appendChild(dot);
	}

	// The empty circles for the guess are prepared by using clear
	clear();

	// The colored circles to click when making a guess are added
	let click_dots = document.createElement("div");
	for (let i=0; i < colors.length; i++) {
		let dot = make_dot(colors[i]);
		dot.onclick = function () {add_to_guess(colors[i]);};
		click_dots.appendChild(dot);
	}
	menu.appendChild(click_dots);

	// Buttons are created
	let submit_button = document.createElement("button");
	submit_button.onclick = function () {submit(code);};
	submit_button.appendChild(document.createTextNode("Submit"));
	menu.appendChild(submit_button);
	
	let clear_button = document.createElement("button");
	clear_button.onclick = clear;
	clear_button.appendChild(document.createTextNode("Clear"));
	menu.appendChild(clear_button);

	let ai_button = document.createElement("button");
	ai_button.onclick = ai;
	ai_button.appendChild(document.createTextNode("A.I."));
	menu.appendChild(ai_button);

	let new_game_button = document.createElement("button");
	new_game_button.onclick = reset;
	new_game_button.appendChild(document.createTextNode("New Game"));
	menu.appendChild(new_game_button);
}

// The game is started
reset();
