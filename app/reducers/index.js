// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import scrabbleReducer from './scrabble';

export default function createRootReducer(history: {}) {
	const routerReducer = connectRouter(history)(() => {});

	return connectRouter(history)(combineReducers({ router: routerReducer, scrabble: scrabbleReducer }));
}
