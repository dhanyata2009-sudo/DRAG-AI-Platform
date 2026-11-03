import { Link } from "react-router-dom";
import { AtSign, MessageCircle, PlaySquare, Briefcase } from "lucide-react";
import Logo from "../common/Logo";
import { ROUTES } from "../../utils/constants";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Demo login", to: ROUTES.LOGIN },
      { label: "Dashboard", to: ROUTES.DASHBOARD },
      { label: "Projects", to: ROUTES.PROJECTS },
      { label: "New video", to: ROUTES.CREATE_PROJECT },
      { label: "New PPT", to: ROUTES.CREATE_PPT },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#home" },
      { label: "Careers", href: "mailto:careers@drag.ai" },
      { label: "Contact", href: "mailto:hello@drag.ai" },
      { label: "Video API", href: "https://docs.heygen.com/",target: "_blank", rel: "noopener noreferrer" },
      { label: "PPT API", href: "https://higgsfield.ai/" ,target: "_blank", rel: "noopener noreferrer" },
    ],
  },
];

const Footer = () => (
  <footer className="relative border-t border-app bg-panel/40 mt-24">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 grid grid-cols-2 lg:grid-cols-6 gap-10">
      <div className="col-span-2">
        <Logo />
        <p className="mt-4 text-sm text-subtle max-w-xs leading-relaxed">
          Create AI video generation requests and presentation workflows from one clean,
          backend-ready frontend.
        </p>
        <div className="flex items-center gap-3 mt-5">
          {[
            { Icon: AtSign, href: "mailto:hello@drag.ai", label: "Email DRAG.ai" },
            { Icon: MessageCircle, href: "mailto:support@drag.ai", label: "Contact support" },
            { Icon: PlaySquare, href: "/#features", label: "Explore features" },
            { Icon: Briefcase, href: "mailto:careers@drag.ai", label: "Careers" },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              className="h-9 w-9 flex items-center justify-center rounded-lg glass text-subtle hover:text-body hover:-translate-y-0.5 transition-all"
              aria-label={label}
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>

      
{columns.map((col) => (
  <div key={col.title}>
    <h4 className="text-sm font-semibold text-body mb-4 font-display">
      {col.title}
    </h4>

    <ul className="space-y-3">
      {col.links.map((link) => (
        <li key={link.label}>
          {link.to ? (
            <Link
              to={link.to}
              className="text-sm text-subtle hover:text-body transition-colors"
            >
              {link.label}
            </Link>
          ) : (
            <a
              href={link.href}
              target={link.target}
              rel={link.rel}
              className="text-sm text-subtle hover:text-body transition-colors"
            >
              {link.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
))}

    </div>
    <div className="border-t border-app py-6 px-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
      <p className="text-xs text-faint">© {new Date().getFullYear()} DRAG.ai. All rights reserved.</p>
      <div className="flex gap-5 text-xs text-faint">
        <a href="mailto:privacy@drag.ai" className="hover:text-body">Privacy</a>
        <a href="mailto:legal@drag.ai" className="hover:text-body">Terms</a>
      </div>
    </div>
  </footer>
);

export default Footer;
