import _ from 'lodash';
import { SET_SACK, SET_RACKS, SET_TABLE, SET_PICKED, START_GAME, UNDO_TABLE, UPDATE_OFFSET } from '../actions/scrabble';
import { TABLE_COL, TABLE_ROW } from '../utils/scrabble';

const emptyTable = [ ...Array(TABLE_ROW).keys() ].map((e) => [ ...Array(TABLE_COL).keys() ].map((f) => null));

const indoLetterDistribution = {
	a: 21,
	b: 4,
	c: 3,
	d: 4,
	e: 8,
	f: 1,
	g: 3,
	h: 2,
	i: 8,
	j: 1,
	k: 3,
	l: 3,
	m: 3,
	n: 9,
	o: 3,
	p: 2,
	r: 4,
	s: 3,
	t: 5,
	u: 5,
	v: 1,
	w: 1,
	y: 2,
	z: 1
};

const initialState = {
	sack: indoLetterDistribution,
	racks: [],
	picked: [],
	currentPlayer: 0,
	table: emptyTable,
	tableHistory: [],
	offset: -1,
	started: false
};

export default function scrabbleReducer(state = initialState, action) {
	let tableHistory, sack, racks, table, picked;

	switch (action.type) {
		case START_GAME:
			return { ...state, started: true };
		case SET_SACK:
			sack = action.sack;
			return { ...state, sack };
		case SET_RACKS:
			racks = action.racks;
			return { ...state, racks };
		case SET_TABLE:
			table = action.table;
			tableHistory = [ ...state.tableHistory, state.table ];
			return { ...state, table, tableHistory };
		case SET_PICKED:
			picked = [ ...state.picked ];
			picked[action.index] = picked[action.index] ? picked[action.index].concat(action.picked) : action.picked;
			return { ...state, picked };
		case UNDO_TABLE:
			tableHistory = [ ...state.tableHistory ];
			picked = [ ...state.picked ];
			table = state.table;

			if (state.picked[state.currentPlayer].length > 0) {
				picked[state.currentPlayer] = picked[state.currentPlayer].slice(0, -1);
				table = tableHistory.pop();
			}
			return { ...state, tableHistory, table, picked };
		case UPDATE_OFFSET:
			tableHistory = state.tableHistory;
			return { ...state, offset: tableHistory.length - 1 };
		default:
			return state;
	}
}
