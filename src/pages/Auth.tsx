import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Cloud from '@/components/Cloud';
import OceanWave from '@/components/OceanWave';
import Stars from '@/components/Stars';
import PokeballButton from '@/components/PokeballButton';
import islandImg from '@/assets/island.png';
import rocketBalloon from '@/assets/rocket-balloon.png';
import pokemon1 from '@/assets/pokemon1.png';
import pokemon2 from '@/assets/pokemon2.png';
import { toast } from 'sonner';

const Auth = () => {
  const [isNight, setIsNight] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [rocketTaps, setRocketTaps] = useState(0);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Secret: tap the rocket balloon 5 times to access Team Rocket's truth feed
  const handleRocketTap = () => {
    const newTaps = rocketTaps + 1;
    setRocketTaps(newTaps);
    if (newTaps >= 5) {
      setRocketTaps(0);
      toast('🚀 Prepare for trouble...', { icon: '🔴' });
      navigate('/rocket-truth');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      if (!username.trim()) {
        toast.error('Username is required');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email to confirm your account!');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate('/feed');
      }
    }
    setLoading(false);
  };

  return (
    <div
      className={`h-screen w-screen relative overflow-hidden transition-all duration-1000 ${
        isNight
          ? 'bg-gradient-to-b from-night-top to-night-bottom'
          : 'bg-gradient-to-b from-sky-top to-sky-bottom'
      }`}
    >
      <button
        onClick={() => setIsNight(!isNight)}
        className="absolute top-5 right-5 z-20 px-3 py-2 rounded-lg bg-card/90 font-pixel text-[10px] text-card-foreground cursor-pointer border-2 border-border hover:scale-105 transition-transform"
      >
        {isNight ? '☀ Day' : '🌙 Night'}
      </button>

      <Cloud className="w-[220px] h-[70px] top-[15%] left-[-300px] animate-cloud-1" />
      <Cloud className="w-[180px] h-[60px] top-[30%] left-[-400px] animate-cloud-2" />
      <Cloud className="w-[250px] h-[80px] top-[50%] left-[-500px] animate-cloud-3" />

      {isNight && <Stars />}
      <OceanWave />

      <img
        src={islandImg}
        alt="Pixel island"
        className="absolute bottom-[60px] left-1/2 -translate-x-1/2 w-[35%] max-w-[500px] z-[2]"
        style={{ imageRendering: 'pixelated' }}
      />
      <img
        src={pokemon1}
        alt="Pokemon"
        className="absolute w-[180px] max-w-[20vw] top-[5%] left-[5%] z-[3] animate-float"
        style={{ imageRendering: 'pixelated' }}
      />
      <img
        src={pokemon2}
        alt="Pokemon"
        className="absolute w-[180px] max-w-[20vw] top-[10%] right-[5%] z-[3] animate-float-delay-1"
        style={{ imageRendering: 'pixelated' }}
      />
      <img
        src={rocketBalloon}
        alt="Rocket Balloon"
        className="absolute w-[200px] bottom-[-300px] right-[5%] z-[5] animate-rocket cursor-pointer"
        style={{ imageRendering: 'pixelated' }}
        onClick={handleRocketTap}
      />

      <div className="flex justify-center items-center h-full relative z-10">
        <form
          onSubmit={handleSubmit}
          className="w-[350px] bg-card/95 rounded-[25px] p-6 flex flex-col justify-center gap-4 text-center shadow-[0px_15px_40px_rgba(0,0,0,0.3)]"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl">🚀</span>
            <h2 className="font-pixel text-sm text-card-foreground leading-relaxed">
              RocketDex
            </h2>
          </div>
          <p className="font-pixel text-[8px] text-muted-foreground">
            {isSignUp ? 'Create your RocketDex account' : 'Sign in to RocketDex'}
          </p>

          {isSignUp && (
            <input
              type="text"
              placeholder="Trainer Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card text-card-foreground outline-none focus:border-primary transition-colors"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card text-card-foreground outline-none focus:border-primary transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card text-card-foreground outline-none focus:border-primary transition-colors"
            required
            minLength={6}
          />

          <PokeballButton onClick={() => {}} />

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-pixel text-[8px] text-primary hover:underline cursor-pointer bg-transparent border-none"
          >
            {isSignUp ? 'Already a trainer? Sign In' : 'New trainer? Sign Up'}
          </button>

          {loading && (
            <p className="font-pixel text-[8px] text-muted-foreground animate-pulse">
              Loading...
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;
