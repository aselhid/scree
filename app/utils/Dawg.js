function sameNode(node1, node2) {
	var same = node1.endOfWord === node2.endOfWord;
	for (var i = 0; i < 26; i++) {
		same = same && node1.child[i] == node2.child[i];
	}
	return same;
}

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
		this.lastChild = undefined;
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
export class Dawg {
	constructor(words) {
		this.root = new Node(null, false);
		this.minimalizedStates = [];
		this.buildAutomaton(words);
		this.cleanup();
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

	/**
        DAWG builder
    */
	buildAutomaton(words) {
		for (var i = 0; i < words.length; i++) {
			var word = words[i];

			var lastNodeAndSuffixIndex = this.getLastPrefixNode(word);
			var lastNode = lastNodeAndSuffixIndex[0];
			var suffix = word.substring(lastNodeAndSuffixIndex[1]);

			if (lastNode.lastChild != undefined) {
				this.optimize(lastNode);
			}
			this.addSuffix(lastNode, suffix);
		}

		this.optimize(this.root);
	}

	/**
        Get last node of common prefix with the word and first unmatched character index.
    */
	getLastPrefixNode(word) {
		var current = this.root;
		var i;
		for (i = 0; i < word.length; i++) {
			if (current.child[charToEdgeNumber(word[i])] != null) {
				current = current.child[charToEdgeNumber(word[i])];
			} else {
				break;
			}
		}
		return [ current, i ];
	}

	/**
        Add word from node
    */
	addSuffix(node, word) {
		for (var i = 0; i < word.length; i++) {
			if (i == word.length - 1) {
				node.child[charToEdgeNumber(word[i])] = new Node(node, true);
			} else {
				node.child[charToEdgeNumber(word[i])] = new Node(node, false);
			}
			node.lastChild = charToEdgeNumber(word[i]);
			node = node.child[charToEdgeNumber(word[i])];
		}
		node.endOfWord = true;
	}

	/**
        State minimization function
    */
	optimize(node) {
		var child = node.child[node.lastChild];
		if (child.lastChild != undefined) {
			this.optimize(child);
		}
		var register = true;
		for (var i = 0; i < this.minimalizedStates.length; i++) {
			if (sameNode(child, this.minimalizedStates[i]) == true) {
				node.child[node.lastChild] = this.minimalizedStates[i];
				register = false;
				break;
			}
		}
		if (register == true) {
			this.minimalizedStates.push(child);
		}
	}

	/**
        Remove unused variable after construction.
    */
	cleanup() {
		for (var i = 0; i < this.minimalizedStates.length; i++) {
			delete this.minimalizedStates[i].lastChild;
		}
		delete this.minimalizedStates;
	}

	/** 
        For validation purpose.
        Uncomment this and comment "delete this.minimalizedStates;" in cleanup() method
        to validate the number of nodes constructed.
    */

	/*
    getTotalNodes() {
        return this.minimalizedStates.length;
    }
    */
}

/**
    DAWG Iterator
*/
class DawgIterator {
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
