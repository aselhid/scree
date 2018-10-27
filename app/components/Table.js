// @flow
import React, { Component } from 'react';
import styles from './Table.css';

export default class Table extends Component {
	render() {
		const { table, callback } = this.props;

		return (
			<div className={styles.tableContainer}>
				{table.map((row, i) => (
					<div className={styles.row}>
						{row.map((column, j) => (
							<div
								className={`${styles.tile} ${i == 7 && j == 7 && styles.blue} ${column
									? styles.brown
									: ''}`}
								onClick={() => callback(i, j)}
							>
								<h2>{column}</h2>
							</div>
						))}
					</div>
				))}
			</div>
		);
	}
}
