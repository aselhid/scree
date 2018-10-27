import _ from 'lodash';
import { SET_SACK, SET_RACKS, SET_TABLE, START_GAME, UNDO_TABLE } from '../actions/scrabble';

const emptyTable = [
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
	[ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ]
];

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
	let tableHistory, sack, racks, table;

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
		case UNDO_TABLE:
			tableHistory = [ ...state.tableHistory ];
			table = tableHistory.length - 2 >= state.offset ? tableHistory.pop() : state.table;
			return { ...state, tableHistory, table };
		default:
			return state;
	}
}
