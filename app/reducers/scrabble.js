import _ from 'lodash';
import {
	SET_SACK,
	SET_RACKS,
	SET_TABLE,
	SET_PICKED,
	SET_POINT,
	TOGGLE_AI_TURN,
	START_GAME,
	UNDO_TABLE,
	UPDATE_OFFSET,
	CHANGE_TURN,
	EMPTY_PICKED,
	TOGGLE_THONKING,
	SURRENDER,
	END_GAME
} from '../actions/scrabble';
import { TABLE_COL, TABLE_ROW, uniq } from '../utils/scrabble';

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
	points: [],
	aiTurns: [],
	surrendered: [],
	currentPlayer: 0,
	table: emptyTable,
	tableHistory: [],
	offset: -1,
	started: false,
	thonking: false,
	endGame: false
};

export default function scrabbleReducer(state = initialState, action) {
	let tableHistory, sack, racks, table, picked, points, aiTurns, offset, currentPlayer;

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
		case SET_POINT:
			points = [ ...state.points ];
			points[action.index] = action.point;
			return { ...state, points };
		case TOGGLE_AI_TURN:
			aiTurns = state.aiTurns.includes(action.turn)
				? state.aiTurns.filter((el) => el !== action.turn)
				: state.aiTurns.concat([ action.turn ]);
			return { ...state, aiTurns };
		case UNDO_TABLE:
			tableHistory = [ ...state.tableHistory ];
			picked = [ ...state.picked ];
			offset = state.offset;
			table = state.table;

			if (state.picked[state.currentPlayer].length > 0) {
				table =
					picked[state.currentPlayer].length === tableHistory.length - offset - 1
						? tableHistory.pop()
						: table;
				picked[state.currentPlayer] = picked[state.currentPlayer].slice(0, -1);
			}
			return { ...state, tableHistory, table, picked };
		case UPDATE_OFFSET:
			offset = state.tableHistory.length - 1;
			return { ...state, offset };
		case CHANGE_TURN:
			currentPlayer = (state.currentPlayer + 1) % state.racks.length;
			return { ...state, currentPlayer };
		case EMPTY_PICKED:
			picked = [ ...state.picked ];
			picked[state.currentPlayer] = [];
			return { ...state, picked };
		case TOGGLE_THONKING:
			return { ...state, thonking: !state.thonking };
		case SURRENDER:
			return { ...state, surrendered: uniq([ ...state.surrendered, state.currentPlayer ]) };
		case END_GAME:
			return { ...state, endGame: true };
		default:
			return state;
	}
}
