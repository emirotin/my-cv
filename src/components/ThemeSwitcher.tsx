import type React from "react";
import { useEffect, useState } from "react";

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.theme) {
      setTheme(localStorage.theme ?? "auto");
    }
  }, []);

  useEffect(() => {
    const cl = document.documentElement.classList;

    localStorage.theme = theme;

    if (theme === "auto") {
      cl.remove("is-dark", "is-light");
    } else if (theme === "light") {
      cl.add("is-light");
      cl.remove("is-dark");
    } else if (theme === "dark") {
      cl.add("is-dark");
      cl.remove("is-light");
    }
  }, [theme]);

  return (
    <select
      name="themeSwitcher"
      id="themeSwitcher"
      value={theme ?? "auto"}
      onChange={(e) => setTheme(e.target.value)}
    >
      <option value="auto">Auto</option>
      <option value="light">Light theme</option>
      <option value="dark">Dark theme</option>
    </select>
  );
};

export default ThemeSwitcher;
