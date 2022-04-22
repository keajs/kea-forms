import { ParsedLogic, Plugin, VisitKeaPropertyArguments } from 'kea-typegen'
import * as ts from 'typescript'
import { capitalizeFirstLetter } from './utils'

const factory = ts.factory

const record = (key1: ts.TypeNode, key2: ts.TypeNode) =>
  factory.createTypeReferenceNode(factory.createIdentifier('Record'), [key1, key2])
const bool = () => factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
const string = () => factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
const any = () => factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
const partial = (node: ts.TypeNode) => factory.createTypeReferenceNode(factory.createIdentifier('Partial'), [node])
const fieldName = () => factory.createTypeReferenceNode(factory.createIdentifier('FieldName'), undefined)
const deepPartial = (node: ts.TypeNode) =>
  factory.createTypeReferenceNode(factory.createIdentifier('DeepPartial'), [node])
const deepPartialMap = (node: ts.TypeNode, mapTo: ts.TypeNode) =>
  factory.createTypeReferenceNode(factory.createIdentifier('DeepPartialMap'), [node, mapTo])
const recordStringAny = () => record(string(), any())
const validationErrorType = () =>
  factory.createTypeReferenceNode(factory.createIdentifier('ValidationErrorType'), undefined)

/** Kea v2 TypeGen support */
export default {
  visitKeaProperty(args) {
    if (args.name === 'forms') {
      forms(args)
    }
  },
} as Plugin

