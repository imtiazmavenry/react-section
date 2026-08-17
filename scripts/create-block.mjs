import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const blockName = process.argv[2];

if (!blockName || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(blockName)) {
  console.error("Usage: pnpm run create:block <block-name>");
  console.error("Example: pnpm run create:block block2");
  process.exit(1);
}

const root = process.cwd();
const srcDir = path.join(root, "src");
const blockDir = path.join(srcDir, "components", "blocks", blockName);
const blockFile = path.join(blockDir, `${blockName}.tsx`);
const cssFile = path.join(blockDir, `${blockName}.module.css`);
const entryFile = path.join(srcDir, "src.tsx");

if (fs.existsSync(blockDir)) {
  console.error(`Block already exists: src/components/blocks/${blockName}`);
  process.exit(1);
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  let replaceEntry = true;

  if (fs.existsSync(entryFile)) {
    const answer = await ask(
      "Replace and delete existing src/src.tsx? [Y/n] "
    );

    // Empty input defaults to YES.
    replaceEntry = answer === "" || /^(y|yes)$/i.test(answer);

    if (!replaceEntry && !/^(n|no)$/i.test(answer)) {
      console.error("Please answer yes/y or no/n.");
      process.exit(1);
    }
  }

  fs.mkdirSync(blockDir, { recursive: true });

  const componentName =
    blockName.charAt(0).toUpperCase() + blockName.slice(1);

  const component = `import styles from "./${blockName}.module.css";

const ${componentName} = () => {
  return (
    <section className={styles.root}>
      <h1 className={styles.heading}>${blockName}</h1>
    </section>
  );
};

export default ${componentName};
`;

  const css = `.root {
  animation: ${blockName}Fade 0.6s ease both;
}

.heading {
  font-size: 2rem;
  font-weight: 700;
}

@keyframes ${blockName}Fade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

  fs.writeFileSync(blockFile, component);
  fs.writeFileSync(cssFile, css);

  if (replaceEntry) {
    const entry = `import ${componentName} from "@/components/blocks/${blockName}/${blockName}";

export { ${componentName} };

export default ${componentName};
`;

    // "Replace and delete" is implemented as an atomic overwrite:
    // remove the old entry first, then create the new one.
    if (fs.existsSync(entryFile)) fs.rmSync(entryFile);
    fs.writeFileSync(entryFile, entry);

    console.log(`Replaced src/src.tsx with ${componentName}.`);
  } else {
    console.log("Kept existing src/src.tsx.");
  }

  console.log("");
  console.log(`Created block: src/components/blocks/${blockName}/`);
  console.log(`  ${blockName}.tsx`);
  console.log(`  ${blockName}.module.css`);
  console.log("");
  console.log(`Run: pnpm shortcode gallery --build`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
