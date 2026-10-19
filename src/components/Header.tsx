interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({ isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-title">
        <span>{'\u{1F42E}'}</span> Vakita <span className="header-badge">Calc</span>
      </div>
      <button
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label="Cambiar tema"
        title="Modo claro/oscuro"
      >
        {isDark ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
      </button>
    </header>
  );
}
