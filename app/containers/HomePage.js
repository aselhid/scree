// @flow
import Home from '../components/Home';
import { connect } from 'react-redux';
import { initGame, putTileOnTable, undoTable, setPicked, submit, toggleAiTurn } from '../actions/scrabble';

function mapStateToProps(state) {
	return {
		scrabble: state.scrabble
	};
}

function mapDispatchToProps(dispatch) {
	return {
		initGame: (playerCount) => dispatch(initGame(playerCount)),
		putTileOnTable: (i, j, char) => dispatch(putTileOnTable(i, j, char)),
		undoTable: () => dispatch(undoTable()),
		setPicked: (index, picked) => dispatch(setPicked(index, picked)),
		submit: () => dispatch(submit()),
		toggleAiTurn: (turn) => dispatch(toggleAiTurn(turn))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
