class DawgIterator {
	constructor(dawg) {
		this.dawg = dawg;
		this.prevKey = [];
		this.key = 0;
		this.word = "";
	}

	hasNext(c) {
		return this.dawg.dict.get(this.key).has(c);
	}

	next(c) {
		if (this.dawg.dict.get(this.key).has(c)) {
			this.prevKey.push(this.key);
			this.key = this.dawg.dict.get(this.key).get(c);
			this.word = this.word.concat(c);
		}
	}

	back() {
		if (this.prevKey.length > 0) {
			this.key = this.prevKey.pop();
			this.word = this.word.substring(0, this.word.length - 1);
		}
	}

	listNext() {
		var list = new Set();
		for (var [key, value] of this.dawg.dict.get(this.key).entries()) {
			if (key == "~") {
				continue;
			}
			list.add(key);
		}
		return list;
	}

	reset() {
		this.key = 0;
		this.word = "";
		this.prevKey = [];
	}

	getWord() {
		if (this.key == 1 || this.dawg.dict.get(this.key).has("~")) {
			return this.word;
		}
		return undefined;
	}
}