export function forms({ parsedLogic, node, getTypeNodeForNode, prepareForPrint }: VisitKeaPropertyArguments) {
  // extract `() => ({})` to just `{}`
  if (
    ts.isArrowFunction(node) &&
    ts.isParenthesizedExpression(node.body) &&
    ts.isObjectLiteralExpression(node.body.expression)
  ) {
    node = node.body.expression
  }

  // make sure we have a {}
  if (!ts.isObjectLiteralExpression(node)) {
    return
  }

  // go through each property
  for (const property of node.properties) {
    const formKey = property.name?.getText()

    // it must also be an object
    if (!formKey || !ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) {
      continue
    }

    // default the type to Record<string, any>
    let typeNode: ts.TypeNode = recordStringAny()

    // try to get the type of the defaults
    const defaultsProp = property.initializer.properties.find((prop) => prop.name?.getText() === 'defaults')
    if (defaultsProp) {
      const defaultsTypeNode = getTypeNodeForNode(defaultsProp)
      typeNode = prepareForPrint(defaultsTypeNode)
    }

    // add deps
    if (!parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms']) {
      parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'] = new Set()
    }
    parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'].add('DeepPartial')
    parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'].add('DeepPartialMap')
    parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'].add('FieldName')
    parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'].add('ValidationErrorType')

    // add actions
    const capitalizedFormKey = capitalizeFirstLetter(formKey)

    createAction(
      parsedLogic,
      `set${capitalizedFormKey}Value`,
      [
        // (key: string, value: any)
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier('key'),
          undefined,
          fieldName(),
          undefined,
        ),
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier('value'),
          undefined,
          factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
          undefined,
        ),
      ],
      // { values: Partial<FormValueType> }
      factory.createTypeLiteralNode([
        factory.createPropertySignature(undefined, factory.createIdentifier('name'), undefined, fieldName()),
        factory.createPropertySignature(undefined, factory.createIdentifier('value'), undefined, any()),
      ]),
    )
    createAction(
      parsedLogic,
      `set${capitalizedFormKey}Values`,
      [
        // (values: Partial<FormValueType>)
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier('values'),
          undefined,
          deepPartial(typeNode),
          undefined,
        ),
      ],
      // { values: Partial<FormValueType> }
      factory.createTypeLiteralNode([
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier('values'),
          undefined,
          deepPartial(typeNode),
        ),
      ]),
    )
    createAction(
      parsedLogic,
      `touch${capitalizedFormKey}Field`,
      [
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier('key'),
          undefined,
          string(),
          undefined,
        ),
      ],
      factory.createTypeLiteralNode([
        factory.createPropertySignature(undefined, factory.createIdentifier('key'), undefined, string()),
      ]),
    )
    createAction(
      parsedLogic,
      `reset${capitalizedFormKey}`,
      [
        // (values: Partial<FormValueType>)
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier('values'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          typeNode,
          undefined,
        ),
      ],
      // { values: Partial<FormValueType> }
      factory.createTypeLiteralNode([
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier('values'),
          factory.createToken(ts.SyntaxKind.QuestionToken),
          typeNode,
        ),
      ]),
    )
    createAction(parsedLogic, `submit${capitalizedFormKey}`, [])
    createAction(
      parsedLogic,
      `submit${capitalizedFormKey}Request`,
      [
        // params = ([formKey]: Form) => void
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier(formKey),
          undefined,
          typeNode,
          undefined,
        ),
      ],
      // type payload = { [formKey]: Form }
      factory.createTypeLiteralNode([
        factory.createPropertySignature(undefined, factory.createIdentifier(formKey), undefined, typeNode),
      ]),
    )
    createAction(
      parsedLogic,
      `submit${capitalizedFormKey}Success`,
      [
        // params = ([formKey]: Form) => void
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier(formKey),
          undefined,
          typeNode,
          undefined,
        ),
      ],
      // type payload = { [formKey]: Form }
      factory.createTypeLiteralNode([
        factory.createPropertySignature(undefined, factory.createIdentifier(formKey), undefined, typeNode),
      ]),
    )
    createAction(
      parsedLogic,
      `submit${capitalizedFormKey}Failure`,
      [
        // params = (error: Error) => void
        factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          factory.createIdentifier('error'),
          undefined,
          factory.createTypeReferenceNode(factory.createIdentifier('Error'), undefined),
          undefined,
        ),
      ],
      // type payload = { error: Error }
      factory.createTypeLiteralNode([
        factory.createPropertySignature(
          undefined,
          factory.createIdentifier('error'),
          undefined,
          factory.createTypeReferenceNode(factory.createIdentifier('Error'), undefined),
        ),
      ]),
    )

    createReducer(parsedLogic, `${formKey}`, typeNode)
    createReducer(parsedLogic, `is${capitalizedFormKey}Submitting`, bool())
    createReducer(parsedLogic, `show${capitalizedFormKey}Errors`, bool())
    createReducer(parsedLogic, `${formKey}Changed`, bool())
    createReducer(parsedLogic, `${formKey}Touches`, record(string(), bool()))

    createSelector(parsedLogic, `${formKey}Touched`, bool())
    createSelector(parsedLogic, `${formKey}ValidationErrors`, deepPartialMap(typeNode, validationErrorType()))
    createSelector(parsedLogic, `${formKey}HasErrors`, bool())
    createSelector(parsedLogic, `${formKey}Errors`, deepPartialMap(typeNode, validationErrorType()))
    createSelector(parsedLogic, `is${capitalizedFormKey}Valid`, bool())
  }
}

function createAction(
  parsedLogic: ParsedLogic,
  name: string,
  parameters: ts.ParameterDeclaration[] = [],
  returnTypeNode: ts.TypeNode | null = null,
) {
  // add action "submitForm" to parsedLogic
  parsedLogic.actions.push({
    name,
    parameters,
    returnTypeNode:
      returnTypeNode ||
      factory.createTypeLiteralNode([
        factory.createPropertySignature(undefined, factory.createIdentifier('value'), undefined, bool()),
      ]),
  })
}

// add reducer with this default type
function createReducer(parsedLogic: ParsedLogic, name: string, typeNode: ts.TypeNode = recordStringAny()) {
  parsedLogic.reducers.push({
    name,
    typeNode,
  })
}

// add reducer with this default type
function createSelector(
  parsedLogic: ParsedLogic,
  name: string,
  typeNode: ts.TypeNode = factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
) {
  parsedLogic.selectors.push({
    name,
    typeNode,
    functionTypes: [],
  })
}
