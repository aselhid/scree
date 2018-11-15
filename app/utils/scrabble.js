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
	const { filled, new_chars, averages } = flood(
		table_before,
		table_after,
		Math.floor(TABLE_ROW / 2),
		Math.floor(TABLE_COL / 2)
	);

	const flat_table = _.flatten(table_after);
	const mid_connected = flat_table.reduce((acc, next, index) => acc && (next ? filled.includes(index) : true), true);
	const one_axis = indexToCoord(new_chars[0]).reduce((acc, next, index) => acc || next == averages[index], false);

	if (new_chars.length == 0 || !mid_connected || !one_axis) {
		return false;
	}

	// const played_words = getPlayedWords(new_chars);

	// return played_words.reduce((acc, next) => acc || validWord(next), false);
	return true;

	// return (
	// flat_table.reduce((acc, next, index) => acc && (next ? filled.includes(index) : true), true) &&
	// new_chars.length > 0 &&
	// indexToCoord(new_chars[0]).reduce((acc, next, index) => acc || next == averages[index], false)
	// );
};

const validWord = (word) => true;

const flood = (table_before, table_after, i, j) => {
	const filled = [];
	const new_chars = [];
	let cum_new_i = 0;
	let cum_new_j = 0;

	const queue = [ coordToIndex(i, j) ];
	while (queue.length > 0) {
		let current_index = queue.pop();
		let [ cur_i, cur_j ] = indexToCoord(current_index);

		try {
			if (!filled.includes(current_index) && table_after[cur_i][cur_j]) {
				filled.push(current_index);

				if (!table_before[cur_i][cur_j] && table_after[cur_i][cur_j]) {
					new_chars.push(current_index);
					cum_new_i += cur_i;
					cum_new_j += cur_j;
				}

				queue.push(coordToIndex(cur_i - 1, cur_j));
				queue.push(coordToIndex(cur_i + 1, cur_j));
				queue.push(coordToIndex(cur_i, cur_j - 1));
				queue.push(coordToIndex(cur_i, cur_j + 1));
			}
		} catch (error) {}
	}
	new_chars.sort((a, b) => a - b);
	const averages = [ cum_new_i / new_chars.length, cum_new_j / new_chars.length ];

	return { filled, new_chars, averages };
};

// const getPlayedWords = (new_chars, averages) => {
// 	if (new_chars.length == 0) {
// 		return [];
// 	}
// 	const played_words = [];

// 	let direction = [[1, 0], [-1, 0]];
// 	if ()

// 	return played_words.map(element => element.sort((a, b) => a - b).join(''));
// }

const coordToIndex = (x, y) => x * 15 + y;

const indexToCoord = (index) => [ Math.floor(index / TABLE_ROW), index % TABLE_ROW ];
