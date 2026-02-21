import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

// The hellish help page - designed to frustrate users
const HelpPage = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0); // 0=intro, 1=captcha1, 2=captcha2, 3=minigame, 4=form, 5=more captcha, 6=success?
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [mathProblem, setMathProblem] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [buttonPos, setButtonPos] = useState({ x: 50, y: 50 });
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameScore, setGameScore] = useState(0);
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');

  // Generate random math problem
  const genMath = useCallback(() => {
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 50) + 1;
    const ops = ['+', '-', '×'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    setMathProblem({ a, b, op, answer });
    setCaptchaAnswer('');
  }, []);

  useEffect(() => {
    if (stage === 1 || stage === 5) genMath();
  }, [stage, genMath]);

  // Minigame timer
  useEffect(() => {
    if (stage === 3 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (stage === 3 && timeLeft === 0) {
      if (gameScore >= 10) {
        setStage(4);
        toast.success("You passed the minigame! ...barely.");
      } else {
        toast.error("Too slow! Try again!");
        setTimeLeft(10);
        setGameScore(0);
      }
    }
  }, [stage, timeLeft, gameScore]);

  // Move button when mouse gets close (for the dodge button minigame)
  const moveButton = () => {
    setButtonPos({
      x: Math.random() * 70 + 10,
      y: Math.random() * 60 + 20,
    });
    setGameScore(s => s + 1);
  };

  const checkCaptcha = () => {
    if (parseInt(captchaAnswer) === mathProblem.answer) {
      if (stage === 1) {
        toast.success("Correct! But wait, there's more...");
        setStage(2);
      } else if (stage === 5) {
        toast.success("Finally! Your message has been... filed.");
        setStage(6);
      }
    } else {
      toast.error("Wrong answer! Are you even a real trainer?");
      genMath();
    }
  };

  // Stage 2: Impossible "select all squares" captcha
  const [selectedSquares, setSelectedSquares] = useState<Set<number>>(new Set());
  const toggleSquare = (i: number) => {
    const next = new Set(selectedSquares);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelectedSquares(next);
  };

  const checkImageCaptcha = () => {
    // It's impossible - the "correct" answer keeps changing
    toast.error("Hmm, that doesn't look right. Try again!");
    setSelectedSquares(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-top to-night-bottom">
      <header className="flex items-center gap-3 px-4 py-3 bg-primary/90">
        <button onClick={() => navigate('/feed')} className="text-primary-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-pixel text-[10px] text-primary-foreground">🆘 Help Center</h1>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Stage 0: Intro */}
        {stage === 0 && (
          <div className="bg-card/90 rounded-2xl p-6 text-center space-y-4">
            <p className="font-pixel text-[10px] text-card-foreground">
              Need help? We're here for you!*
            </p>
            <p className="font-pixel text-[6px] text-muted-foreground">
              *Subject to verification that you are not a bot, a ghost-type Pokemon, or a nuisance.
            </p>
            <button
              onClick={() => setStage(1)}
              className="bg-primary text-primary-foreground font-pixel text-[9px] px-4 py-2 rounded-lg hover:bg-primary/80"
            >
              Contact Support
            </button>
          </div>
        )}

        {/* Stage 1: Math CAPTCHA */}
        {stage === 1 && (
          <div className="bg-card/90 rounded-2xl p-6 text-center space-y-4">
            <p className="font-pixel text-[9px] text-card-foreground">
              🤖 Prove you're not a Ditto!
            </p>
            <p className="font-pixel text-[14px] text-primary">
              {mathProblem.a} {mathProblem.op} {mathProblem.b} = ?
            </p>
            <input
              type="number"
              value={captchaAnswer}
              onChange={e => setCaptchaAnswer(e.target.value)}
              className="w-24 p-2 text-center rounded-lg border-2 border-secondary font-pixel text-[12px] bg-card text-card-foreground outline-none focus:border-primary"
            />
            <br />
            <button
              onClick={checkCaptcha}
              className="bg-primary text-primary-foreground font-pixel text-[8px] px-4 py-2 rounded-lg hover:bg-primary/80"
            >
              Verify
            </button>
          </div>
        )}

        {/* Stage 2: Image grid CAPTCHA (impossible) */}
        {stage === 2 && (
          <div className="bg-card/90 rounded-2xl p-6 text-center space-y-3">
            <p className="font-pixel text-[8px] text-card-foreground">
              Select all squares containing a Pikachu
            </p>
            <div className="grid grid-cols-3 gap-1 w-48 mx-auto">
              {Array.from({ length: 9 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => toggleSquare(i)}
                  className={`aspect-square rounded-md text-2xl flex items-center justify-center border-2 transition-colors ${
                    selectedSquares.has(i)
                      ? 'border-primary bg-primary/20'
                      : 'border-border bg-muted/50'
                  }`}
                >
                  {['⚡', '🌊', '🔥', '🌿', '⚡', '💀', '🐉', '⚡', '🧊'][i]}
                </button>
              ))}
            </div>
            <button
              onClick={checkImageCaptcha}
              className="bg-primary text-primary-foreground font-pixel text-[8px] px-4 py-2 rounded-lg hover:bg-primary/80"
            >
              Verify
            </button>
            <button
              onClick={() => {
                setClickCount(c => c + 1);
                if (clickCount >= 4) {
                  toast("Fine, you can skip this one...", { icon: '😤' });
                  setStage(3);
                  setClickCount(0);
                } else {
                  toast.error("Try harder!");
                }
              }}
              className="block mx-auto font-pixel text-[6px] text-muted-foreground hover:text-card-foreground"
            >
              I can't solve this ({5 - clickCount} clicks to skip)
            </button>
          </div>
        )}

        {/* Stage 3: Click the button minigame */}
        {stage === 3 && (
          <div className="bg-card/90 rounded-2xl p-6 text-center space-y-3">
            <p className="font-pixel text-[8px] text-card-foreground">
              🎮 MINIGAME: Click the Pokeball 10 times!
            </p>
            <p className="font-pixel text-[10px] text-primary">
              Time: {timeLeft}s | Score: {gameScore}/10
            </p>
            <div className="relative w-full h-48 bg-muted/30 rounded-xl overflow-hidden">
              <button
                onClick={moveButton}
                className="absolute w-10 h-10 rounded-full pokeball-btn transition-all duration-100 hover:scale-90"
                style={{
                  left: `${buttonPos.x}%`,
                  top: `${buttonPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          </div>
        )}

        {/* Stage 4: The actual form (finally) */}
        {stage === 4 && (
          <div className="bg-card/90 rounded-2xl p-6 space-y-3">
            <p className="font-pixel text-[9px] text-card-foreground text-center">
              🎉 You made it! Submit your request:
            </p>
            <input
              type="text"
              placeholder="Subject"
              value={formSubject}
              onChange={e => setFormSubject(e.target.value)}
              className="w-full p-2 rounded-lg border-2 border-secondary font-pixel text-[9px] bg-card text-card-foreground outline-none focus:border-primary"
            />
            <textarea
              placeholder="Describe your issue..."
              value={formMessage}
              onChange={e => setFormMessage(e.target.value)}
              className="w-full p-2 rounded-lg border-2 border-secondary font-pixel text-[9px] bg-card text-card-foreground outline-none focus:border-primary min-h-[80px] resize-none"
            />
            <button
              onClick={() => {
                if (!formSubject || !formMessage) {
                  toast.error("Fill in all fields!");
                  return;
                }
                toast("Wait! One more verification...", { icon: '🤡' });
                setStage(5);
                genMath();
              }}
              className="w-full py-2 bg-primary text-primary-foreground font-pixel text-[9px] rounded-lg hover:bg-primary/80"
            >
              Submit
            </button>
          </div>
        )}

        {/* Stage 5: ANOTHER captcha */}
        {stage === 5 && (
          <div className="bg-card/90 rounded-2xl p-6 text-center space-y-4">
            <p className="font-pixel text-[9px] text-card-foreground">
              🤖 One more CAPTCHA! Almost there!
            </p>
            <p className="font-pixel text-[14px] text-primary">
              {mathProblem.a} {mathProblem.op} {mathProblem.b} = ?
            </p>
            <input
              type="number"
              value={captchaAnswer}
              onChange={e => setCaptchaAnswer(e.target.value)}
              className="w-24 p-2 text-center rounded-lg border-2 border-secondary font-pixel text-[12px] bg-card text-card-foreground outline-none focus:border-primary"
            />
            <br />
            <button
              onClick={checkCaptcha}
              className="bg-primary text-primary-foreground font-pixel text-[8px] px-4 py-2 rounded-lg hover:bg-primary/80"
            >
              Final Verify
            </button>
          </div>
        )}

        {/* Stage 6: "Success" */}
        {stage === 6 && (
          <div className="bg-card/90 rounded-2xl p-6 text-center space-y-4">
            <p className="font-pixel text-[10px] text-card-foreground">
              ✅ Your request has been submitted!
            </p>
            <p className="font-pixel text-[7px] text-muted-foreground">
              Expected response time: 3-5 business years. Team Rocket appreciates your patience.
            </p>
            <p className="font-pixel text-[6px] text-muted-foreground italic">
              (Your message was not actually sent anywhere. Meowth ate it.)
            </p>
            <button
              onClick={() => navigate('/feed')}
              className="bg-primary text-primary-foreground font-pixel text-[9px] px-4 py-2 rounded-lg hover:bg-primary/80"
            >
              Back to Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpPage;
