import _ from 'lodash';
import { ipcRenderer } from 'electron';
import { DAWG_AI } from '../utils/AI';
import { generateRandomRacks, getValidMoves, validateMove, refillRack } from '../utils/scrabble';

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
export const TOGGLE_THONKING = 'THONNKKING';

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

	setTimeout(() => dispatch(runAi()), 10);
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
		const { table, tableHistory, offset, racks, currentPlayer, sack, picked, points, started } = scrabble;

		if (!started) {
			return;
		}

		const newRacks = _.cloneDeep(racks);

		const valid_move = getValidMoves(tableHistory[offset + 1], table);
		if (valid_move.length > 0) {
			const newPoint = points[currentPlayer] + valid_move.reduce((acc, word) => acc + word.length, 0);
			const { rack, newSack } = refillRack(newRacks[currentPlayer], picked[currentPlayer], sack);
			newRacks[currentPlayer] = rack;

			dispatch(updateOffset());
			dispatch(setRacks(newRacks));
			dispatch(setSack(newSack));
			dispatch(emptyPicked());
			dispatch(setPoint(currentPlayer, newPoint));
			dispatch(changeTurn());
			setTimeout(() => dispatch(runAi()), 10);
		} else {
			alert('NOT VALID');
		}
	};
};

export const swapRack = () => (dispatch, getState) => {
	const { scrabble } = getState();
	const { sack, racks, currentPlayer, tableHistory, offset } = scrabble;

	const newRacks = _.cloneDeep(racks);
	newRacks[currentPlayer].forEach((el) => sack[el]++);
	const { rack, newSack } = refillRack(newRacks[currentPlayer], [ 0, 1, 2, 3, 4, 5, 6 ], sack);

	dispatch(setRacks(newRacks));
	dispatch(setSack(newSack));

	while (offset + 1 !== tableHistory.length) {
		dispatch(undoTable());
	}
	dispatch(changeTurn());
	setTimeout(() => dispatch(runAi()), 10);
};

const runAi = () => async (dispatch, getState) => {
	const { scrabble } = getState();
	const { aiTurns, currentPlayer, table, racks, picked } = scrabble;
	const otherPlayer = (currentPlayer + 1) % 2;

	if (aiTurns.includes(currentPlayer)) {
		dispatch(thonking());
		await sleep(10);
		const best = DAWG_AI.best(table, racks[currentPlayer], racks[otherPlayer]);
		dispatch(thonking());

		// console.log(table, racks);
		// console.log(currentPlayer, best);
		let tmp = table;
		if (best.length > 0) {
			const promises = best.forEach((word) => {
				const [ char, row, column ] = word;
				const newTable = _.cloneDeep(tmp);
				if (!newTable[row][column]) {
					const rackIndex = racks[currentPlayer].reduce((acc, el, index) => {
						if (acc > -1) {
							return acc;
						}

						return char === el ? index : acc;
					}, -1);
					newTable[row][column] = char;
					tmp = newTable;

					dispatch(setPicked(currentPlayer, [ rackIndex ]));
					dispatch(setTable(newTable));
				}
			});

			dispatch(submit());
		} else {
			if (racks[currentPlayer].length < 7) {
				alert('NO MORE MOVE FOR ME');
			} else {
				dispatch(swapRack());
			}
		}
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

export const thonking = () => ({
	type: TOGGLE_THONKING
});

const sleep = (n) => new Promise((resolve) => setTimeout(resolve, n));
