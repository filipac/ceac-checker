'use client';

import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [caseNumber, setCaseNumber] = useState('');
  const [isValidFormat, setIsValidFormat] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showGiveUp, setShowGiveUp] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isInitializedRef = useRef(false);
  const lastMoveTime = useRef(0);
  const mousePosition = useRef({ x: 0, y: 0 });
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldMove, setShouldMove] = useState(true);
  const [flashEffect, setFlashEffect] = useState<string | null>(null);
  const [rotateScreen, setRotateScreen] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [invertColors, setInvertColors] = useState(false);
  const [blurScreen, setBlurScreen] = useState(false);
  const effectTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const alertsShownRef = useRef(false);
  const [touchPosition, setTouchPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentTaunt, setCurrentTaunt] = useState<string | null>(null);
  const [lastTauntTime, setLastTauntTime] = useState<number>(0);
  const [currentGiveUpMessage, setCurrentGiveUpMessage] = useState('');
  const giveUpIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const taunts = [
    "Can't touch this! 🕺",
    'Too slow, grandma! 👵',
    "You're as accurate as a stormtrooper! 🎯",
    'My ex was better at catching than you! 💔',
    'Is that your finger or are you just happy to miss me? 😏',
    "I'm not playing hard to get, I AM hard to get! 💁‍♀️",
    'Buy me dinner first! 🍷',
    'Stop touching me there! 😳',
    'At least take me on a date first! 🌹',
    "That's what she said! 😏",
    'Your aim is worse than your pickup lines! 🎯',
    "I've seen snails move faster! 🐌",
    "You couldn't catch COVID in 2020! 😷",
    "You handle that mouse like it's your first time! 🖱️",
    "Keep trying, I'm getting turned on! 🔥",
  ];

  const giveUpMessages = [
    'Admit defeat, weakling!',
    'Your mom would be disappointed...',
    'Even my grandma could click faster!',
    'Just give up already, this is sad 😢',
    "You're as persistent as my ex... and just as unsuccessful!",
    'This is more painful than my last breakup',
    "You're making the button uncomfortable...",
    "The safe word is 'Give Up'",
    "That's it, keep chasing... said no one ever",
    "You're like my dating life - lots of attempts, zero success",
  ];

  useEffect(() => {
    // Set initial give up message and start interval when showGiveUp becomes true
    if (showGiveUp && !giveUpIntervalRef.current) {
      setCurrentGiveUpMessage(
        giveUpMessages[Math.floor(Math.random() * giveUpMessages.length)]
      );

      // Change message every 7 seconds
      giveUpIntervalRef.current = setInterval(() => {
        setCurrentGiveUpMessage(
          giveUpMessages[Math.floor(Math.random() * giveUpMessages.length)]
        );
      }, 7000);
    }

    // Cleanup interval when component unmounts or showGiveUp becomes false
    return () => {
      if (giveUpIntervalRef.current) {
        clearInterval(giveUpIntervalRef.current);
        giveUpIntervalRef.current = null;
      }
    };
  }, [showGiveUp]);

  // Clear interval when game is successful
  useEffect(() => {
    if (isSuccess && giveUpIntervalRef.current) {
      clearInterval(giveUpIntervalRef.current);
      giveUpIntervalRef.current = null;
    }
  }, [isSuccess]);

  const showRandomTaunt = () => {
    const now = Date.now();
    // Only show a new taunt if at least 15 seconds have passed since the last one
    if (now - lastTauntTime < 15000) return;

    const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];
    setCurrentTaunt(randomTaunt);
    setLastTauntTime(now);
    setTimeout(() => setCurrentTaunt(null), 15000);
  };

  useEffect(() => {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const stopParam = urlParams.get('stop');
    setShouldMove(stopParam !== '1');
  }, []);

  // Add validation function
  const validateCaseNumber = (value: string) => {
    const regex = /^2025[A-Z]{2}\d+$/;
    return regex.test(value);
  };

  // Modify the input change handler
  const handleCaseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCaseNumber(value);
    setIsValidFormat(validateCaseNumber(value));
  };

  // Modify the useEffect for game start
  useEffect(() => {
    if (caseNumber && isValidFormat) {
      if (!gameStartTime) {
        setGameStartTime(Date.now());
      }
      // Set timer for showing give up button
      const timer = setTimeout(() => {
        setShowGiveUp(true);
      }, 40000); // 40 seconds
      return () => clearTimeout(timer);
    } else {
      setGameStartTime(null);
      setShowGiveUp(false);
    }
  }, [caseNumber, isValidFormat]); // Add isValidFormat to dependencies

  // Update timer in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && gameStartTime) {
      const timerInterval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 100);
      return () => clearInterval(timerInterval);
    }
  }, [gameStartTime]);

  // Clear all active effects
  const clearEffects = () => {
    setFlashEffect(null);
    setRotateScreen(false);
    setShakeScreen(false);
    setInvertColors(false);
    setBlurScreen(false);

    // Clean up any existing DOM elements
    const existingContainer = document.querySelector('.effect-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    const existingCanvas = document.querySelector('.matrix-canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }

    // Clear all intervals and timeouts
    effectTimeoutsRef.current.forEach(clearTimeout);
    effectTimeoutsRef.current = [];
  };

  const triggerSuccess = (isGiveUp: boolean = false) => {
    // Stop all movement and effects
    stopMoving();
    clearEffects();

    setIsSuccess(true);
    if (isGiveUp) {
      setGaveUp(true);
    }

    // Fire confetti immediately
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 100,
      disableForReducedMotion: true,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Initial burst
    const particleCount = 50;
    confetti({
      ...defaults,
      particleCount: 100,
      origin: { x: 0.5, y: 0.6 },
    });

    // Continuous bursts
    const startTime = Date.now();
    const duration = 3000;

    const interval = setInterval(() => {
      const timeLeft = startTime + duration - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 200);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!buttonRef.current || !caseNumber || !shouldMove) return;

    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });

    const button = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = button.left + button.width / 2;
    const buttonCenterY = button.top + button.height / 2;

    const distance = Math.sqrt(
      Math.pow(touch.clientX - buttonCenterX, 2) +
        Math.pow(touch.clientY - buttonCenterY, 2)
    );

    if (distance < 250) {
      setIsHovering(true);
      startMoving();
    } else if (distance > 400) {
      stopMoving();
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });

    if (!buttonRef.current || !caseNumber || !shouldMove) return;

    const button = buttonRef.current.getBoundingClientRect();
    if (
      touch.clientX >= button.left &&
      touch.clientX <= button.right &&
      touch.clientY >= button.top &&
      touch.clientY <= button.bottom
    ) {
      // If touched the button, move it immediately
      setIsHovering(true);
      moveButton();
      startMoving();
    }
  };

  const handleTouchEnd = () => {
    setTouchPosition(null);
    setIsHovering(false);
    stopMoving();
  };

  // Add touch event listeners
  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      stopMoving();
    };
  }, [caseNumber, shouldMove]);

  const moveButton = () => {
    if (!caseNumber || !buttonRef.current || !shouldMove) {
      setButtonPosition(centerButton());
      return;
    }

    const now = Date.now();
    if (now - lastMoveTime.current < 50) return;
    lastMoveTime.current = now;

    // Reduced probability to 5% and only if no taunt is currently showing
    if (!currentTaunt && Math.random() < 0.05) {
      showRandomTaunt();
    }

    const button = buttonRef.current.getBoundingClientRect();
    const currentPos = buttonPosition || centerButton();
    if (!currentPos) return;

    // Calculate button center position in viewport
    const buttonCenterX = button.left + button.width / 2;
    const buttonCenterY = button.top + button.height / 2;

    // Use touch position if available, otherwise use mouse position
    const targetPos = touchPosition || mousePosition.current;

    // Calculate angle between pointer and button
    const angle = Math.atan2(
      targetPos.y - buttonCenterY,
      targetPos.x - buttonCenterX
    );

    // Move in the opposite direction with some randomness
    const distance = Math.min(
      300,
      Math.min(window.innerWidth, window.innerHeight) / 3
    );
    const randomAngleOffset = ((Math.random() - 0.5) * Math.PI) / 1.5; // ±60 degrees
    const moveAngle = angle + Math.PI + randomAngleOffset;

    // Calculate new position relative to viewport
    let newX = button.left + Math.cos(moveAngle) * distance;
    let newY = button.top + Math.sin(moveAngle) * distance;

    // Add some random jitter
    newX += (Math.random() - 0.5) * 60;
    newY += (Math.random() - 0.5) * 60;

    // Keep button within viewport bounds with margin based on screen size
    const margin = Math.min(
      20,
      Math.min(window.innerWidth, window.innerHeight) * 0.05
    );
    newX = Math.max(
      margin,
      Math.min(newX, window.innerWidth - button.width - margin)
    );
    newY = Math.max(
      margin,
      Math.min(newY, window.innerHeight - button.height - margin)
    );

    // Convert viewport position to position relative to container
    if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      newX = newX - container.left - button.width / 2;
      newY = newY - container.top;
    }

    setButtonPosition({ x: newX, y: newY });
  };

  const startMoving = () => {
    if (moveIntervalRef.current || !shouldMove) return;
    moveIntervalRef.current = setInterval(moveButton, 100);
  };

  const stopMoving = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    mousePosition.current = { x: e.clientX, y: e.clientY };

    if (!buttonRef.current || !caseNumber || !shouldMove) return;

    const button = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = button.left + button.width / 2;
    const buttonCenterY = button.top + button.height / 2;

    const distance = Math.sqrt(
      Math.pow(e.clientX - buttonCenterX, 2) +
        Math.pow(e.clientY - buttonCenterY, 2)
    );

    if (distance < 250) {
      setIsHovering(true);
      startMoving();
    } else if (distance > 400) {
      stopMoving();
    }
  };

  // Reset position when case number is cleared
  useEffect(() => {
    if (!caseNumber && isInitializedRef.current) {
      setButtonPosition(centerButton());
      setIsHovering(false);
      stopMoving();
    }
  }, [caseNumber]);

  // Handle funny effects every 15 seconds (first one at 5s)
  useEffect(() => {
    if (!gameStartTime || !caseNumber) return;

    let currentEffectTimeout: NodeJS.Timeout | null = null;

    const cleanupCurrentEffect = () => {
      // Clean up any existing DOM elements
      const existingContainer = document.querySelector('.effect-container');
      if (existingContainer) {
        existingContainer.remove();
      }
      const existingCanvas = document.querySelector('.matrix-canvas');
      if (existingCanvas) {
        existingCanvas.remove();
      }

      // Clear all states
      setFlashEffect(null);
      setRotateScreen(false);
      setShakeScreen(false);
      setInvertColors(false);
      setBlurScreen(false);

      // Clear all intervals
      effectTimeoutsRef.current.forEach(clearTimeout);
      effectTimeoutsRef.current = [];

      if (currentEffectTimeout) {
        clearTimeout(currentEffectTimeout);
        currentEffectTimeout = null;
      }
    };

    const startRandomEffect = () => {
      cleanupCurrentEffect();

      const effects = [
        // Flash screen
        () => {
          setFlashEffect('flash');
        },
        // Rotate screen
        () => {
          setRotateScreen(true);
        },
        // Shake screen
        () => {
          setShakeScreen(true);
        },
        // Invert colors
        () => {
          setInvertColors(true);
        },
        // Blur screen
        () => {
          setBlurScreen(true);
        },
        // Cursor fire
        () => {
          const fire = (x: number, y: number) => {
            confetti({
              particleCount: 25,
              startVelocity: 20,
              spread: 360,
              origin: { x: x / window.innerWidth, y: y / window.innerHeight },
              colors: ['#ff0000', '#ff3300', '#ff6600', '#ff9900'],
              ticks: 100,
            });
          };

          const fireInterval = setInterval(() => {
            if (mousePosition.current) {
              fire(mousePosition.current.x, mousePosition.current.y);
            }
          }, 100);
          effectTimeoutsRef.current.push(fireInterval);
        },
        // Rain emojis
        () => {
          const container = document.createElement('div');
          container.className = 'effect-container';
          container.style.position = 'fixed';
          container.style.top = '0';
          container.style.left = '0';
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.pointerEvents = 'none';
          container.style.zIndex = '1000';
          document.body.appendChild(container);

          const emojis = [
            '😂',
            '🤪',
            '🤡',
            '👻',
            '💀',
            '🎃',
            '🌈',
            '🦄',
            '🍕',
            '💩',
            '👾',
            '🤖',
            '👽',
            '🎪',
          ];

          const createEmoji = () => {
            const emoji = document.createElement('div');
            emoji.style.position = 'absolute';
            emoji.style.left = Math.random() * 100 + '%';
            emoji.style.fontSize = Math.random() * 2 + 2 + 'rem';
            emoji.style.transform =
              'translateY(-100%) rotate(' + Math.random() * 360 + 'deg)';
            emoji.textContent =
              emojis[Math.floor(Math.random() * emojis.length)];
            container.appendChild(emoji);

            const animation = emoji.animate(
              [
                { transform: 'translateY(-100%) rotate(0deg)', opacity: 1 },
                { transform: 'translateY(100vh) rotate(720deg)', opacity: 0 },
              ],
              {
                duration: 3000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }
            );

            animation.onfinish = () => emoji.remove();
          };

          const emojiInterval = setInterval(createEmoji, 100);
          effectTimeoutsRef.current.push(emojiInterval);
        },
        // Matrix rain effect
        () => {
          const canvas = document.createElement('canvas');
          canvas.className = 'matrix-canvas';
          canvas.style.position = 'fixed';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.pointerEvents = 'none';
          canvas.style.zIndex = '999';
          canvas.style.opacity = '0.7';
          document.body.appendChild(canvas);

          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          const ctx = canvas.getContext('2d')!;

          const chars = '0123456789ABCDEF';
          const drops: number[] = [];
          const fontSize = 16;
          const columns = canvas.width / fontSize;

          for (let i = 0; i < columns; i++) {
            drops[i] = 1;
          }

          const drawMatrix = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
              const text = chars[Math.floor(Math.random() * chars.length)];
              ctx.fillText(text, i * fontSize, drops[i] * fontSize);
              if (
                drops[i] * fontSize > canvas.height &&
                Math.random() > 0.975
              ) {
                drops[i] = 0;
              }
              drops[i]++;
            }
          };

          const matrixInterval = setInterval(drawMatrix, 50);
          effectTimeoutsRef.current.push(matrixInterval);
        },
      ];

      // Start a random effect
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];
      randomEffect();

      // Schedule cleanup and next effect after 15 seconds
      currentEffectTimeout = setTimeout(() => {
        cleanupCurrentEffect();
        startRandomEffect(); // Start next effect immediately after cleanup
      }, 15000);
    };

    // Start first effect after 5 seconds
    const initialDelay = setTimeout(() => {
      startRandomEffect();
    }, 5000);

    return () => {
      clearTimeout(initialDelay);
      cleanupCurrentEffect();
    };
  }, [gameStartTime, caseNumber]); // Remove timeElapsed dependency

  const centerButton = () => {
    if (containerRef.current && buttonRef.current) {
      return {
        x: 0,
        y: 20,
      };
    }
    return null;
  };

  useEffect(() => {
    if (!isInitializedRef.current) {
      setButtonPosition(centerButton());
      isInitializedRef.current = true;
    }
  }, []);

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8
        ${flashEffect === 'flash' ? 'animate-flash' : ''}
        ${rotateScreen ? 'animate-rotate' : ''}
        ${shakeScreen ? 'animate-shake' : ''}
        ${invertColors ? 'animate-invert' : ''}
        ${blurScreen ? 'animate-blur' : ''}
      `}
    >
      <style jsx global>{`
        @keyframes flash {
          0%,
          100% {
            filter: brightness(1);
          }
          25%,
          75% {
            filter: brightness(1.5);
          }
          50% {
            filter: brightness(3);
            background: white;
          }
        }
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(-15px, 15px) rotate(-5deg);
          }
          50% {
            transform: translate(15px, -15px) rotate(5deg);
          }
          75% {
            transform: translate(-15px, -15px) rotate(-5deg);
          }
        }
        @keyframes invert {
          0%,
          100% {
            filter: invert(0);
          }
          25%,
          75% {
            filter: invert(0.5);
          }
          50% {
            filter: invert(1);
          }
        }
        @keyframes blur {
          0%,
          100% {
            filter: blur(0);
          }
          25%,
          75% {
            filter: blur(5px);
          }
          50% {
            filter: blur(10px);
          }
        }
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          5%,
          95% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(20px);
          }
        }
        .animate-flash {
          animation: flash 15s ease-in-out;
        }
        .animate-rotate {
          animation: rotate 15s linear forwards;
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
        .animate-invert {
          animation: invert 15s ease-in-out;
        }
        .animate-blur {
          animation: blur 15s ease-in-out;
        }
        .taunt-message {
          animation: fadeInOut 10s ease-in-out;
        }
      `}</style>

      {process.env.NODE_ENV === 'development' && gameStartTime && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-mono text-sm">
          Time: {timeElapsed}s / 40s
          <br />
          {timeElapsed < 5 ? (
            <>First effect in: {5 - timeElapsed}s</>
          ) : (
            <>Current effect time: {timeElapsed % 15}s / 15s</>
          )}
          <br />
          Give up: {showGiveUp ? 'Shown' : 'Hidden'}
        </div>
      )}
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">
          DV 2025 case chance checker
        </h1>
        <div className="space-y-4">
          <input
            type="text"
            value={caseNumber}
            onChange={handleCaseNumberChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !alertsShownRef.current) {
                e.preventDefault();
                alert('You tried to be a smart-ass, eh?');
                alert('You can only submit by clicking THE button');
                alertsShownRef.current = true;
              }
            }}
            placeholder="Enter Case Number (Format: 2025XX...)"
            className={`w-full px-4 py-2 text-lg rounded-lg bg-gray-700 text-white placeholder-gray-400 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              caseNumber && !isValidFormat
                ? 'border-red-500'
                : 'border-gray-600'
            }`}
          />
          {caseNumber && !isValidFormat && (
            <p className="text-red-500 text-sm mt-1 text-left">
              Invalid format. Must be 2025 followed by 2 letters and numbers
              (e.g., 2025EU12345)
            </p>
          )}

          {showGiveUp && !isSuccess && (
            <button
              onClick={() => triggerSuccess(true)}
              className="px-6 py-3 text-lg font-semibold text-white rounded-lg shadow-lg bg-red-500 hover:bg-red-600 transform hover:scale-105 active:scale-95 transition-transform"
            >
              {currentGiveUpMessage}
            </button>
          )}

          <div
            ref={containerRef}
            className="relative h-[200px] border-2 border-transparent mx-auto"
          >
            {isSuccess ? (
              <div className="animate-fade-in p-6 rounded-lg bg-green-500 text-white shadow-lg">
                <p className="text-xl font-bold mb-2">
                  {gaveUp
                    ? 'Good for you giving up, the button is unclickable!'
                    : 'Congratulations! You did it! 🎉'}
                </p>
                <p className="text-lg italic">
                  &ldquo;Nobody can predict your case chances better than
                  BritSimon, though. So no predictions for you today.&rdquo;
                </p>
              </div>
            ) : (
              <button
                ref={buttonRef}
                onClick={() => triggerSuccess(false)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: buttonPosition
                    ? `translate(calc(-50% + ${buttonPosition.x}px), ${buttonPosition.y}px)`
                    : 'translateX(-50%)',
                  transition: isHovering ? 'transform 0.15s ease-out' : 'none',
                  visibility:
                    buttonPosition && isValidFormat ? 'visible' : 'hidden',
                  top: 0,
                  zIndex: 50,
                }}
                className={`px-6 py-3 text-lg font-semibold text-white rounded-lg shadow-lg
                  ${isValidFormat ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'}
                  transform hover:scale-105 active:scale-95 transition-transform`}
              >
                Check my chances
              </button>
            )}
          </div>
        </div>
      </div>

      {currentTaunt && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '300px',
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            opacity: 1,
            transition: 'opacity 0.5s ease-in-out',
            willChange: 'transform, opacity',
            transformStyle: 'preserve-3d',
            pointerEvents: 'none',
          }}
        >
          {currentTaunt}
        </div>
      )}
    </main>
  );
}
