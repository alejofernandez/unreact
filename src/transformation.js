/* eslint-disable no-underscore-dangle, no-param-reassign */
import babelTraverse from '@babel/traverse';
import * as t from '@babel/types';
import cleanJSXElementLiteralChild from '@babel/types/lib/utils/react/cleanJSXElementLiteralChild';
import {
  createAttribute,
  createCondition,
  createElement,
  createInterpolationEscaped,
  createIteration,
  createMixin,
  createRoot,
  createText
} from './ast';
import isFunctionalReactComponent from './utils/is-functional-react-component';
import getReactComponentName from './utils/get-react-component-name';
import addToContext from './utils/add-to-context';
import getReactComponentProps from './utils/get-react-component-props';
import inlineStyles from './utils/inline-styles';

function transformation(oldAst, inputFilePath) {
  const newAst = createRoot();
  const table = { components: {}, dependencies: {} };

  const reactComponentVisitor = {
    JSXElement(path) {
      const tagName = path.node.openingElement.name.name;
      const isFromDependency = table.dependencies[tagName];
      if (isFromDependency) {
        isFromDependency.isUsedAsRC = true;
      }
      const element = createElement(tagName);
      const context = getContext(path);
      addToContext(context, element);
      setContext(path, element);
    },
    JSXText(path) {
      const elems = [];
      cleanJSXElementLiteralChild(path.node, elems);
      const value = elems[0] ? elems[0].value : '';
      if (!value) {
        return;
      }
      const text = createText(value);
      const context = getContext(path);
      addToContext(context, text);
    },
    JSXExpressionContainer(path) {
      // Let JSXAttribute visitor handle JSXExpressionContainer of attributes.
      if (t.isJSXAttribute(path.parent)) {
        return;
      }

      const expressionPath = path.get('expression');
      const expressionNode = expressionPath.node;

      if (t.isLogicalExpression(expressionNode, { operator: '&&' })) {
        return;
      }
      if (t.isLogicalExpression(expressionNode, { operator: '||' })) {
        return;
      }
      if (t.isConditionalExpression(expressionNode)) {
        return;
      }
      if (isMapIterator(expressionNode)) {
        return;
      }

      const context = getContext(path);
      const interpolationEscaped = createInterpolationEscaped(expressionPath);
      addToContext(context, interpolationEscaped);
    },
    JSXAttribute(path) {
      const context = getContext(path);
      const name = path.node.name.name;
      const valueNode = path.node.value;
      if (shouldIgnoreAttr(name)) {
        return;
      }
      if (!valueNode) {
        const attribute = createAttribute({ name, value: true, isBoolean: true });
        addToContext(context, attribute, 'attributes');
        return;
      }
      if (t.isStringLiteral(valueNode)) {
        const attribute = createAttribute({ name, value: valueNode.value, isString: true });
        addToContext(context, attribute, 'attributes');
        return;
      }
      const expression = path.get('value.expression');
      if (name === 'style') {
        const styles = {};
        expression.node.properties.forEach(prop => {
          styles[prop.key.name] = prop.value.value;
        });
        const stringInlineStyles = inlineStyles(styles);
        if (stringInlineStyles) {
          const attribute = createAttribute({ name, value: stringInlineStyles, isString: true });
          addToContext(context, attribute, 'attributes');
        }
        return;
      }
      const attribute = createAttribute({ name, valuePath: expression });
      addToContext(context, attribute, 'attributes');
    },
    CallExpression(path) {
      const isIterator = isMapIterator(path.node);
      if (isIterator) {
        const iterablePath = path.get('callee.object');
        const currentValuePath = path.get('arguments.0.params.0');
        const indexPath = path.get('arguments.0.params.1');
        const arrayPath = path.get('arguments.0.params.2');
        const iteration = createIteration({ iterablePath, currentValuePath, indexPath, arrayPath });
        const context = getContext(path);
        addToContext(context, iteration);
        setContext(path, iteration);
      }
    },
    LogicalExpression(path) {
      if (t.isConditionalExpression(path.parent) && path.parent.test === path.node) {
        return;
      }
      if (path.findParent(node => t.isJSXAttribute(node)) || t.isLogicalExpression(path.parent)) {
        return;
      }
      const left = path.get('left');
      const context = getContext(path);
      if (path.node.operator === '&&') {
        const condition = createCondition({ testPath: left });
        addToContext(context, condition);
        setContext(path, condition);
        return;
      }
      const interpolationEscaped = createInterpolationEscaped(left);
      const condition = createCondition({ testPath: left, consequent: interpolationEscaped });
      addToContext(context, condition);
      setContext(path, condition);
    },
    ConditionalExpression(path) {
      if (path.findParent(node => t.isJSXAttribute(node))) {
        return;
      }
      const testPath = path.get('test');
      const context = getContext(path);
      const ignoreConsequent = t.isNullLiteral(path.node.consequent);
      if (ignoreConsequent) {
        testPath.replaceWith(t.UnaryExpression('!', testPath.node));
      }
      const condition = createCondition({ testPath });
      addToContext(context, condition);
      setContext(path, condition);
    },
    StringLiteral(path) {
      if (path.findParent(node => t.isJSXAttribute(node))) {
        return;
      }
      if (t.isConditionalExpression(path.parent)) {
        const context = getContext(path);
        const text = createText(path.node.value);
        addToContext(context, text);
      }
    }
  };

  const generalVisitor = {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      const specifier = path.node.specifiers.find(node => t.isImportDefaultSpecifier(node)).local
        .name;
      table.dependencies[specifier] = { source, requiredFrom: inputFilePath };
    },
    VariableDeclaration(path) {
      checkForReactComponent(path);
    },
    FunctionDeclaration(path) {
      checkForReactComponent(path);
    },
    ExportDefaultDeclaration(path) {
      const exportedComponent = path.node.declaration.name;
      const component = table.components[exportedComponent];
      if (component) {
        component.defaultExport = true;
      }
    }
  };

  babelTraverse(oldAst, generalVisitor, null);

  const mainComponent = Object.values(table.components).find(component => component.defaultExport);
  addToContext(newAst, mainComponent.node);

  return { ast: newAst, table };

  function checkForReactComponent(path) {
    const is = isFunctionalReactComponent(path);
    const name = getReactComponentName(path.node);
    const defaultExport = t.isFunctionDeclaration(path.node)
      ? t.isExportDefaultDeclaration(path.parent)
      : false;
    const props = getReactComponentProps(path.node);
    if (is) {
      const mixin = createMixin(name, props);
      setContext(path, mixin);
      table.components[name] = {
        node: mixin,
        defaultExport,
        createdFrom: inputFilePath
      };
      path.traverse(reactComponentVisitor);
    }
  }
}

export default transformation;

function setContext(path, context) {
  path.node._context = context;
}

function getContext(path) {
  const context = path.findParent(pathItem => !!pathItem.node._context).node._context;
  return context;
}

function isMapIterator(node) {
  const callee = node.callee;
  if (!callee || !callee.property) {
    return false;
  }
  const is = callee.property.name === 'map';
  return is;
}

function shouldIgnoreAttr(name) {
  if (['key', 'onClick', 'ref'].includes(name)) {
    return true;
  }
  return false;
}
