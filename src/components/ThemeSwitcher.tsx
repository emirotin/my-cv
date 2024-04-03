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
    <div className="flex gap-2 items-center">
      <label htmlFor="themeSwitcher" className="font-bold">
        Theme:
      </label>
      <select
        name="themeSwitcher"
        id="themeSwitcher"
        value={theme ?? "auto"}
        onChange={(e) => setTheme(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="auto">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;
