import { Dawg, DawgIterator } from '../utils/Dawg';
import _ from 'lodash';

export default class AI {
  constructor(dawg) {
    this.dawg = dawg;
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
        let up = this.traverseUp(table, i - 1, j);
        let down = this.traverseDown(table, i + 1, j);
        let iterator = new DawgIterator(this.dawg);
        for (let k = 0; k < up.length; k++) iterator.next(up[k]);
        let edges = iterator.listNext();
        for (let k = 0; k < edges.length; k++) {
          let traversor = _.clone(iterator);
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
            crossChecks[j].push(edges[k]);
            if (up.length > 0 || down.length > 0)
              accrossPoints[j] = up.length + down.length + 1;
            else accrossPoints[j] = 0;
          }
        }
      }
      console.log(i, anchors);
      //
      for (let j = 0; j < anchors.length; j++) {
        let limit = anchors[0];
        if (j != 0) limit = anchors[j] - anchors[j - 1] - 1;
        let iterator = new DawgIterator(this.dawg);
        if (anchors[j] - 1 >= 0 && table[i][anchors[j] - 1] != null)
          this.leftPartExisting(
            table,
            myRack,
            i,
            anchors[j],
            crossChecks,
            accrossPoints,
            iterator
          );
        else
          this.leftPart(
            table,
            myRack,
            i,
            anchors[j],
            crossChecks,
            accrossPoints,
            '',
            iterator,
            limit
          );
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

  leftPartExisting(table, rack, x, y, crossChecks, accrossPoints, node) {
    let left = this.traverseLeft(table, x, y - 1);
    for (let i = 0; i < left.length; i++) node.next(left[i]);
    this.extendRight(table, rack, x, y, crossChecks, accrossPoints, left, node);
  }

  leftPart(
    table,
    rack,
    x,
    y,
    crossChecks,
    accrossPoints,
    partialWord,
    node,
    limit
  ) {
    // console.log('heaven', x, y, partialWord, rack);
    this.extendRight(
      table,
      rack,
      x,
      y,
      crossChecks,
      accrossPoints,
      partialWord,
      _.clone(node)
    );
    if (limit > 0) {
      let edges = node.listNext();
      for (let i = 0; i < edges.length; i++) {
        let now = edges[i];
        let nowIdx = rack.indexOf(now);
        if (rack.indexOf(now) > -1) {
          // console.log('popa', now);
          rack.splice(nowIdx, 1);
          let nextNode = _.clone(node);
          nextNode.next(now);
          this.leftPart(
            table,
            rack,
            x,
            y,
            crossChecks,
            accrossPoints,
            partialWord + now,
            nextNode,
            limit - 1
          );
          rack.push(now);
          // console.log('push', now);
        }
      }
    }
  }

  extendRight(
    table,
    rack,
    x,
    y,
    crossChecks,
    accrossPoints,
    partialWord,
    node
  ) {
    // console.log('hell', x, y, partialWord, rack);
    if (table[x][y] == null) {
      // console.log('kosong');
      let currentWord = node.getWord();
      if (currentWord != undefined) {
        this.possibleMoves.push(partialWord);
        console.log(x, y, partialWord);
        // console.log(this.possibleMoves);
      }
      let edges = node.listNext();
      for (let i = 0; i < edges.length; i++) {
        let now = edges[i];
        let nowIdx = rack.indexOf(now);
        // console.log('pepe', now, nowIdx, crossChecks[y].indexOf(now));
        if (nowIdx > -1 && crossChecks[y].indexOf(now) > -1) {
          rack.splice(nowIdx, 1);
          // console.log('popo', now, rack);
          let nextNode = _.clone(node);
          nextNode.next(now);
          this.extendRight(
            table,
            rack,
            x,
            y + 1,
            crossChecks,
            accrossPoints,
            partialWord + now,
            nextNode
          );
          rack.push(now);
          // console.log('pusho', now, rack);
        }
      }
    } else {
      // console.log('tidak');
      let now = table[x][y];
      if (node.hasNext(now)) {
        let nextNode = _.clone(node);
        nextNode.next(now);
        this.extendRight(
          table,
          rack,
          x,
          y + 1,
          crossChecks,
          accrossPoints,
          partialWord + now,
          nextNode
        );
      }
    }
  }
}
