import React, { useEffect, useState } from "react";
//import Tabuleiro from "./components/tabuleiro";
import Tabuleiro from "./components/tabuleiro/tabuleiro.component";
import TabuleiroModo2 from "./components/tabuleiro/tabuleiro.component.modo2";
import ControlBar from "./components/control-bar/control-bar.component";
import FormComponent from "./components/form/form.component";
import GameOverModal from "./components/game-over-modal/game-over-modal.component";
import "./App.css";

import { PLAYER1, PLAYER2 } from "./constants/constants";

const calculateFullBoardWinnerByLine = (jogador1, jogador2) => {

  const winLines = [[0, 1, 2], [0, 3, 6], [0, 4, 8], [1, 4, 7], [2, 5, 8], [2, 4, 6], [3, 4, 5], [6, 7, 8]];

  
  //jogador1
  for (let i = 0; i < winLines.length; i++) {
    let countEquals = 0;
    for (let j = 0; j < winLines[i].length; j++) {
      if (jogador1.boardsWon.includes(winLines[i][j])) {
        countEquals++;
      }
    }
    if (countEquals === 3) {
      return jogador1.name;
    }
  }

  //jogador2
  for (let i = 0; i < winLines.length; i++) {
    let countEquals = 0;
    for (let j = 0; j < winLines[i].length; j++) {
      if (jogador2.boardsWon.includes(winLines[i][j])) {
        countEquals++;
      }
    }
    if (countEquals === 3) {
      return jogador2.name;
    }
  }

  return null;
}


