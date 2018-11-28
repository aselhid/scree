// @flow
import React, { Component } from 'react';
import { remote } from 'electron';
import styles from './Home.css';
import Table from '../components/Table';
import Rack from '../components/Rack';
import Thonking from '../tenor2.gif';

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
		const {
			racks,
			table,
			started,
			currentPlayer,
			picked,
			points,
			aiTurns,
			thonking,
			endGame
		} = this.props.scrabble;
		const { undoTable, submit, initGame, swapRack } = this.props;

		const currentlyAi = aiTurns.includes(currentPlayer);
		const loadingClass = thonking ? styles.thonking : styles.hidden;
		return (
			<div className={styles.container}>
				<img src={Thonking} className={loadingClass} />
				{started &&
				!endGame && (
					<div>
						<Table table={table} callback={this.onTileClicked} />
						<div className={styles.buttonsContainer}>
							<h3>{`${points[0]} : ${points[1]}`}</h3>
							<div>
								<button onClick={() => remote.getCurrentWindow().reload()}>Restart</button>
								<button onClick={this.props.surrender}>Surrender</button>
								<button disabled={currentlyAi} onClick={undoTable}>
									Undo
								</button>
								<button onClick={swapRack}>Swap</button>
								<button disabled={currentlyAi} onClick={submit}>
									Submit
								</button>
							</div>
						</div>
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
				{!started &&
				!endGame && (
					<div className={`${styles.container} ${styles.startGame}`}>
						<h1 className={styles.title}>Scree</h1>
						<button
							className={`${styles.toggleAi} ${aiTurns.includes(0) ? styles.red : styles.yellow}`}
							onClick={() => this.props.toggleAiTurn(0)}
						>
							Player 1 : {aiTurns.includes(0) ? 'AI' : 'Human'}
						</button>
						<button
							className={`${styles.toggleAi} ${aiTurns.includes(1) ? styles.red : styles.yellow}`}
							onClick={() => this.props.toggleAiTurn(1)}
						>
							Player 2 : {aiTurns.includes(1) ? 'AI' : 'Human'}
						</button>
						<button
							className={`${styles.greenButton} ${styles.toggleAi}`}
							onClick={() => initGame(2)}
							disabled={started}
						>
							Start
						</button>
					</div>
				)}
				{endGame && <h1>Pemenangnya adalah {points[0] > points[1] ? 'Player 1' : 'Player 2'}</h1>}
			</div>
		);
	}
}
