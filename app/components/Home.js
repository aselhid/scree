// @flow
import React, { Component } from 'react';
import styles from './Home.css';
import Table from '../components/Table';
import Rack from '../components/Rack';
import { dawg_dictionary } from '../utils/scrabble';

export default class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			playerCount: 2,
			pickedChar: null,
			aiTurns: []
		};

		this.onTileClicked = this.onTileClicked.bind(this);
		this.onRackClicked = this.onRackClicked.bind(this);
		this.onCheckboxChange = this.onCheckboxChange.bind(this);
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

	onCheckboxChange(evt) {
		const value = parseInt(evt.target.value);
		this.props.toggleAiTurn(value);
	}

	render() {
		const { racks, table, started, currentPlayer, picked, points } = this.props.scrabble;
		const { undoTable, submit, initGame } = this.props;
		const { playerCount } = this.state;

		return (
			<div>
				{started && (
					<div>
						<Table table={table} callback={this.onTileClicked} />
						<button onClick={undoTable}>Undo</button>
						<button onClick={submit}>Submit</button>
						{points.map((element, index) => (
							<h3>
								Pemain {index} : {element}
							</h3>
						))}
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
				)}
				{!started && (
					<div>
						<label for="turn1">Turn 1</label>
						<input id="turn1" type="checkbox" name="Turn 1" value="0" onChange={this.onCheckboxChange} />
						<label for="turn2">Turn 2</label>
						<input id="turn2" type="checkbox" name="Turn 2" value="1" onChange={this.onCheckboxChange} />
						<button onClick={() => initGame(2)} disabled={started}>
							Start
						</button>
					</div>
				)}
			</div>
		);
	}
}
