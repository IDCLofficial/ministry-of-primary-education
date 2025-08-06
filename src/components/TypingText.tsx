'use client'

import { useEffect, useState } from 'react';

const sentences = [
  "Transforming Education",
  "Raising the Standard of Learning",
  "Empowering Students"
];


export function TypingText() {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0); // sentence index
  const [charIndex, setCharIndex] = useState(0); // character index
  const [isDeleting, setIsDeleting] = useState(false);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const currentSentence = sentences[index % sentences.length];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex <= currentSentence.length) {
      setFade(true);
      timeout = setTimeout(() => {
        setDisplayedText(currentSentence.substring(0, charIndex));
        setCharIndex(charIndex + 1);
      }, 100);
    } else if (isDeleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayedText(currentSentence.substring(0, charIndex));
        setCharIndex(charIndex - 1);
      }, 40);
    } else if (!isDeleting && charIndex > currentSentence.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && charIndex < 0) {
      setIsDeleting(false);
      setFade(false);
      setCharIndex(0);
      setIndex((prev) => (prev + 1) % sentences.length);
      setTimeout(() => setFade(true), 200);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, index]);

  return (
    <span className={`typing-wrapper ${fade ? 'fade-in' : 'fade-out'}`}>
      {displayedText}
      <span className="blinking-cursor">|</span>
    </span>
  );
}