function App() {
  const [resetBoard, setResetBoard] = useState(false);
  //gamemodes

  /******************************
   *    VARIÁVEIS E ESTADOS     *
   ******************************/

  let timerIdX = undefined;
  let timerIdY = undefined;

  //State que seleciona o timerAtivo
  const [activeTimer, setActiveTimer] = useState(1);

  //State que tem o Jogador que se encontra a jogar
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);

  //State que tem o Jogador que se encontra a jogar
  const [gamemode, setGamemode] = useState("livre");

  //State do Jogador1
  //V2
  const [jogador1, setJogador1] = useState({
    name: "",
    timer: NaN,
    initialTimer: NaN,
    symbol: "X",
    numOfWins: 0,
    boardsWon: []
  });

  //State do Jogador2
  //V2
  const [jogador2, setJogador2] = useState({
    name: "",
    timer: NaN,
    initialTimer: NaN,
    symbol: "O",
    numOfWins: 0,
    boardsWon: []
  });

  const [isComputerPlaying, setComputerPlaying] = useState(false);

  //Estado do jogo (Começou ou nao começou)
  const [clickedBoard, setClickedBoard] = useState(false);
  const [gamestart, setGameStart] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [ultimateWinner, setUltimateWinner] = useState("");
  const [numOfGamesPlayed, setNumOfGamesPlayed] = useState(0);
  const [enabledBoards, setEnabledBoards] = useState(10);
  const [numEmpates, setNumEmpates] = useState(0);
  const tabuleiros = [];

  //Estados relativos ao computador jogar
  //State que seleciona o boardAtivo para o computador jogar
  const [activeBoardIndex, setActiveBoardIndex] = useState(Math.floor(Math.random() * 8) + 0);
  const [allowedBoards, setAllowedBoards] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8]); //COMPUTADOR

  /******************************
   *    VARIÁVEIS E ESTADOS     *
   ******************************/

  /******************************
   *    HANDLERS DOS ESTADOS    *
   ******************************/

  const handleGameStart = () => {
    //full states reset
    if (gamestart) {
      setGameStart((previousValue) => !previousValue);
      setJogador1({ name: "", timer: NaN, initialTimer: NaN, symbol: "X", numOfWins: 0, boardsWon: [] });
      setJogador2({ name: "", timer: NaN, initialTimer: NaN, symbol: "O", numOfWins: 0, boardsWon: [] });
      setCurrentPlayer(PLAYER1);
      setActiveTimer(1);
      setIsGameOver(false);
      setUltimateWinner("");
      setNumOfGamesPlayed(0);
      setNumEmpates(0);
      setActiveBoardIndex(Math.floor(Math.random() * 8) + 0);
      setAllowedBoards([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    } else {
      setGameStart(true);
    }
  };

  const handlePlayAgain = () => {
    const currentPlayer1Timer = jogador1.initialTimer;
    const currentPlayer2Timer = jogador2.initialTimer;
  
    setResetBoard(true);
    setJogador1((previousValue) => ({
      ...previousValue,
      timer: currentPlayer1Timer,
      numOfWins: 0,
      boardsWon: [],
    }));
    setJogador2((previousValue) => ({
      ...previousValue,
      timer: currentPlayer2Timer,
      numOfWins: 0,
      boardsWon: [],
    }));
    setCurrentPlayer(PLAYER1);
    setActiveTimer(1);
    setIsGameOver(false);
    setUltimateWinner("");
    setNumEmpates(0);
    setGameStart(true);
    setNumOfGamesPlayed(0);
  };

  useEffect(() => {
    if (resetBoard) {
      setResetBoard(false);
    }
  }, [resetBoard]);

  const handleCurrentPlayer = (value) => {
    setCurrentPlayer(value === PLAYER1 ? PLAYER2 : PLAYER1);
  };

  const handleJogador1MudarNome = (event) => {
    setJogador1((previousValue) => {
      return { ...previousValue, name: event.target.value };
    });
  };

  const handleJogador2MudarNome = (event) => {
    setJogador2((previousValue) => {
      return { ...previousValue, name: event.target.value };
    });
  };

  const scramblePlayersOrder = () => {
    if (Math.random() < 0.5) {
      setJogador1((previousValue) => ({
        ...previousValue,
        name: jogador2.name,
      }));
      setJogador2((previousValue) => ({
        ...previousValue,
        name: jogador1.name,
      }));
    } else {
      setJogador1((previousValue) => ({ ...previousValue }));
      setJogador2((previousValue) => ({ ...previousValue }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setGameStart(true);
    scramblePlayersOrder();
  };

  //temporizador
  const handleTemporizador = (event) => {
    const option = event.target.value;
    if (option === "timer30") {
      setJogador1((previousValue) => {
        return { ...previousValue, timer: 30, initialTimer: 30  };
      });
      setJogador2((previousValue) => {
        return { ...previousValue, timer: 30, initialTimer: 30  };
      });
    } else if (option === "timer1") {
      setJogador1((previousValue) => {
        return { ...previousValue, timer: 60, initialTimer: 60  };
      });
      setJogador2((previousValue) => {
        return { ...previousValue, timer: 60, initialTimer: 60  };
      });
    } else if (option === "timer2") {
      setJogador1((previousValue) => {
        return { ...previousValue, timer: 120, initialTimer: 120  };
      });
      setJogador2((previousValue) => {
        return { ...previousValue, timer: 120, initialTimer: 120  };
      });
    } else {
      setJogador1((previousValue) => {
        return { ...previousValue, timer: NaN, initialTimer: NaN  };
      });
      setJogador2((previousValue) => {
        return { ...previousValue, timer: NaN, initialTimer: NaN  };
      });
    }
  };

  //Funcao que determina o UltimateWinner consoante condiçoes (se o timmer chegou ao fim, se ganhou no tabuleiro total, etc...)
  const handleUltimateWinner = (gameTimer) => {
    if (gameTimer > 0) {

      if(numOfGamesPlayed === 9 && !isGameOver){
        setUltimateWinner(
          jogador1.numOfWins > jogador2.numOfWins
            ? jogador1.name
            : jogador2.name
        );
        setIsGameOver(true);
      }

    } else if (gameTimer === 0) {
      setUltimateWinner(
        currentPlayer === jogador1.symbol ? jogador2.name : jogador1.name
      );
      setIsGameOver(true);
    }
  };

  //funcao que da update ao numero de Wins dos mini-boards
  const handleNumOfWins = (miniBoardWinner) => {
    if (miniBoardWinner === jogador1.name) {
      setJogador1((previousValue) => {
        return { ...previousValue, numOfWins: previousValue.numOfWins + 1 };
      });
    } else if (miniBoardWinner === jogador2.name) {
      setJogador2((previousValue) => {
        return { ...previousValue, numOfWins: previousValue.numOfWins + 1 };
      });
    }
  };

  const handleEmpates = () => {
    setNumEmpates((previousValue) => {
      return previousValue + 1;
    })
  }

  const handleBoardsWon = (miniBoardWinner, boardId) => {
    if (miniBoardWinner === jogador1.name) {
      setJogador1((previousValue) => {
        return { ...previousValue, boardsWon: previousValue.boardsWon.concat(boardId) };
      });
    } else if (miniBoardWinner === jogador2.name) {
      setJogador2((previousValue) => {
        return { ...previousValue, boardsWon: previousValue.boardsWon.concat(boardId) };
      });
    }
  }

  const handleNumOfGamesPlayed = () => {
    setNumOfGamesPlayed((previousValue) => {
      return previousValue + 1;
    });
  };

  const handleComputerPlaying = (value) => {
    setComputerPlaying(value);
    
    if(value === true){
      setJogador2((previousValue) => {
        return {... previousValue, name: "computador"};
      });
    }else{
      setJogador2((previousValue) => {
        return {... previousValue, name: ""};
      });
    }
  }

  const handleActiveBoard = (num) => {
    
    /*if(allowedBoards.includes(num)){
      setActiveBoardIndex(num);
    }else{
      let indexSelectedByComputer = Math.floor(Math.random() * allowedBoards.length);
      setActiveBoardIndex(allowedBoards[indexSelectedByComputer]);
    }*/

    setActiveBoardIndex(num);
  }

  const handleAllowedBoards = (num) => {
    setAllowedBoards(prevAllowedBoards => prevAllowedBoards.filter(board => board !== num));
  }

  /******************************
   *    HANDLERS DOS ESTADOS    *
   ******************************/

  /******************************
   *       TIMER FUNCTIONS      *
   ******************************/

  useEffect(() => {
    if (
      !isNaN(jogador1.timer) &&
      currentPlayer === PLAYER1 &&
      gamestart &&
      !isGameOver
    ) {
      setActiveTimer(1);
      let nextTimer;
      timerIdX = setInterval(() => {
        setJogador1((previousValue) => {
          nextTimer = previousValue.timer - 1;
          return { ...previousValue, timer: nextTimer };
        });

        handleUltimateWinner(nextTimer);

        if (nextTimer === 0) {
          clearInterval(timerIdX);
        }
      }, 1000);
    } else if (isNaN(jogador1.timer)) {
      setActiveTimer(3);
    }

    return () => {
      //clean-up function so that everytime da run effect runs it cleans what was done before and re-renders the new result
      if (timerIdX) {
        clearInterval(timerIdX);
      }
    };
  }, [jogador1.timer, currentPlayer, gamestart, ultimateWinner, isGameOver]); //sao necessarias as dependecias por causa do if, se o valor de um state estiver a ser alterado atraves do previousValue nao necessita da dependencia

  useEffect(() => {
    if (
      !isNaN(jogador2.timer) &&
      currentPlayer === PLAYER2 &&
      gamestart &&
      !isGameOver
    ) {
      setActiveTimer(2);
      let nextTimer;
      timerIdY = setInterval(() => {
        setJogador2((previousValue) => {
          nextTimer = previousValue.timer - 1;
          return { ...previousValue, timer: nextTimer };
        });

        handleUltimateWinner(nextTimer); //funçao que retorna o winner consoante condições de desfecho do jogo

        if (nextTimer === 0) {
          clearInterval(timerIdY);
        }
      }, 1000);
    } else if (isNaN(jogador2.timer)) {
      setActiveTimer(3);
    }

    return () => {
      if (timerIdY) {
        clearInterval(timerIdY);
      }
    };
  }, [jogador2.timer, currentPlayer, gamestart, ultimateWinner, isGameOver]);

  useEffect(() => {
    let winner;
    winner = calculateFullBoardWinnerByLine(jogador1, jogador2, numOfGamesPlayed, isGameOver);

    if(winner !== null){
      setUltimateWinner(winner);
      setIsGameOver(true);
    }else if(numOfGamesPlayed === 9 && jogador1.numOfWins !== jogador2.numOfWins){ //board full, vence o que tem mais wins
      setUltimateWinner(
        jogador1.numOfWins > jogador2.numOfWins
          ? jogador1.name
          : jogador2.name
      );
      setIsGameOver(true);
    }else if(jogador1.numOfWins === jogador2.numOfWins && numOfGamesPlayed === 9){ //board full e numWins
      setUltimateWinner("Empate");
      setIsGameOver(true);
    }

  }, [jogador1.numOfWins, jogador2.numOfWins, numEmpates, ultimateWinner, isGameOver]);

  /******************************
   *       TIMER FUNCTIONS      *
   ******************************/

  if (gamestart) {

    //const activeIndex = activeBoardIndex();
    const arrayAux = Array(9).fill(null);

    arrayAux.map(
      (
        _,
        index //como estao todos preenchidos com null nao convem iterar com o index pq como o valor null e o mesmo em todos pode haver duplicacao de keys
      ) =>
        tabuleiros.push(
          gamemode === "livre" ? (
            <Tabuleiro
              key={index}
              id={index}
              handleActiveBoard={handleActiveBoard}
              activeBoardIndex={activeBoardIndex}
              jogador1={jogador1}
              jogador2={jogador2}
              currentPlayer={currentPlayer}
              onSquareClick={handleCurrentPlayer}
              updateTabWins={handleNumOfWins}
              updateEmpates={handleEmpates}
              incrementGamesPlayed={handleNumOfGamesPlayed}
              allowedBoards={allowedBoards}
              handleAllowedBoards={handleAllowedBoards}
              handleBoardsWon={handleBoardsWon}
              handleUltimateWinner={handleUltimateWinner}
              resetBoard={resetBoard}
            />
          ) : (
            <TabuleiroModo2
              key={index}
              id={index}
              handleActiveBoard={handleActiveBoard} //ADD
              activeBoardIndex={activeBoardIndex} //ADD
              jogador1={jogador1}
              jogador2={jogador2}
              enabledBoards={enabledBoards}
              setEnabledBoards={setEnabledBoards}
              currentPlayer={currentPlayer}
              setClickedBoard={setClickedBoard}
              clickedBoard={clickedBoard}
              onSquareClick={handleCurrentPlayer}
              updateTabWins={handleNumOfWins}
              updateEmpates={handleEmpates} //ADD
              incrementGamesPlayed={handleNumOfGamesPlayed}
              allowedBoards={allowedBoards} //ADD
              handleAllowedBoards={handleAllowedBoards} //ADD
              handleBoardsWon={handleBoardsWon} //ADD
              handleUltimateWinner={handleUltimateWinner} //ADD
            />
          )
        )
    );
  }

  return (
    <>
      {!gamestart ? (
        <>
          <FormComponent
            handleJogador1MudarNome={handleJogador1MudarNome}
            handleJogador2MudarNome={handleJogador2MudarNome}
            handleSubmit={handleSubmit}
            setGamemode={setGamemode}
            jogador1={jogador1.name}
            jogador2={jogador2.name}
            handleTemporizador={handleTemporizador}
            handleComputerPlaying={handleComputerPlaying}
          />
        </>
      ) : (
        <>
          {/* TWO TIMERS VERSION */}
          <ControlBar
            jogador1={jogador1}
            jogador2={jogador2}
            currentPlayer={currentPlayer}
            timerX={isNaN(jogador1.timer) ? "--" : jogador1.timer + "s"}
            timerO={isNaN(jogador2.timer) ? "--" : jogador2.timer + "s"}
            activeTimer={activeTimer}
            handleSair={handleGameStart}
          />
          <div className="grid-container">{tabuleiros}</div>
          {isGameOver && (
            <GameOverModal
              gameover={true}
              ultimateWinner={ultimateWinner}
              handlePlayAgain={handlePlayAgain}
              handleSair={handleGameStart}
            />
          )}{" "}
          {/* falta condiçao para quando ha um winner sem ser por tempo */}
        </>
      )}
    </>
  );
}

export default App;
