// @flow
import React, { Component } from 'react';
import styles from './Home.css';
import Table from '../components/Table';
import Rack from '../components/Rack';

export default class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			playerCount: 2,
			pickedChar: null
		};

		this.onStartInputChange = this.onStartInputChange.bind(this);
		this.onTileClicked = this.onTileClicked.bind(this);
		this.onRackClicked = this.onRackClicked.bind(this);
	}

	onStartInputChange(evt) {
		this.setState({ playerCount: evt.target.value });
	}

	onTileClicked(i, j) {
		const { pickedChar } = this.state;
		const { putTileOnTable } = this.props;

		if (!!pickedChar) {
			putTileOnTable(i, j, pickedChar);
			this.setState({ pickedChar: null });
		}
	}

	onRackClicked(i) {
		return (ri, char) => {
			if (!this.state.pickedChar) {
				this.props.setPicked(i, [ ri ]);
				this.setState({ pickedChar: char });
			}
		};
	}

	render() {
		const { racks, table, started, currentPlayer, picked } = this.props.scrabble;
		const { initGame, undoTable } = this.props;
		const { playerCount } = this.state;

		return (
			<div>
				<Table table={table} callback={this.onTileClicked} />
				<input onChange={this.onStartInputChange} value={playerCount} />
				<button onClick={() => initGame(playerCount)} disabled={started}>
					Start
				</button>
				<button onClick={undoTable}>Undo</button>
				<button>Submit</button>
				{racks ? (
					racks.map((rack, i) => (
						<Rack
							rack={rack}
							callback={this.onRackClicked(i)}
							activeRack={currentPlayer === i}
							picked={picked[i]}
						/>
					))
				) : null}
			</div>
		);
	}
}
