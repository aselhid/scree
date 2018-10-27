import _ from 'lodash';

export const START_GAME = 'scrabble/START_GAME';
export const SET_SACK = 'scrabble/SET_SACK';
export const SET_RACKS = 'scrabble/SET_RACKS';
export const SET_TABLE = 'scrabble/SET_TABLE';
export const SET_PICKED = 'scrabble/SET_PICKED';
export const UNDO_TABLE = 'scrabble/UNDO_TABLE';

const startGame = () => ({
	type: START_GAME
});

export const setSack = (sack) => ({
	type: SET_SACK,
	sack
});

export const setRacks = (racks) => ({
	type: SET_RACKS,
	racks
});

export const setTable = (table) => ({
	type: SET_TABLE,
	table
});

export const setPicked = (index, picked) => ({
	type: SET_PICKED,
	index,
	picked
});

export const initGame = (playerCount) => {
	return (dispatch, getState) => {
		const { scrabble } = getState();
		const { sack, racks } = generateRandomRacks(scrabble.sack, playerCount);

		dispatch(startGame());
		dispatch(setSack(sack));
		dispatch(setRacks(racks));
		Array(playerCount).keys().forEach((i) => {
			dispatch(setPicked(i, []));
		});
	};
};

export const putTileOnTable = (i, j, char) => {
	return (dispatch, getState) => {
		const { scrabble } = getState();
		const table = _.cloneDeep(scrabble.table);

		if (!!!table[i][j]) {
			table[i][j] = char;

			dispatch(setTable(table));
		}
	};
};

const generateRandomRacks = (sack, playerCount) => {
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

export const undoTable = () => ({
	type: UNDO_TABLE
});
