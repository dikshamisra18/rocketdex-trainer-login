import { useState } from "react";
import Cloud from "@/components/Cloud";
import OceanWave from "@/components/OceanWave";
import Stars from "@/components/Stars";
import PokeballButton from "@/components/PokeballButton";
import islandImg from "@/assets/island.png";
import rocketBalloon from "@/assets/rocket-balloon.png";
import pokemon1 from "@/assets/pokemon1.png";
import pokemon2 from "@/assets/pokemon2.png";

const Index = () => {
  const [isNight, setIsNight] = useState(false);

  return (
    <div
      className={`h-screen w-screen relative overflow-hidden transition-all duration-1000 ${
        isNight
          ? "bg-gradient-to-b from-night-top to-night-bottom"
          : "bg-gradient-to-b from-sky-top to-sky-bottom"
      }`}
    >
      {/* Day/Night Toggle */}
      <button
        onClick={() => setIsNight(!isNight)}
        className="absolute top-5 right-5 z-20 px-3 py-2 rounded-lg bg-card/90 font-pixel text-[10px] text-card-foreground cursor-pointer border-2 border-border hover:scale-105 transition-transform"
      >
        {isNight ? "☀ Day" : "🌙 Night"}
      </button>

      {/* Clouds */}
      <Cloud className="w-[220px] h-[70px] top-[15%] left-[-300px] animate-cloud-1" />
      <Cloud className="w-[180px] h-[60px] top-[30%] left-[-400px] animate-cloud-2" />
      <Cloud className="w-[250px] h-[80px] top-[50%] left-[-500px] animate-cloud-3" />

      {/* Stars (Night Only) */}
      {isNight && <Stars />}

      {/* Ocean Waves */}
      <OceanWave />

      {/* Island */}
      <img
        src={islandImg}
        alt="Pixel island"
        className="absolute bottom-[100px] left-1/2 -translate-x-1/2 w-[60%] max-w-[900px] z-[2]"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Floating Pokemon */}
      <img
        src={pokemon1}
        alt="Pokemon"
        className="absolute w-[180px] max-w-[20vw] top-[5%] left-[5%] z-[3] animate-float"
        style={{ imageRendering: "pixelated" }}
      />
      <img
        src={pokemon2}
        alt="Pokemon"
        className="absolute w-[180px] max-w-[20vw] top-[10%] right-[5%] z-[3] animate-float-delay-1"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Team Rocket Balloon */}
      <img
        src={rocketBalloon}
        alt="Rocket Balloon"
        className="absolute w-[200px] bottom-[-300px] right-[5%] z-[5] animate-rocket"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Login */}
      <div className="flex justify-center items-center h-full relative z-10">
        <div className="w-[350px] bg-card/95 rounded-[25px] p-6 flex flex-col justify-center gap-5 text-center shadow-[0px_15px_40px_rgba(0,0,0,0.3)]">
          <h2 className="font-pixel text-sm text-card-foreground leading-relaxed">
            Welcome Trainer
          </h2>
          <p className="font-pixel text-[8px] text-muted-foreground">
            Sign in to RocketDex
          </p>
          <input
            type="text"
            placeholder="Username"
            className="p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card text-card-foreground outline-none focus:border-primary transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-lg border-2 border-secondary font-pixel text-[10px] bg-card text-card-foreground outline-none focus:border-primary transition-colors"
          />
          <PokeballButton />
        </div>
      </div>
    </div>
  );
};

export default Index;
