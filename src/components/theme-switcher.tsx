import {
  type RemixiconComponentType,
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import {
  type ColorThemeMode,
  ColorThemeModes,
  setColorThemeMode,
  useColorThemeMode,
} from "@/state/color-theme-store";

const THEME_OPTIONS: readonly {
  Icon: RemixiconComponentType;
  label: string;
  mode: ColorThemeMode;
}[] = [
  {
    Icon: RiSunLine,
    label: "Light",
    mode: ColorThemeModes.LIGHT,
  },
  {
    Icon: RiMoonLine,
    label: "Dark",
    mode: ColorThemeModes.DARK,
  },
  {
    Icon: RiComputerLine,
    label: "System",
    mode: ColorThemeModes.SYSTEM,
  },
];

export function ThemeSwitcher() {
  const mode = useColorThemeMode();

  return (
    <div
      aria-label="Color theme"
      className="flex h-8 items-center overflow-hidden rounded-lg border border-border bg-muted/60 p-0.5"
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = option.mode === mode;
        const ThemeIcon = option.Icon;

        return (
          <button
            aria-checked={isActive}
            aria-label={`${option.label} theme`}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              isActive && "bg-background text-foreground shadow-sm ring-1 ring-border",
            )}
            key={option.mode}
            onClick={() => {
              setColorThemeMode(option.mode);
            }}
            role="radio"
            title={`${option.label} theme`}
            type="button"
          >
            <ThemeIcon aria-hidden="true" className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
