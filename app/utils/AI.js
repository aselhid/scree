import { Dawg, DawgIterator } from '../utils/Dawg';
import WordList from '../utils/wordlist';

export default class AI {
  constructor() {
    this.dawg = new Dawg(WordList);
    this.possibleMoves;
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
      let crossChecks = [];
      let accrossPoints = [];
      for (let j = 0; j < 15; j++) crossChecks.push([]);
      for (let j = 0; j < 15; j++) accrossPoints.push(0);
      for (let j = 0; j < 15; j++) {
        if (table[i][j] != null) continue;
        let up = traverseUp(table, i - 1, j);
        let down = traverseDown(table, i + 1, j);
        let iterator = new DawgIterator(this.dawg);
        for (let k = 0; k < up.length; k++) iterator.next(up[k]);
        let edges = iterator.hasNext();
        for (let k = 0; k < edges.length; k++) {
          let traversor = iterator;
          traversor.next(edges[k]);
          let valid = traversor.getWord != undefined;
          for (let l = 0; l < down.length; l++) {
            if (traversor.hasNext(down[l])) traversor.next(down[l]);
            else {
              valid = false;
              break;
            }
          }
          if (valid) valid = traversor.getWord != undefined;
          if (valid) {
            crossChecks[j].push([edges[k]]);
            accrossPoints[j] = up.length + down.length + 1;
          }
        }
      }
      //
      for (let j = 0; j < anchors.length; j++) {
        let limit = anchors[0];
        if (j != 0) limit = anchors[j] - anchors[j - 1] - 1;
        let iterator = new DawgIterator(this.dawg);
        if (anchors[j] - 1 >= 0 && table[i][anchors[j]] != null)
          this.traverseLeft(table, rack, i, anchors[j], iterator);
        else this.leftPart(table, myRack, i, anchors[j], [], iterator, limit);
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

  traverseLeft(table, rack, x, y, node) {}

  leftPart(table, rack, x, y, partialWord, node, limit) {
    extendRight(table, rack, x, y, partialWord, node);
    if (limit > 0) {
      let edges = node.listNext();
      for (let i = 0; i < edges.length; i++) {
        let now = edges[i];
        let nowIdx = rack.indexOf(now);
        if (rack.indexOf(now) > -1) {
          rack.splice(nowIdx - 1, 1);

          this.leftPart(
            table,
            rack,
            x,
            y,
            partialWord.push([now, x, y]),
            node.next(now),
            limit - 1
          );
          rack.push(now);
        }
      }
    }
  }

  extendRight(table, rack, x, y, partialWord, node) {
    if (table[x][y] == null) {
      let currentWord = node.getWord();
      if (currentWord != undefined) {
        this.possibleMoves.push(partialWord);
      }
      let edges = node.listNext();
      for (let i = 0; i < edges.length; i++) {
        let now = edges[i];
        let nowIdx = rack.indexOf(now);
        if (nowIdx > -1 && crossChecks[y].indexOf(now) > -1) {
          rack.splice(nowIdx - 1, 1);
          this.extendRight(
            table,
            rack,
            x,
            y + 1,
            partialWord + now,
            node.next(now)
          );
          rack.push(now);
        }
      }
    } else {
      let now = table[x][y];
      if (node.hasNext(now)) {
        this.extendRight(
          table,
          rack,
          x,
          y + 1,
          partialWord + now,
          node.next(now)
        );
      }
    }
  }
}
