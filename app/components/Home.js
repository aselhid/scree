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
			aiTurns: []
		};

		this.onTileClicked = this.onTileClicked.bind(this);
		this.onRackClicked = this.onRackClicked.bind(this);
		this.onCheckboxChange = this.onCheckboxChange.bind(this);
	}

	onTileClicked(i, j) {
		const { putTileOnTable, scrabble } = this.props;
		const { picked, currentPlayer, offset, tableHistory, racks } = scrabble;
		const currentPicked = picked[currentPlayer];
		const picking = currentPicked.length !== tableHistory.length - offset - 1;
		const pickedChar = racks[currentPlayer][currentPicked[currentPicked.length - 1]];

		if (picking) {
			putTileOnTable(i, j, pickedChar);
		}
	}

	onRackClicked(i) {
		const { scrabble, setPicked } = this.props;
		const { picked, currentPlayer, offset, tableHistory } = scrabble;
		const picking = picked[currentPlayer].length !== tableHistory.length - offset - 1;

		return (ri, char) => {
			if (!picking) {
				setPicked(i, [ ri ]);
			}
		};
	}

	onCheckboxChange(evt) {
		const value = parseInt(evt.target.value);
		this.props.toggleAiTurn(value);
	}

	render() {
		const { racks, table, started, currentPlayer, picked, points } = this.props.scrabble;
		const { undoTable, submit, initGame, swapRack } = this.props;

		return (
			<div>
				{started && (
					<div>
						<Table table={table} callback={this.onTileClicked} />
						<button onClick={undoTable}>Undo</button>
						<button onClick={swapRack}>Swap</button>
						<button onClick={submit}>Submit</button>
						{points.map((point, index) => (
							<h3 key={`label-${index}`}>
								Pemain {index} : {point}
							</h3>
						))}
						{racks ? (
							racks.map((rack, i) => (
								<Rack
									rack={rack}
									callback={this.onRackClicked(i)}
									activeRack={currentPlayer === i}
									picked={picked[i]}
									key={`rack-${i}`}
								/>
							))
						) : null}
					</div>
				)}
				{!started && (
					<div>
						<label htmlFor="turn1">Turn 1</label>
						<input id="turn1" type="checkbox" name="Turn 1" value="0" onChange={this.onCheckboxChange} />
						<label htmlFor="turn2">Turn 2</label>
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
