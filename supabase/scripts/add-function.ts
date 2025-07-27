import { Project, SyntaxKind } from "https://deno.land/x/ts_morph/mod.ts";
import * as Handlebars from "https://cdn.skypack.dev/handlebars";

const convertToCamelCase = (str: string): string => {
  const words = str.split(/[-_]/g); // Split on hyphens or underscores
  return words
    .map((word, index) =>
      index === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("");
};

const findSwitchStatement = (sourceFile: any) => {
  return sourceFile.getFirstDescendantByKind(SyntaxKind.SwitchStatement);
};

const addFunctionToPathSelector = async (functionName: string) => {
  const camelCaseFunctionName = convertToCamelCase(functionName);

  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(
    "./functions/big-function/pathSelector.ts",
  );

  const switchStatement = findSwitchStatement(sourceFile);

  // Create import statement
  sourceFile.addImportDeclaration({
    moduleSpecifier: `./${camelCaseFunctionName}/index.ts`,
    namedImports: [camelCaseFunctionName],
  });

  // Add case to switch statement
  if (switchStatement) {
    const caseBlock = switchStatement.getFirstChildByKind(SyntaxKind.CaseBlock);
    const caseClauses = caseBlock.getChildrenOfKind(SyntaxKind.CaseClause);
    const newCaseClauseText = `
            case "${camelCaseFunctionName}":
                return ${camelCaseFunctionName};
        `.trim();
    const existingCaseClausesText = caseClauses
      .map((cc: any) => cc.getText())
      .join("\n");
    const newSwitchStatementText = `
             {
                ${existingCaseClausesText}
                ${newCaseClauseText}
            }
        `.trim();
    caseBlock.replaceWithText(newSwitchStatementText);
  } else {
    console.error("Switch statement not found or malformed.");
    return;
  }

  // Save the modified source file
  await sourceFile.save();
  console.log("File updated successfully.");
};

const addFunctionFile = async (functionName: string) => {
  // Resolve the path relative to the script file
  const scriptDir = new URL(import.meta.url).pathname;
  const templatePath = `${scriptDir.substring(
    0,
    scriptDir.lastIndexOf("/"),
  )}/functionTemplate.hbs`;

  try {
    // Load the Handlebars template
    const templateFile = await Deno.readTextFile(templatePath);
    const template = Handlebars.compile(templateFile);

    // Compile the template with the provided data
    const fileContent = template({ functionName });

    // Create the project and source file
    const project = new Project();
    const sourceFilePath = `./functions/big-function/${functionName}/index.ts`;
    const sourceFile = project.createSourceFile(sourceFilePath, fileContent);

    // Save the source file
    await sourceFile.save();
    console.log(`Function file ${functionName} created successfully.`);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

if (Deno.args.length !== 1) {
  console.error(
    "Usage: deno run --allow-read --allow-write scripts/add-function.ts <functionName>",
  );
  Deno.exit(1);
}

const functionName = Deno.args[0];
await addFunctionToPathSelector(functionName);
await addFunctionFile(functionName);
