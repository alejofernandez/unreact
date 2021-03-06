/* eslint-disable no-param-reassign, no-underscore-dangle */
import * as t from '@babel/types';
import evaluate from './evaluate';
import isTruthy from './is-truthy';
import { conditionName, textName } from '../ast';

const deadCodeElimination = {
  Attribute: {
    exit(node, parent) {
      if (node.isBoolean || node.isString || node.isNode) {
        return;
      }
      if (t.isBooleanLiteral(node.valuePath.node, { value: true })) {
        node.isBoolean = true;
        return;
      }
      if (t.isIdentifier(node.valuePath.node) && node.valuePath.node.name === 'undefined') {
        parent.attributes = parent.attributes.filter(attr => attr !== node);
        return;
      }
      const result = evaluate(node.valuePath);
      if (result.confident && ['string', 'number'].includes(typeof result.value)) {
        node.value = result.value;
        node.isString = true;
        node.valuePath = undefined;
      } else if (result.confident && [null, false].includes(result.value)) {
        parent.attributes = parent.attributes.filter(attr => attr !== node);
      } else if (result.confident && typeof result.value === 'boolean') {
        node.value = result.value;
        node.isBoolean = true;
      } else if (t.isTemplateLiteral(node.valuePath.node)) {
        constantFoldingTemplateLiteral(node.valuePath);
      }
    }
  },
  InterpolationEscaped: {
    exit(node) {
      if (t.isIdentifier(node.valuePath.node, { name: 'undefined' })) {
        // HACK: to "remove" InterpolationEscaped.
        node.valuePath = null;
        node.type = textName;
        return;
      }

      if (t.isStringLiteral(node.valuePath.node)) {
        node.type = textName;
        node.value = node.valuePath.node.value;
        delete node.valuePath;
      }
    }
  },
  Condition: {
    enter(node, parent) {
      const pNode = node.testPath.node;
      if (t.isJSXElement(pNode)) {
        inlineTruthyCondition(parent, node);
        return;
      }
      const isLogicalExpressionAnd = t.isLogicalExpression(pNode, { operator: '&&' });
      const hasStringRight =
        isLogicalExpressionAnd && t.isIdentifier(pNode.left) && t.isStringLiteral(pNode.right);
      const hasStringLeft =
        isLogicalExpressionAnd && t.isStringLiteral(pNode.left) && t.isIdentifier(pNode.right);
      if (hasStringRight) {
        node.testPath.replaceWith(t.identifier(pNode.left.name));
      }
      if (hasStringLeft) {
        node.testPath.replaceWith(t.identifier(pNode.right.name));
      }
      const evaluates = isTruthy(node.testPath);
      if (evaluates === false) {
        if (parent.type === conditionName) {
          delete parent.type;
          delete parent.testPath;
          delete parent.alternate;
          delete parent.consequent;
          delete parent._parent;
          delete node._parent;
          Object.assign(parent, node.alternate);
          return;
        }
        parent.children = parent.children
          .map(child => {
            if (child === node) {
              return node.alternate;
            }
            return child;
          })
          .filter(Boolean);
        return;
      }
      if (evaluates === true) {
        inlineTruthyCondition(parent, node);
      }
    }
  }
};

export default deadCodeElimination;

function inlineTruthyCondition(parent, node) {
  if (parent.type === conditionName) {
    delete parent.type;
    delete parent.testPath;
    delete parent.alternate;
    delete parent.consequent;
    delete parent._parent;
    delete node._parent;
    Object.assign(parent, node.consequent);
    return;
  }
  parent.children = parent.children
    .map(child => {
      if (child === node) {
        return node.consequent;
      }
      return child;
    })
    .filter(Boolean);
}

function constantFoldingTemplateLiteral(path) {
  path.traverse({
    ConditionalExpression(nodePath) {
      const result = nodePath.evaluate();
      if (result.confident && typeof result.value === 'string') {
        const nodeStart = nodePath.node.start;
        const nodeIndex = nodePath.parent.expressions.findIndex(expr => expr === nodePath.node);
        nodePath.parent.quasis = nodePath.parent.quasis.map(q => {
          const placeholdersStart = 2; // placeholders start symbols length "${".
          if (q.end === nodeStart - placeholdersStart) {
            q.value.cooked += result.value;
            q.value.raw += result.value;
          }
          return q;
        });
        nodePath.remove();
        const quasiExtra = nodePath.parentPath.get(`quasis.${nodeIndex + 1}`);
        const quasiExtraValue = quasiExtra.node.value.cooked;
        quasiExtra.remove();
        const quasiBefore = nodePath.parentPath.get(`quasis.${nodeIndex}`);
        quasiBefore.node.value.cooked += quasiExtraValue;
        quasiBefore.node.value.raw += quasiExtraValue;
      }
    }
  });
}
