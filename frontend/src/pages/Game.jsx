import React from "react";
import React, { useEffect, useState } from "react";
import socket from "../socket";
import { useParams } from "react-router-dom";

export default function Game({ currentUser }) {
  const { sessionId } = useParams();
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    socket.on("guess_result", (data) => {
      if (!data.correct) {
        setResult(`Wrong guess: ${data.guess}`);
      }
    });

    socket.on("game_over", ({ winner, answer }) => {
      if (winner) {
        setResult(`Winner is ${winner.name}! Answer was ${answer}`);
      } else {
        setResult(`No winner. Answer was ${answer}`);
      }
    });

    return () => {
      socket.off("guess_result");
      socket.off("game_over");
    };
  }, []);

  const submitGuess = () => {
    socket.emit("guess", { sessionId, userId: currentUser.id, guess });
    setGuess("");
  };

  return (
    <div>
      <h2>Game Session: {sessionId}</h2>
      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter guess"
      />
      <button onClick={submitGuess}>Guess</button>
      <p>{result}</p>
    </div>
  );
}
