import { Dawg, DawgIterator } from '../utils/Dawg';
import _ from 'lodash';

export default class AI {
  constructor(dawg) {
    this.dawg = dawg;
    this.possibleMoves;
    this.crossChecks;
    this.accrossPoints;
  }

  best(table, myRack, foeRack) {
    this.possibleMoves = [];
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
      this.accrossPoints = [];
      for (let j = 0; j < 15; j++) this.crossChecks.push([]);
      for (let j = 0; j < 15; j++) this.accrossPoints.push(0);
      for (let j = 0; j < 15; j++) {
        if (table[i][j] != null) continue;
        let up = this.traverseUp(table, i - 1, j);
        let down = this.traverseDown(table, i + 1, j);
        if (up == '' && down == '') {
          for (let k = 97; k < 97 + 26; k++) {
            this.crossChecks[j].push(String.fromCharCode(k));
            this.accrossPoints[j] = 0;
          }
        } else {
          let iterator = new DawgIterator(this.dawg);
          for (let k = 0; k < up.length; k++) iterator.next(up[k]);
          let edges = iterator.listNext();
          for (let k = 0; k < edges.length; k++) {
            let traversor = _.clone(iterator);
            traversor.next(edges[k]);
            let valid = traversor.getWord() != undefined;
            for (let l = 0; l < down.length; l++) {
              if (traversor.hasNext(down[l])) traversor.next(down[l]);
              else {
                valid = false;
                break;
              }
            }
            if (valid) valid = traversor.getWord() != undefined;
            if (valid) {
              this.crossChecks[j].push(edges[k]);
              this.accrossPoints[j] = up.length + down.length + 1;
            }
          }
        }
      }
      console.log(anchors);
      // coba bikin kata dari semua anchor
      for (let j = 0; j < anchors.length; j++) {
        let limit = anchors[0];
        if (j != 0) limit = anchors[j] - anchors[j - 1] - 1;
        let iterator = new DawgIterator(this.dawg);
        if (anchors[j] - 1 >= 0 && table[i][anchors[j] - 1] != null)
          this.leftPartExisting(table, myRack, i, anchors[j], iterator);
        else this.leftPart(table, myRack, i, anchors[j], '', iterator, limit);
      }
    }
    console.log(this.possibleMoves);
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
    this.extendRight(table, rack, x, y, x, y, left, node);
  }

  leftPart(table, rack, x, y, partialWord, node, limit) {
    this.extendRight(table, rack, x, y, x, y, partialWord, _.clone(node));
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

  extendRight(table, rack, anchorX, anchorY, x, y, partialWord, node) {
    if (y >= 15) {
      let currentWord = node.getWord();
      if (currentWord != undefined) {
        if (x != anchorX || y != anchorY) {
          this.possibleMoves.push([partialWord, x, y - partialWord.length]);
          // console.log(x, y - partialWord.length, x, y - 1, partialWord);
        }
      }
      return;
    }
    if (table[x][y] == null) {
      let currentWord = node.getWord();
      if (currentWord != undefined) {
        if (!(x == anchorX && y == anchorY)) {
          this.possibleMoves.push([partialWord, x, y - partialWord.length]);
          // console.log(x, y - partialWord.length, x, y - 1, partialWord);
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
          this.extendRight(
            table,
            rack,
            anchorX,
            anchorY,
            x,
            y + 1,
            partialWord + now,
            nextNode
          );
          rack.push(now);
        }
      }
    } else {
      let now = table[x][y];
      if (node.hasNext(now)) {
        let nextNode = _.clone(node);
        nextNode.next(now);
        this.extendRight(
          table,
          rack,
          anchorX,
          anchorY,
          x,
          y + 1,
          partialWord + now,
          nextNode
        );
      }
    }
  }
}
