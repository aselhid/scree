import { DawgIterator } from '../utils/Dawg';
import _ from 'lodash';

export default class AI {
	constructor(dawg) {
		this.dawg = dawg;
		this.possibleMoves; // 0: word, 1: x, 2: y, 3: score, 4: direction
		this.crossChecks;
		this.crossPoints;
		this.direction; // 0: horizontal, 1: vertical
		this.anchorX;
		this.anchorY;
	}

	best(table, myRack, foeRack) {
		// console.log('ai', table, myRack, foeRack);
		let moves = [];
		// generating accross moves
		moves = moves.concat(this.generateMoves(table, myRack, 0));
		// generating down moves;
		moves = moves.concat(this.generateMoves(this.transposeTable(table), myRack, 1));

		let optimumMove = [ '', -1, -1, -10000000, -1 ];
		let maxDifference = -10000000;
		for (let i = 0; i < moves.length; i++) {
			let enemyMoves = [];
			let newTable = this.fillTable(table, moves[i]);

			enemyMoves = enemyMoves.concat(this.generateMoves(newTable, foeRack, 0));
			enemyMoves = enemyMoves.concat(this.generateMoves(this.transposeTable(newTable), foeRack, 1));

			for (let j = 0; j < enemyMoves.length; j++) {
				if (moves[i][3] - enemyMoves[j][3] > maxDifference) {
					optimumMove = moves[i];
					maxDifference = moves[i][3] - enemyMoves[j][3];
				}
			}
		}

		const ans = this.toAnswer(optimumMove);
		// console.log(ans);
		return ans;
	}

	toAnswer(move) {
		let ans = [];
		if (move[4] == 0) {
			for (let i = 0; i < move[0].length; i++) {
				ans.push([ move[0][i], move[1], move[2] + i ]);
			}
		} else {
			for (let i = 0; i < move[0].length; i++) {
				ans.push([ move[0][i], move[1] + i, move[2] ]);
			}
		}
		return ans;
	}

	generateMoves(table, rack, direction) {
		this.possibleMoves = [];
		this.direction = direction;
		// iterasi setiap row
		for (let i = 0; i < 15; i++) {
			// nyari anchors
			let anchors = [];
			for (let j = 0; j < 15; j++) {
				if (table[i][j] != null) continue;
				if (
					(j - 1 >= 0 && table[i][j - 1] != null) ||
					(j + 1 < 15 && table[i][j + 1] != null) ||
					(i - 1 >= 0 && table[i - 1][j] != null) ||
					(i + 1 < 15 && table[i + 1][j] != null)
				) {
					anchors.push(j);
				}
			}
			// nyari crossChecks sama poin tambahannya kalo ngisi column itu
			this.crossChecks = [];
			this.crossPoints = [];
			for (let j = 0; j < 15; j++) this.crossChecks.push([]);
			for (let j = 0; j < 15; j++) this.crossPoints.push(0);
			for (let j = 0; j < 15; j++) {
				if (table[i][j] != null) continue;
				let up = this.traverseUp(table, i - 1, j);
				let down = this.traverseDown(table, i + 1, j);
				if (up != '' && down != '') {
					let iterator = new DawgIterator(this.dawg);
					for (let k = 0; k < up.length; k++) iterator.next(up[k]);
					let edges = iterator.listNext();
					for (let k = 0; k < edges.length; k++) {
						let traversor = _.clone(iterator);
						traversor.next(edges[k]);
						let valid = true;
						for (let l = 0; l < down.length; l++) {
							if (traversor.hasNext(down[l])) traversor.next(down[l]);
							else {
								valid = false;
								break;
							}
						}
						if (valid && traversor.getWord() != undefined) {
							this.crossChecks[j].push(edges[k]);
							this.crossPoints[j] = up.length + down.length + 1;
						}
					}
				} else if (up != '') {
					let iterator = new DawgIterator(this.dawg);
					for (let k = 0; k < up.length; k++) iterator.next(up[k]);
					let edges = iterator.listNext();
					for (let k = 0; k < edges.length; k++) {
						let traversor = _.clone(iterator);
						traversor.next(edges[k]);
						if (traversor.getWord() != undefined) {
							this.crossChecks[j].push(edges[k]);
							this.crossPoints[j] = up.length + 1;
						}
					}
				} else if (down != '') {
					let iterator = new DawgIterator(this.dawg);
					let edges = iterator.listNext();
					for (let k = 0; k < edges.length; k++) {
						let traversor = _.clone(iterator);
						traversor.next(edges[k]);
						let valid = true;
						for (let l = 0; l < down.length; l++) {
							if (traversor.hasNext(down[l])) traversor.next(down[l]);
							else {
								valid = false;
								break;
							}
						}
						if (valid && traversor.getWord() != undefined) {
							this.crossChecks[j].push(edges[k]);
							this.crossPoints[j] = down.length + 1;
						}
					}
				} else {
					for (let k = 97; k < 97 + 26; k++) {
						this.crossChecks[j].push(String.fromCharCode(k));
						this.crossPoints[j] = 0;
					}
				}
			}
			if (i == 7 && table[i][7] === null) anchors.push(7);
			// coba bikin kata dari semua anchor
			for (let j = 0; j < anchors.length; j++) {
				let limit = anchors[0];
				if (j != 0) limit = anchors[j] - anchors[j - 1] - 1;
				let iterator = new DawgIterator(this.dawg);
				if (anchors[j] - 1 >= 0 && table[i][anchors[j] - 1] != null)
					this.leftPartExisting(table, rack, i, anchors[j], iterator);
				else this.leftPart(table, rack, i, anchors[j], '', iterator, limit);
			}
		}
		return this.possibleMoves;
	}

