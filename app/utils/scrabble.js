import _ from 'lodash';

export const TABLE_ROW = 15;
export const TABLE_COL = 15;

export const generateRandomRacks = (sack, playerCount) => {
	const racks = [];

	for (let i = 0; i < playerCount; i++) {
		const chars = Object.keys(sack);
		const rack = [];

		for (let j = 0; j < 7; j++) {
			while (true) {
				const randomChar = _.sample(chars);

				if (sack[randomChar] > 0) {
					rack.push(randomChar);
					sack[randomChar]--;
					break;
				}
			}
		}

		racks.push(rack);
	}

	return { sack, racks };
};

export const validateTable = (table_before, table_after) => {
	const flooded = flood(table_after, Math.floor(TABLE_ROW / 2), Math.floor(TABLE_COL / 2));

	const flat_table_after = _.flatten(table_after);
	const new_chars_index = getNewCharsIndex(table_before, table_after);

	const connected_to_mid = flat_table_after.reduce(
		(acc, next, index) => acc && (next ? flooded.includes(index) : true),
		true
	);
	const one_axis = isOneAxis(new_chars_index);

	if (new_chars_index.length === 0 || !connected_to_mid || !one_axis) {
		return false;
	}

	const played_words = getPlayedWords(new_chars_index, table_after);
	console.log(played_words);
	return true;
	// return played_words.reduce((acc, element) => acc || valid_word(element), false);
};

// cek kondisi ketika sack habis
export const refillRack = (rack, picked, sack) => {
	const chars = Object.keys(sack);

	picked.forEach((index) => {
		const random_char = _.sample(chars);

		rack[index] = random_char;
		sack[random_char]--;
	});

	return { rack, newSack: sack };
};

const flood = (table, i, j) => {
	const flooded = [];

	const queue = [ coordToIndex(i, j) ];
	while (queue.length > 0) {
		let current_index = queue.pop();
		let [ current_i, current_j ] = indexToCoord(current_index);

		try {
			if (!flooded.includes(current_index) && table[current_i][current_j]) {
				flooded.push(current_index);

				queue.push(
					coordToIndex(current_i - 1, current_j),
					coordToIndex(current_i + 1, current_j),
					coordToIndex(current_i, current_j - 1),
					coordToIndex(current_i, current_j + 1)
				);
			}
		} catch (error) {}
	}

	return flooded;
};

const getNewCharsIndex = (table_before, table_after) => {
	return [ ...Array(225).keys() ].filter((element, index) => {
		const [ i, j ] = indexToCoord(index);

		return !table_before[i][j] && !!table_after[i][j];
	});
};

const isOneAxis = (new_chars) => {
	const averages = new_chars.reduce(
		(acc, index) => {
			const [ i, j ] = indexToCoord(index);

			return [ acc[0] + i / new_chars.length, acc[1] + j / new_chars.length ];
		},
		[ 0, 0 ]
	);

	return indexToCoord(new_chars[0]).reduce((acc, next, index) => acc || next === averages[index], false);
};

const getPlayedWords = (new_chars_index, table) => {
	const played_words = [];

	new_chars_index.forEach((element) => {
		const vertical = [];
		const horizontal = [];

		const queue = [ element ];
		while (queue.length > 0) {
			let current_index = queue.pop();
			let [ current_i, current_j ] = indexToCoord(current_index);

			try {
				if (!vertical.includes(current_index) && table[current_i][current_j]) {
					vertical.push(current_index);

					queue.push(coordToIndex(current_i - 1, current_j), coordToIndex(current_i + 1, current_j));
				}
			} catch (error) {}
		}

		queue.push(element);
		while (queue.length > 0) {
			let current_index = queue.pop();
			let [ current_i, current_j ] = indexToCoord(current_index);

			try {
				if (!horizontal.includes(current_index) && table[current_i][current_j]) {
					horizontal.push(current_index);

					queue.push(coordToIndex(current_i, current_j - 1), coordToIndex(current_i, current_j + 1));
				}
			} catch (error) {}
		}

		if (vertical.length > 1) {
			played_words.push(vertical.sort((a, b) => a - b));
		}

		if (horizontal.length > 1) {
			played_words.push(horizontal.sort((a, b) => a - b));
		}
	});

	return uniq(played_words).map((element) =>
		element
			.map((index) => {
				const [ i, j ] = indexToCoord(index);

				return table[i][j];
			})
			.join('')
	);
};

const uniq = (a) => {
	const seen = {};

	return a.filter((element) => (seen.hasOwnProperty(element) ? false : (seen[element] = true)));
};

const coordToIndex = (x, y) => x * 15 + y;

const indexToCoord = (index) => [ Math.floor(index / TABLE_ROW), index % TABLE_ROW ];