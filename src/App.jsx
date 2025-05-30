import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css"; // Assuming you have some basic styles

// const socket = io("http://localhost:5000");
const socket = io("https://bingo-backend-95kp.onrender.com")

function App() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [board, setBoard] = useState([]);
  const [marks, setMarks] = useState(Array(25).fill(false));
  const [turn, setTurn] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    socket.on("room-created", ({ roomCode, board }) => {
      setRoomCode(roomCode);
      setBoard(board);
      setGameStarted(false);
    });

    socket.on("game-start", ({ boards, players, turn }) => {
      setBoard(boards[socket.id]);
      setTurn(turn);
      setGameStarted(true);
    });

    socket.on("number-called", ({ number, marks, turn }) => {
      setMarks(marks[socket.id]);
      setTurn(turn);
    });

    socket.on("game-over", ({ winner }) => {
      setStatus(`${winner} wins the game!`);
    });

    socket.on("error", msg => {
      alert(msg);
    });

    return () => socket.off();
  }, []);

  const handleCreate = () => {
    socket.emit("create-room", { name });
  };

  const handleJoin = () => {
    socket.emit("join-room", { roomCode: inputCode.toUpperCase(), name });
    setRoomCode(inputCode.toUpperCase());
  };

  const handleCall = (num, i) => {
    if (turn === socket.id && !marks[i]) {
      socket.emit("call-number", { roomCode, number: num });
    }
  };

  return (
    <div style={{ textAlign: "center", paddingTop: 50 }}>
      {!gameStarted ? (
        <div>
          <h2>Multiplayer Bingo</h2>
          <input
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
          /><br /><br />
          <button onClick={handleCreate}>Create Room</button>
          <br /><br />
          <input
            placeholder="Join Room Code"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
          />
          <button onClick={handleJoin}>Join Room</button>
          <h4>Your Room Code: {roomCode}</h4>
        </div>
      ) : (
        <div>
          <h3>{status || (turn === socket.id ? "Your Turn" : "Opponent's Turn")}</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 60px)",
            gap: "5px",
            justifyContent: "center"
          }}>
            {board.map((num, i) => (
              <button
                key={i}
                onClick={() => handleCall(num, i)}
                disabled={marks[i] || turn !== socket.id}
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: marks[i] ? "green" : "lightgray",
                  color: "black",
                  fontWeight: "bold",
                  cursor: turn === socket.id ? "pointer" : "not-allowed"
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
