// @flow
import React, { Component } from 'react';
import styles from './Rack.css';

export default class Rack extends Component {
	constructor(props) {
		super(props);

		this.onTileClicked = this.onTileClicked.bind(this);
	}

	onTileClicked(i, char) {
		const { callback, activeRack, picked } = this.props;

		if (activeRack && !picked.includes(i)) {
			callback(i, char);
		}
	}

	render() {
		const { rack, callback, activeRack, picked } = this.props;
		const trClass = !activeRack ? styles.transparent : '';

		return (
			<div className={styles.rackContainer}>
				{rack.map((char, i) => (
					<div
						className={`${styles.tile} ${trClass} ${picked.includes(i) ? styles.brown : ''}`}
						onClick={() => this.onTileClicked(i, char)}
						key={`rack-${i}`}
					>
						<h2>{char}</h2>
					</div>
				))}
			</div>
		);
	}
}
