class Dawg {
    constructor(words) {
        this.dict = new Map();
        this.dict.set(0, new Map());
        this.dict.set(1, new Map());
        this.size = 2;

        words.sort();
        for (var i = 0; i < words.length; i++) {
            //Add '~' if this word is prefix of the next word
            var word = words[i];
            
            if (i < words.length - 1) {
                var nextWord = words[i + 1];
                for (var j = 0; j < word.length; j++) {
                    if (word[j] !== nextWord[j]) break;
                    if (j === word.length - 1) {
                        word = word.concat("~");
                    }
                }
            }

            //Remove prefix
            var lastKey = 0;
            var subIndex;
            for (subIndex = 0; subIndex < word.length; subIndex++) {
                if (this.dict.get(lastKey).has(word[subIndex])) {
                    lastKey = this.dict.get(lastKey).get(word[subIndex]);
                } else {
                    break;
                }
            }
            
            //Temp dict for the new word
            var newEntries = this.createNewEntries(word.substring(subIndex), lastKey);

            //Optimize temp dict (common suffix)
            this.optimize(newEntries);

            //Add optimized temp dictionary to real dictionary
            for (var [key, value] of newEntries.entries()) {
                for (var [transKey, transValue] of value.entries()) {
                    if (!this.dict.has(key)) {
                        this.dict.set(key, new Map());
                    }
                    this.dict.get(key).set(transKey, transValue);
                }
            }
        }
    }

    contains(word) {
        var key = 0;
        for (var i = 0; i < word.length; i++) {
            if (this.dict.get(key).has(word[i])) {
                key = this.dict.get(key).get(word[i]);
            } else {
                return false;
            }
        }
        while (this.dict.get(key).has("~")) {
            key = this.dict.get(key).get("~");
        }
        return (key === 1);
    }

    createNewEntries(word, lastKey) {
        var newEntries = new Map();
        var key = lastKey;
        for (var i = 0; i < word.length; i++) {
            if (!newEntries.has(key)) {
                newEntries.set(key, new Map());
            }

            if (i === word.length - 1) {
                newEntries.get(key).set(word[i], 1);
            } else {
                newEntries.get(key).set(word[i], this.size);
                key = this.size++;
            }
        }
        return newEntries;
    }

    optimize(newEntries) {
        var needOptimize = true;
        while (needOptimize) {
            needOptimize = false;
            for (var [key1, value1] of newEntries.entries()) {
                if (key1 < this.dict.size) continue;
                for (var [key2, value2] of this.dict.entries()) {
                    if (this.sameMap(value1, value2)) {
                        this.replace(newEntries, key1, key2);
                        newEntries.delete(key1);
                        this.size--;
                        needOptimize = true;
                        break;
                    }
                }
            }
        }
    }

    replace(newEntries, key1, key2) {
        for (var [key, value] of newEntries.entries()) {
            for (var [transKey, transValue] of value) {
                if (transValue === key1) {
                    value.set(transKey, key2);
                }
            }
        }
    }

    sameMap(map1, map2) {
        if (map1.size === map2.size) {
            var isSame = true;
            for (var [key, value] of map1.entries()) {
                if (!map2.has(key) || map2.get(key) !== value) {
                    isSame = false;
                    break;
                }
            }
            return isSame;
        }
        return false;
    }

    print() {
        console.log("Size: ", this.size);
        console.log(this.dict);
    }
}

//Test
//const dawg = new Dawg(["log", "logs", "dog", "dogs"]);
//dawg.print();
//console.log(dawg.contains("log"));
//console.log(dawg.contains("logs"));
//console.log(dawg.contains("dog"));
//console.log(dawg.contains("dogs"));