	traverseUp(table, x, y) {
		if (x < 0) return '';
		if (table[x][y] == null) return '';
		return this.traverseUp(table, x - 1, y) + table[x][y];
	}

	traverseDown(table, x, y) {
		if (x >= 15) return '';
		if (table[x][y] == null) return '';
		return table[x][y] + this.traverseDown(table, x + 1, y);
	}

	traverseLeft(table, x, y) {
		if (y < 0) return '';
		if (table[x][y] == null) return '';
		return this.traverseLeft(table, x, y - 1) + table[x][y];
	}

	leftPartExisting(table, rack, x, y, node) {
		let left = this.traverseLeft(table, x, y - 1);
		for (let i = 0; i < left.length; i++) node.next(left[i]);
		this.anchorX = x;
		this.anchorY = y;
		this.extendRight(table, rack, x, y, left, node);
	}

	leftPart(table, rack, x, y, partialWord, node, limit) {
		this.anchorX = x;
		this.anchorY = y;
		this.extendRight(table, rack, x, y, partialWord, _.clone(node));
		if (limit > 0) {
			let edges = node.listNext();
			for (let i = 0; i < edges.length; i++) {
				let now = edges[i];
				let nowIdx = rack.indexOf(now);
				if (rack.indexOf(now) > -1) {
					rack.splice(nowIdx, 1);
					let nextNode = _.clone(node);
					nextNode.next(now);
					this.leftPart(table, rack, x, y, partialWord + now, nextNode, limit - 1);
					rack.push(now);
				}
			}
		}
	}

	extendRight(table, rack, x, y, partialWord, node) {
		if (y >= 15) {
			let currentWord = node.getWord();
			if (currentWord != undefined) {
				if (!(x == this.anchorX && y == this.anchorY)) {
					let score = partialWord.length;
					for (let i = y - partialWord.length; i < y; i++) {
						score += this.crossPoints[i];
					}
					let xIdx = x;
					let yIdx = y - partialWord.length;
					if (this.direction == 1) {
						[ xIdx, yIdx ] = [ yIdx, xIdx ];
					}
					this.possibleMoves.push([ partialWord, xIdx, yIdx, score, this.direction ]);
				}
			}
			return;
		}
		if (table[x][y] == null) {
			let currentWord = node.getWord();
			if (currentWord != undefined) {
				if (!(x == this.anchorX && y == this.anchorY)) {
					let score = partialWord.length;
					for (let i = y - partialWord.length; i < y; i++) {
						score += this.crossPoints[i];
					}
					let xIdx = x;
					let yIdx = y - partialWord.length;
					if (this.direction == 1) {
						[ xIdx, yIdx ] = [ yIdx, xIdx ];
					}
					this.possibleMoves.push([ partialWord, xIdx, yIdx, score, this.direction ]);
				}
			}
			let edges = node.listNext();
			for (let i = 0; i < edges.length; i++) {
				let now = edges[i];
				let nowIdx = rack.indexOf(now);
				if (nowIdx > -1 && this.crossChecks[y].indexOf(now) > -1) {
					rack.splice(nowIdx, 1);
					let nextNode = _.clone(node);
					nextNode.next(now);
					this.extendRight(table, rack, x, y + 1, partialWord + now, nextNode);
					rack.push(now);
				}
			}
		} else {
			let now = table[x][y];
			if (node.hasNext(now)) {
				let nextNode = _.clone(node);
				nextNode.next(now);
				this.extendRight(table, rack, x, y + 1, partialWord + now, nextNode);
			}
		}
	}

	transposeTable(table) {
		let newTable = [];
		for (let i = 0; i < 15; i++) {
			let row = [];
			for (let j = 0; j < 15; j++) {
				row.push(table[j][i]);
			}
			newTable.push(row);
		}
		return newTable;
	}

	fillTable(table, move) {
		let word = move[0];
		let x = move[1];
		let y = move[2];
		let direction = move[4];
		let newTable = _.cloneDeep(table);
		if (direction == 0) {
			for (let i = y; i < y + word.length; i++) {
				newTable[x][i] = word[i - y];
			}
		} else {
			for (let i = x; i < x + word.length; i++) {
				newTable[i][y] = word[i - x];
			}
		}
		return newTable;
	}
}
