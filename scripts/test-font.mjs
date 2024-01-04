import fontConfig from "../src/lcd-font/alphabet.json" assert { type: "json" };

const printChar = (char) => {
  if (char == " ") {
    console.log();
    return;
  }

  char = fontConfig.characterMap[char].char;
  char.forEach((line) =>
    console.log(line.map((point) => (point === 1 ? "*" : " ")).join("")),
  );
  console.log();
};

"Astro is OK!".split("").forEach(printChar);
