import React, { useState, useContext, createContext, useCallback } from "react";
import ReactDOM from "react-dom";
import "./index.css";

const BoardContext = createContext();

function Square({ x, y, children }) {
  const { handleClick, winner } = useContext(BoardContext);
  return (
    <button
      x={x}
      y={y}
      onClick={() => {
        if (winner) return;
        handleClick(x, y);
      }}
      className="square"
    >
      {children ? (children === "黑" ? "🌚" : "🌝") : null}
    </button>
  );
}

function Board({ board }) {
  return (
    <>
      {board.map((row, rowIndex) => {
        return (
          <div key={rowIndex}>
            {row.map((square, squareIndex) => (
              <Square x={squareIndex} y={rowIndex} key={squareIndex}>
                {square}
              </Square>
            ))}
            <br />
          </div>
        );
      })}
    </>
  );
}

function Title({ thisTurnIsBlack, winner }) {
  return (
    <div className="status">
      {winner
        ? "遊戲結束嚕 🏁"
        : thisTurnIsBlack
        ? "換黑棋下 🏴️"
        : "換白棋下 🏳️"}
    </div>
  );
}

const fixed = [0, 0, 0, 0];
const add = [1, 2, 3, 4];
const back = [-1, -2, -3, -4];

function checkBound(move, max, min) {
  return move <= max && move >= min;
}

function check(
  board,
  currentX,
  currentY,
  currentColor,
  directionX,
  directionY
) {
  let count = 0;
  for (let i = 0; i < 4; i++) {
    let moveX = currentX + directionX[i];
    let moveY = currentY + directionY[i];
    if (!checkBound(moveX, 18, 0) || !checkBound(moveY, 18, 0)) continue;
    if (board[moveY][moveX] === currentColor) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function Game() {
  const [board, setBoard] = useState(Array(19).fill(Array(19).fill(null)));
  const [thisTurnIsBlack, setThisTurnIsBlack] = useState(true);
  const [records, setRecords] = useState([]);
  const [winner, setWinner] = useState(null);

  const judgeWinLose = useCallback((records, board) => {
    if (records.length === 0) return;
    let currentColor = records[records.length - 1].color;
    let currentX = records[records.length - 1].x;
    let currentY = records[records.length - 1].y;
    let whoIsWinner = null;
    let results = [
      check(board, currentX, currentY, currentColor, add, add),
      check(board, currentX, currentY, currentColor, add, fixed),
      check(board, currentX, currentY, currentColor, add, back),
      check(board, currentX, currentY, currentColor, fixed, add),
      check(board, currentX, currentY, currentColor, fixed, back),
      check(board, currentX, currentY, currentColor, back, add),
      check(board, currentX, currentY, currentColor, back, fixed),
      check(board, currentX, currentY, currentColor, back, back),
    ];
    results.find((result) => result === 4) && (whoIsWinner = currentColor);
    whoIsWinner && setWinner(whoIsWinner);
  }, []);

  function handleClick(x, y) {
    setBoard(
      board.map((row, currentY) => {
        if (currentY !== y) return row;
        return row.map((col, currentX) => {
          if (currentX !== x) return col;
          return thisTurnIsBlack ? "黑" : "白";
        });
      })
    );
    const newRecord = [
      ...records,
      { color: thisTurnIsBlack ? "黑" : "白", x: x, y: y },
    ];
    setRecords(newRecord);
    judgeWinLose(newRecord, board);
    !winner && setThisTurnIsBlack((thisTurnIsBlack) => !thisTurnIsBlack);
  }

  const initialize = useCallback(() => {
    setBoard(Array(19).fill(Array(19).fill(null)));
    setThisTurnIsBlack(true);
    setRecords([]);
    setWinner(null);
  }, []);

  return (
    <div className="game">
      <div className="game-board">
        <Title thisTurnIsBlack={thisTurnIsBlack} winner={winner} />
        <BoardContext.Provider value={{ handleClick, thisTurnIsBlack, winner }}>
          <Board board={board} />
        </BoardContext.Provider>
      </div>
      <div className="game-info">
        <ol>
          {records.map((record, index) => (
            <li key={index}>{`${record.color}(${record.x}, ${record.y})`}</li>
          ))}
        </ol>
        <div style={{ color: "red", fontWeight: "bold" }}>
          {winner && `恭喜 ${winner} 獲勝 🎉🎉🎉`}
        </div>
        <button onClick={initialize} style={winner ? {} : { display: "none" }}>
          再玩一次
        </button>
      </div>
    </div>
  );
}

ReactDOM.render(<Game />, document.getElementById("root"));
