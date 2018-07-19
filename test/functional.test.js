import { compile, compileDir, compileFile } from '../src/index';
import { getFixture, getFixturePath, getTestCase } from './utils';

describe('while using unreact.compile()', () => {
  it('should convert react components of one tag to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('one-tag');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components of multipnle nested tags to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('nested-tags');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components of one tag with text to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('with-text');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components of one tag with var expression to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('with-var-expression');
    const resultPug = await compile(input, { templateEngine: 'pug' });
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components of one tag with complex expression to ejs and pug', async () => {
    expect.assertions(3);
    const { input, outputEJS, outputPug } = await getTestCase('with-complex-expression');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    try {
      await compile(input, { templateEngine: 'liquid' });
    } catch (e) {
      expect(e.message).toEqual('Unsupported CallExpression "getSomehing"');
    }
  });
  it('should convert react components of a self closing tag to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('self-closing-tag');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components with attributes to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('attrs');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components with boolean attributes to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('attrs-boolean');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components with var expression attributes to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('attrs-var-expression');
    const resultPug = await compile(input, { templateEngine: 'pug' });
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components with complex expression attributes to ejs and pug', async () => {
    expect.assertions(3);
    const { input, outputEJS, outputPug } = await getTestCase('attrs-complex-expression');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    try {
      await compile(input, { templateEngine: 'liquid' });
    } catch (err) {
      expect(err.message).toBe('Unsupported CallExpression "getId"');
    }
  });
  it('should convert react components with logical expression to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('logical-expression');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components with conditional expression to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase(
      'conditional-expression'
    );
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components with map iterator to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('iterator');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to ejs and ignore unnecessary attributes', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase(
      'ignore-unnecessary-attrs'
    );
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components with logical expression inside conditional expression to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase(
      'logical-expr-inside-conditional-expr'
    );
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert all the supported react components to ejs and pug', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase(
      'react-component-detection'
    );
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to ejs and pug with siblings of text elements and expressions', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase(
      'siblings-text-elements'
    );
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to ejs and pug and handle children', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('children');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to ejs and pug and handle fragment', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('fragment');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to ejs and pug and support inline styles', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('inline-styles');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to templaste handle attributes with conditions', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('attrs-conditional');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to ejs and pug and inline others components', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('inlining');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to ejs and pug and inline others components in external files', async () => {
    const inputFile = getFixturePath('inlining-files/input.js');
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('inlining-files');
    const resultEJS = await compile(input, { inputFile, templateEngine: 'ejs' });
    const resultPug = await compile(input, { inputFile, templateEngine: 'pug' });
    const resultLiquid = await compile(input, { inputFile, templateEngine: 'liquid' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should convert react components to ejs and pug and inline others components and theirs props', async () => {
    const { input, outputEJS, outputPug, outputLiquid } = await getTestCase('inlining-props');
    const resultEJS = await compile(input, { templateEngine: 'ejs' });
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    const resultPug = await compile(input, { templateEngine: 'pug' });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
    expect(resultLiquid).toBe(outputLiquid);
  });
  it('should properly handle string methods', async () => {
    // .replace(/^\s+$/g, '')
    const removeEmptyLines = v =>
      `${v
        .split('\n')
        .filter(l => l.trim() !== '')
        .join('\n')}\n`;
    const { input, outputLiquid } = await getTestCase('with-string-methods');
    const resultLiquid = await compile(input, { templateEngine: 'liquid' });
    expect(removeEmptyLines(resultLiquid)).toBe(outputLiquid);
  });
});

describe('while using unreact.compileFile()', () => {
  it('should convert react components of one tag to ejs', async () => {
    const fixture = 'compile-file';
    const inputPath = getFixturePath(`${fixture}/input.js`);
    const outputPathEJS = getFixturePath(`${fixture}/output.ejs`);
    await compileFile(inputPath, outputPathEJS, { templateEngine: 'ejs' });
    const outputEJS = await getFixture(`${fixture}/output.ejs`);
    expect(outputEJS).toMatchSnapshot();
  });
  it('should convert react components of one tag to pug', async () => {
    const fixture = 'compile-file';
    const inputPath = getFixturePath(`${fixture}/input.js`);
    const outputPathPug = getFixturePath(`${fixture}/output.pug`);
    await compileFile(inputPath, outputPathPug, { templateEngine: 'pug' });
    const outputPug = await getFixture(`${fixture}/output.pug`);
    expect(outputPug).toMatchSnapshot();
  });
});

describe('while using unreact.compileDir()', () => {
  it('should convert react components of one tag to ejs', async () => {
    const fixture = 'compile-dir';
    const inputOutputPath = getFixturePath(fixture);
    await compileDir(inputOutputPath, inputOutputPath, { templateEngine: 'ejs' });
    const Nested = await getFixture(`${fixture}/Nested.ejs`);
    const Simple = await getFixture(`${fixture}/Simple.ejs`);
    expect(`${Nested}\n${Simple}`).toMatchSnapshot();
  });
  it('should convert react components of one tag to pug', async () => {
    const fixture = 'compile-dir';
    const inputOutputPath = getFixturePath(fixture);
    await compileDir(inputOutputPath, inputOutputPath, { templateEngine: 'pug' });
    const Nested = await getFixture(`${fixture}/Nested.pug`);
    const Simple = await getFixture(`${fixture}/Simple.pug`);
    expect(`${Nested}\n${Simple}`).toMatchSnapshot();
  });
});

describe('while adding string to the beginning and ending', () => {
  it('should add string to the beginning', async () => {
    const { input, outputEJS, outputPug } = await getTestCase('add-beginning');
    const resultEJS = await compile(input, {
      templateEngine: 'ejs',
      beginning: "<%- include('header') %>"
    });
    const resultPug = await compile(input, {
      templateEngine: 'pug',
      beginning: "include 'header'"
    });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
  });
  it('should add string to the ending', async () => {
    const { input, outputEJS, outputPug } = await getTestCase('add-ending');
    const resultEJS = await compile(input, {
      templateEngine: 'ejs',
      ending: "<%- include('footer') %>"
    });
    const resultPug = await compile(input, {
      templateEngine: 'pug',
      ending: "include 'footer'"
    });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
  });
  it('should add string to the beginning and ending', async () => {
    const { input, outputEJS, outputPug } = await getTestCase('add-beginning-ending');
    const resultEJS = await compile(input, {
      templateEngine: 'ejs',
      beginning: "<%- include('header') %>",
      ending: "<%- include('footer') %>"
    });
    const resultPug = await compile(input, {
      templateEngine: 'pug',
      beginning: "include 'header'",
      ending: "include 'footer'"
    });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
  });
});

describe('while changing the indent level', () => {
  it('should start indent at level 1', async () => {
    const { input, outputEJS, outputPug } = await getTestCase('change-indent-level');
    const resultEJS = await compile(input, {
      templateEngine: 'ejs',
      initialIndentLevel: 1
    });
    const resultPug = await compile(input, {
      templateEngine: 'pug',
      initialIndentLevel: 1
    });
    expect(resultEJS).toBe(outputEJS);
    expect(resultPug).toBe(outputPug);
  });
});
