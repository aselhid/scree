import _ from 'lodash';
import AI from '../utils/AI';
import { generateRandomRacks, getValidMoves, validateMove, refillRack } from '../utils/scrabble';
import { dawg_dictionary } from '../utils/scrabble';

const DAWG_AI = new AI(dawg_dictionary);

export const START_GAME = 'scrabble/START_GAME';
export const SET_SACK = 'scrabble/SET_SACK';
export const SET_RACKS = 'scrabble/SET_RACKS';
export const SET_TABLE = 'scrabble/SET_TABLE';
export const SET_PICKED = 'scrabble/SET_PICKED';
export const SET_POINT = 'scrabble/SET_POINT';
export const TOGGLE_AI_TURN = 'scrabble/TOGGLE_AI_TURN';
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

export const setPoint = (index, point) => ({
	type: SET_POINT,
	index,
	point
});

export const toggleAiTurn = (turn) => ({
	type: TOGGLE_AI_TURN,
	turn
});

export const initGame = (playerCount) => (dispatch, getState) => {
	const { scrabble } = getState();
	const { sack, racks } = generateRandomRacks(scrabble.sack, playerCount);

	dispatch(setSack(sack));
	dispatch(setRacks(racks));
	[ ...Array(playerCount).keys() ].forEach((i) => {
		dispatch(setPicked(i, []));
		dispatch(setPoint(i, 0));
	});
	dispatch(startGame());
	dispatch(runAi());
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
		const { table, tableHistory, offset, racks, currentPlayer, sack, picked, points } = scrabble;

		const valid_move = getValidMoves(tableHistory[offset + 1], table);
		if (valid_move.length > 0) {
			const newPoint = points[currentPlayer] + valid_move.reduce((acc, word) => acc + word.length, 0);
			const { rack, newSack } = refillRack(racks[currentPlayer], picked[currentPlayer], sack);
			racks[currentPlayer] = rack;

			dispatch(updateOffset());
			dispatch(setRacks(racks));
			dispatch(setSack(newSack));
			dispatch(emptyPicked());
			dispatch(changeTurn());
			dispatch(setPoint(currentPlayer, newPoint));
			dispatch(runAi());
		} else {
			alert('NOT VALID');
		}
	};
};

const runAi = () => (dispatch, getState) => {
	const { scrabble } = getState();
	const { aiTurns, currentPlayer, table, racks } = scrabble;
	const otherPlayer = (currentPlayer + 1) % 2;

	if (aiTurns.includes(currentPlayer)) {
		const best = DAWG_AI.best(table, racks[currentPlayer], racks[otherPlayer]);

		best.forEach((element) => {
			console.log(element);
		});
	}
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
