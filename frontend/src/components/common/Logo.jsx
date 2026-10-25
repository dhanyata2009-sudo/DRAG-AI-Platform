import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { ROUTES } from "../../utils/constants";

/**
 * Official DRAG.ai logo. Do not replace/redesign — always render the
 * uploaded brand asset from /src/assets/logo.png.
 */
const Logo = ({ withWordmark = true, size = "md", to = ROUTES.HOME }) => {
  const sizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
  };

  const content = (
    <span className="inline-flex items-center gap-2.5 select-none">
      <img
        src={logo}
        alt="DRAG.ai logo"
        className={`${sizes[size]} rounded-xl object-cover shadow-[0_0_18px_rgba(118,82,55,0.24)]`}
      />
      {withWordmark && (
        <span className="font-display font-semibold text-lg tracking-tight text-body">
          DRAG<span className="text-gradient">.ai</span>
        </span>
      )}
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} aria-label="DRAG.ai home">
      {content}
    </Link>
  );
};

export default Logo;
