import fs from 'fs';
import path from 'path';
import util from 'util';
import resolveFrom from 'resolve-from';
import makeDir from 'make-dir';
import globby from 'globby';
import parser from './parser';
import transformation from './transformation';
import DependencyGraph from './deps-graph';

import codeGeneratorEjs from './code-generator-ejs';
import codeGeneratorLiquid from './code-generator-liquid';
import codeGeneratorPug from './code-generator-pug';

import optimize from './optimize';

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const generators = {
  ejs: codeGeneratorEjs,
  liquid: codeGeneratorLiquid,
  pug: codeGeneratorPug
};

export async function compile(
  inputCode,
  { inputFile, templateEngine = 'pug', beginning = '', ending = '', initialIndentLevel = 0 } = {}
) {
  const { ast, table } = parseTransformOptimize(inputCode, inputFile, { templateEngine });
  const codeGenerator = generators[templateEngine];
  if (!codeGenerator) {
    throw new Error(`unknown code generator for ${templateEngine}`);
  }
  if (inputFile) {
    const { bundleAST, bundleTable } = await resolveDependencies(inputFile, ast, table);
    const optimizedAST = optimize(bundleAST, bundleTable);
    const code = generateOutputCode(
      codeGenerator(optimizedAST, { initialIndentLevel }),
      beginning,
      ending
    );
    return code;
  }
  const code = generateOutputCode(codeGenerator(ast, { initialIndentLevel }), beginning, ending);
  return code;
}

function parseTransformOptimize(inputCode, inputFile) {
  const oldAst = parser(inputCode);
  const { ast, table } = transformation(oldAst, inputFile);
  const optimizedAST = optimize(ast, table);
  return { ast: optimizedAST, table };
}

async function resolveDependencies(moduleFile, moduleAST, moduleTable) {
  const depGraph = new DependencyGraph();
  depGraph.addModule(moduleFile, moduleAST, moduleTable);
  await parseModule(moduleFile, moduleTable, depGraph);
  const preBundleTable = depGraph.modules.map(dep => dep.table);
  const bundleTable = preBundleTable.reduce(
    (acc, item) => ({
      components: Object.assign({}, acc.components, item.components),
      dependencies: Object.assign({}, acc.dependencies, item.dependencies)
    }),
    {}
  );
  return { bundleAST: moduleAST, bundleTable };
}

async function parseModule(moduleFile, moduleTable, depGraph) {
  await Promise.all(
    Object.values(moduleTable.dependencies).map(async dep => {
      if (dep.isUsedAsRC) {
        const depFilePath = await resolveFromFile(moduleFile, dep.source);
        dep.path = depFilePath; // eslint-disable-line no-param-reassign
        const depCode = await readFileAsync(depFilePath, { encoding: 'utf8' });
        const { ast: depAST, table: depTable } = parseTransformOptimize(depCode, depFilePath);
        depGraph.addModule(depFilePath, depAST, depTable);
        depGraph.addDependency(moduleFile, depFilePath);
        await parseModule(depFilePath, depTable, depGraph);
      }
    })
  );
}

async function resolveFromFile(filePath, moduleId) {
  const depDirPath = path.dirname(filePath);
  const depFilePath = await resolveFrom(depDirPath, moduleId);
  return depFilePath;
}

function generateOutputCode(code, beginning, ending) {
  const outputCode = `${beginning}${beginning ? '\n' : ''}${code}${ending}${ending ? '\n' : ''}`;
  return outputCode;
}

export async function compileFile(
  inputFile,
  outputFile,
  {
    templateEngine = 'pug',
    beginning = '',
    ending = '',
    initialIndentLevel,
    progress = () => {}
  } = {}
) {
  const inputFilePath = path.resolve(process.cwd(), inputFile);
  const outputFilePath = path.resolve(process.cwd(), outputFile);
  const inputCode = await readFileAsync(inputFilePath, { encoding: 'utf8' });
  const code = await compile(inputCode, {
    inputFile: inputFilePath,
    templateEngine,
    beginning,
    ending,
    initialIndentLevel
  });
  const outputFilePathDir = path.dirname(outputFilePath);
  await makeDir(outputFilePathDir);
  await writeFileAsync(outputFilePath, code);
  const relativePath = path.join(process.cwd(), '/');
  progress(`${inputFile.replace(relativePath, '')} -> ${outputFile.replace(relativePath, '')}`);
}

export async function compileDir(
  inputDir,
  outputDir,
  {
    templateEngine = 'pug',
    beginning = '',
    ending = '',
    initialIndentLevel,
    progress = () => {}
  } = {}
) {
  const inputDirPath = path.resolve(process.cwd(), inputDir);
  const outputDirPath = path.resolve(process.cwd(), outputDir);
  const globInputDirPath = path.join(inputDirPath, '/**/*.{js,jsx,mjs}');
  const filePaths = await globby(globInputDirPath);
  const extension = templateEngine === 'ejs' ? '.ejs' : '.pug';
  await Promise.all(
    filePaths.map(filePath => {
      const oldExtension = path.extname(filePath);
      const outputFile = filePath
        .replace(inputDirPath, outputDirPath)
        .replace(oldExtension, extension);
      return compileFile(filePath, outputFile, {
        templateEngine,
        beginning,
        ending,
        initialIndentLevel,
        progress
      });
    })
  );
}
