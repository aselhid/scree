// @flow
import React, { Component } from 'react';
import styles from './Home.css';
import Table from '../components/Table';
import Rack from '../components/Rack';
import { dawg_dictionary } from '../utils/scrabble';
import AI from '../utils/AI';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playerCount: 2,
      pickedChar: null
    };

    this.onTileClicked = this.onTileClicked.bind(this);
    this.onRackClicked = this.onRackClicked.bind(this);
  }

  onTileClicked(i, j) {
    const { pickedChar } = this.state;
    const { putTileOnTable } = this.props;

    if (!!pickedChar) {
      putTileOnTable(i, j, pickedChar);
      this.setState({ pickedChar: null });
    }
  }

  onRackClicked(i) {
    return (ri, char) => {
      if (!this.state.pickedChar) {
        this.props.setPicked(i, [ri]);
        this.setState({ pickedChar: char });
      }
    };
  }

  render() {
    const {
      racks,
      table,
      started,
      currentPlayer,
      picked,
      points
    } = this.props.scrabble;
    const { initGame, undoTable, submit } = this.props;
    const { playerCount } = this.state;

    return (
      <div>
        {started && (
          <div>
            <Table table={table} callback={this.onTileClicked} />
            <button onClick={undoTable}>Undo</button>
            <button
              onClick={() => {
                console.log('hello');
                let ai = new AI(dawg_dictionary);
                let ans = ai.best(
                  [
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, 'a', null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ],
                    [ null, null, null, null, null, null, null, null, null, null, null, null, null, null, null ]
                  ],
                  ['a', 'n', 'g', 'i', 'n', 'a', 'a'],
                  ['p', 'e', 't', 'i', 'r', 'a', 'a']
                );
                console.log(ans);
              }}
            >
              Submit
            </button>
            {points.map((element, index) => (
              <h3>
                Pemain {index} : {element}
              </h3>
            ))}
            {racks
              ? racks.map((rack, i) => (
                  <Rack
                    rack={rack}
                    callback={this.onRackClicked(i)}
                    activeRack={currentPlayer === i}
                    picked={picked[i]}
                  />
                ))
              : null}
          </div>
        )}
        {!started && (
          <div>
            <button onClick={() => initGame(2)} disabled={started}>
              Start
            </button>
          </div>
        )}
      </div>
    );
  }
}
