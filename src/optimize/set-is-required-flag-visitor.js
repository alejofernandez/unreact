/* eslint-disable no-param-reassign */
import * as t from '@babel/types';
import getFirstMemberExpression from '../utils/get-first-member-expression';

export default function setRequiredFlagVisitor(definitions) {
  if (!definitions) {
    return {};
  }
  return {
    Attribute: {
      exit(node) {
        const path = node.valuePath;
        if (!path) {
          return;
        }
        flagNode(definitions, path.node, node);
        if (t.isMemberExpression(path.node) || t.isCallExpression(path.node)) {
          const firstMemberExpressionPath = getFirstMemberExpression(path);
          flagNode(definitions, firstMemberExpressionPath.node, node);
        }
      }
    }
  };
}
function flagNode(definitions, nodeBabel, nodeUnreact) {
  if (!t.isIdentifier(nodeBabel)) {
    return;
  }
  const defFound = definitions.find(def => def.name === nodeBabel.name);
  if (defFound && defFound.isRequired) {
    nodeUnreact.isRequired = true;
  }
}
