import _ from 'lodash';
import { generateRandomRacks, validateTable, validateMove, refillRack } from '../utils/scrabble';

export const START_GAME = 'scrabble/START_GAME';
export const SET_SACK = 'scrabble/SET_SACK';
export const SET_RACKS = 'scrabble/SET_RACKS';
export const SET_TABLE = 'scrabble/SET_TABLE';
export const SET_PICKED = 'scrabble/SET_PICKED';
export const UNDO_TABLE = 'scrabble/UNDO_TABLE';
export const UPDATE_OFFSET = 'scrabble/UPDATE_OFFSET';
export const CHANGE_TURN = 'scrabble/CHANGE_TURN';
export const EMPTY_PICKED = 'scrabble/EMPTY_PICKED';

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
		[ ...Array(playerCount).keys() ].forEach((i) => {
			dispatch(setPicked(i, []));
		});
	};
};

export const putTileOnTable = (i, j, char) => {
	return (dispatch, getState) => {
		const { scrabble } = getState();
		const table = _.cloneDeep(scrabble.table);

		if (!table[i][j]) {
			table[i][j] = char;

			dispatch(setTable(table));
		}
	};
};

export const undoTable = () => ({
	type: UNDO_TABLE
});

export const submit = () => {
	return (dispatch, getState) => {
		const { scrabble } = getState();
		const { table, tableHistory, offset, racks, currentPlayer, sack, picked } = scrabble;

		// console.log(validateTable(tableHistory[offset + 1], table));
		if (validateTable(tableHistory[offset + 1], table)) {
			const { rack, newSack } = refillRack(racks[currentPlayer], picked[currentPlayer], sack);
			racks[currentPlayer] = rack;

			dispatch(updateOffset());
			dispatch(setRacks(racks));
			dispatch(setSack(newSack));
			dispatch(emptyPicked());
			dispatch(changeTurn());
		}
	};
};

export const updateOffset = () => ({
	type: UPDATE_OFFSET
});

export const changeTurn = () => ({
	type: CHANGE_TURN
});

export const emptyPicked = () => ({
	type: EMPTY_PICKED
});
