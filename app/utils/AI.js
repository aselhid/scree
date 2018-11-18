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
    this.possibleMoves = [];
    // generating accross moves
    this.direction = 0;
    this.generateMoves(table, myRack);
    // generating down moves;
    this.direction = 1;
    this.generateMoves(this.rotateTable(table), myRack);
    console.log(this.possibleMoves);
  }

  generateMoves(table, rack) {
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
          this.leftPart(
            table,
            rack,
            x,
            y,
            partialWord + now,
            nextNode,
            limit - 1
          );
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
            xIdx = yIdx;
            yIdx = 15 - x - 1;
          }
          this.possibleMoves.push([
            partialWord,
            xIdx,
            yIdx,
            score,
            this.direction
          ]);
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
            xIdx = yIdx;
            yIdx = 15 - x - 1;
          }
          this.possibleMoves.push([
            partialWord,
            xIdx,
            yIdx,
            score,
            this.direction
          ]);
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

  rotateTable(table) {
    let newTable = [];
    for (let i = 0; i < 15; i++) {
      let row = [];
      for (let j = 0; j < 15; j++) {
        row.push(table[j][15 - i - 1]);
      }
      newTable.push(row);
    }
    return newTable;
  }
}
