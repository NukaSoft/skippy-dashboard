import { Github, Linkedin, Youtube, Globe } from "lucide-react";

const LINKS = [
  { href: "https://github.com/NukaSoft/skippy-dashboard", label: "GitHub", Icon: Github },
  { href: "https://linkedin.com/in/nukasoft", label: "LinkedIn", Icon: Linkedin },
  { href: "https://youtube.com/@NukaSoft", label: "YouTube", Icon: Youtube },
  { href: "https://nukasoft.ai", label: "nukasoft.ai", Icon: Globe },
] as const;

/** Every page ends with this footer. */
export function FootLinks() {
  return (
    <footer
      className="mt-10 pt-4 flex items-center justify-between flex-wrap gap-3"
      style={{ borderTop: "1px dashed var(--pip-border)" }}
    >
      <div className="font-mono text-[0.6875rem] text-pip-dark">
        Vault 69 · NukaSoft Command Center
      </div>
      <div className="flex items-center gap-4">
        {LINKS.map(({ href, label, Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-heading font-bold uppercase tracking-[0.16em] text-[0.625rem] text-pip-dim hover:text-pip-cream transition-colors"
            title={label}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </footer>
  );
}
