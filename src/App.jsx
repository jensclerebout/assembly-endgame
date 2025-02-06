import { useState } from 'react';
import { clsx } from 'clsx';
import { languages } from './languages';
import { getFarewellText, getRandomWord } from './utils';
import Confetti from 'react-confetti';

export default function App() {
  // State values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);

  // Derived values
  const numberOfGuessesLeft = languages.length - 1;
  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter),
  ).length;

  const isGameWon = currentWord
    .split('')
    .every((letter) => guessedLetters.includes(letter));
  const isGameLost = wrongGuessCount >= languages.length - 1;
  const isGameOver = isGameWon || isGameLost;

  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  const letterElements = currentWord.split('').map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter);

    const letterClassName = clsx(
      'word__letter',
      isGameLost && !guessedLetters.includes(letter) && 'word__letter--missed',
    );

    return (
      <span className={letterClassName} key={index}>
        {shouldRevealLetter ? letter.toUpperCase() : ''}
      </span>
    );
  });

  function addGuessedLetter(letter) {
    setGuessedLetters((prevLetters) => {
      return prevLetters.includes(letter)
        ? prevLetters
        : [...prevLetters, letter];
    });
  }

  function startNewGame() {
    setCurrentWord(getRandomWord());
    setGuessedLetters([]);
  }

  const keyboardElements = alphabet.split('').map((letter) => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });

    return (
      <button
        className={`keyboard__letter keyboard__letter--${className}`}
        key={letter}
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
        onClick={() => addGuessedLetter(letter)}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  const languageElements = languages.map((language, index) => {
    const isLanguageLost = index < wrongGuessCount;

    const className = clsx(
      'language-chips__chip',
      isLanguageLost && 'language-chips__chip--lost',
    );

    const styles = {
      backgroundColor: language.backgroundColor,
      color: language.color,
    };

    return (
      <span key={language.name} style={styles} className={className}>
        {language.name}
      </span>
    );
  });

  const gameStatusClass = clsx('game-status', {
    'game-status--won': isGameWon,
    'game-status--lost': isGameLost,
    'game-status--farewell': !isGameOver && isLastGuessIncorrect,
  });

  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <p className="game-status__farewell-message">
          {getFarewellText(languages[wrongGuessCount - 1].name)}
        </p>
      );
    }

    if (isGameWon) {
      return (
        <>
          <h2 className="game-status__status">You win!</h2>
          <p className="game-status__info">Well done! 🍕</p>
        </>
      );
    }

    if (isGameLost) {
      return (
        <>
          <h2 className="game-status__status">Game over!</h2>
          <p className="game-status__info">
            You lose! Better start learning Assembly!
          </p>
        </>
      );
    }

    return null;
  }

  return (
    <main>
      {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}
      <header className="header">
        <h1 className="header__title">Assembly Endgame</h1>
        <p className="header__description">
          Guess the word within 8 attempt to keep the programming world safe
          from Assembly!
        </p>
      </header>
      <section aria-live="polite" role="status" className={gameStatusClass}>
        {renderGameStatus()}
      </section>
      <section className="language-chips">{languageElements}</section>
      <section className="word">{letterElements}</section>

      <section className="sr-only" aria-live="polite" role="status">
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word.`
            : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
          You have {numberOfGuessesLeft} attempts left
        </p>

        <p>
          Current word:{' '}
          {currentWord
            .split('')
            .map((letter) =>
              guessedLetters.includes(letter) ? letter + '.' : 'blank.',
            )
            .join(' ')}
        </p>
      </section>
      <section className="keyboard">{keyboardElements}</section>
      {isGameOver && (
        <button onClick={startNewGame} className="new-game-btn">
          New Game
        </button>
      )}
    </main>
  );
}
