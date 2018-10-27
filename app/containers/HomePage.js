// @flow
import Home from '../components/Home';
import { connect } from 'react-redux';
import { initGame, putTileOnTable, undoTable } from '../actions/scrabble';

function mapStateToProps(state) {
	return {
		scrabble: state.scrabble
	};
}

function mapDispatchToProps(dispatch) {
	return {
		initGame: (playerCount) => dispatch(initGame(playerCount)),
		putTileOnTable: (i, j, char) => dispatch(putTileOnTable(i, j, char)),
		undoTable: () => dispatch(undoTable())
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
