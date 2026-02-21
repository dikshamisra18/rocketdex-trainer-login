const PokeballButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="pokeball-btn self-center"
    onClick={onClick}
    aria-label="Sign In"
    type="submit"
  />
);

export default PokeballButton;
