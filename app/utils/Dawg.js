function charToEdgeNumber(c) {
  return c.charCodeAt(0) - 97;
}

function edgeNumberToChar(x) {
  return String.fromCharCode(x + 97);
}

class Node {
  constructor(parent, endOfWord) {
    this.child = [];
    this.parent = parent;
    this.endOfWord = endOfWord;
    for (var i = 0; i < 26; i++) {
      this.child.push(null);
    }
  }
}

/**
    Directed Acyclic Word Graph - Minimum-state DAFSA (memory optimization) to contain set of strings.

    Initialize with fixed words list.
    Cannot add word to this data structure, so you must build new DAWG if you want to add more word.
*/
//tambah export
export class Dawg {
  constructor() {
  	let fs = require('fs');
    this.transitionCharacterList = JSON.parse(fs.readFileSync('./app/utils/transitionCharacterList.json')).data;
    this.childList = JSON.parse(fs.readFileSync('./app/utils/childList.json')).data;
    this.endOfWordList = JSON.parse(fs.readFileSync('./app/utils/endOfWordList.json')).data;
    this.nodeList = [];

    this.size = this.endOfWordList.length;
    for (let i = 0; i < this.size; i++) {
      this.nodeList.push(new Node(null, false));
    }
    for (let i = 0; i < this.size; i++) {
      let childList = this.childList[i];
      let transitionCharacterList = this.transitionCharacterList[i];
      let endOfWord = this.endOfWordList[i];

      this.nodeList[i].endOfWord = endOfWord;
      for (let j = 0; j < childList.length; j++) {
        let childNumber = childList[j];
        let edge = transitionCharacterList[j];

        this.nodeList[i].child[edge] = this.nodeList[childNumber];
        this.nodeList[childNumber].parent = this.nodeList[i];
      }
    }

    this.root = this.nodeList[0];

    //delete this.transitionCharacterList;
    //delete this.parentList;
    //delete this.endOfWordList;
    //delete this.nodeList;
  }

  contains(word) {
    var current = this.root;
    for (var i = 0; i < word.length; i++) {
      if (current.child[charToEdgeNumber(word[i])] != null) {
        current = current.child[charToEdgeNumber(word[i])];
      } else {
        return false;
      }
    }
    return current.endOfWord;
  }
}

/**
    DAWG Iterator
*/
export class DawgIterator {
  constructor(dawg) {
    this.dawg = dawg;
    this.currentNode = dawg.root;
    this.word = '';
  }

  hasNext(c) {
    return this.currentNode.child[charToEdgeNumber(c)] != null;
  }

  next(c) {
    if (this.currentNode.child[charToEdgeNumber(c)] != null) {
      this.currentNode = this.currentNode.child[charToEdgeNumber(c)];
      this.word = this.word.concat(c);
    } else {
      console.log("next() failed. This node doesn't have transition with character " + c);
    }
  }

  back() {
    if (this.currentNode.parent != null) {
      this.currentNode = this.currentNode.parent;
      this.word = this.word.substring(0, this.word.length - 1);
    } else {
      console.log("back() failed. This node doesn't have parent");
    }
  }

  listNext() {
    var childList = [];
    for (var i = 0; i < 26; i++) {
      if (this.currentNode.child[i] != null) {
        childList.push(edgeNumberToChar(i));
      }
    }
    return childList;
  }

  reset() {
    this.currentNode = this.dawg.root;
    this.parentNode = null;
    this.word = '';
  }

  getWord() {
    if (this.currentNode.endOfWord == true) {
      return this.word;
    }
    return undefined;
  }
}