/**
 * This file in its compiled form under lib/typegen.js is picked up by kea-typegen and used
̦ * as input in type generation..
 */

import { Plugin } from 'kea-typegen'
import * as ts from 'typescript'
import { capitalizeFirstLetter } from './utils'

const record = (key1: ts.TypeNode, key2: ts.TypeNode) => ts.createTypeReferenceNode(ts.createIdentifier('Record'), [key1, key2])
const bool = () => ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
const string = () => ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
const any = () => ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
const partial = (node: ts.TypeNode) => ts.createTypeReferenceNode(ts.createIdentifier('Partial'), [node])
const fieldName = () => ts.createTypeReferenceNode(ts.createIdentifier('FieldName'), undefined)
const deepPartial = (node: ts.TypeNode) => ts.createTypeReferenceNode(ts.createIdentifier('DeepPartial'), [node])
const deepPartialMap = (node: ts.TypeNode, mapTo: ts.TypeNode) =>
  ts.createTypeReferenceNode(ts.createIdentifier('DeepPartialMap'), [node, mapTo])
const recordStringAny = () => record(string(), any())
const validationErrorType = () => ts.createTypeReferenceNode(ts.createIdentifier('ValidationErrorType'), undefined)

export default {
  visitKeaProperty({ name, parsedLogic, node, getTypeNodeForNode, prepareForPrint }) {
    if (name === 'forms') {
      // extract `() => ({})` to just `{}`
      if (
        ts.isArrowFunction(node) &&
        ts.isParenthesizedExpression(node.body) &&
        ts.isObjectLiteralExpression(node.body.expression)
      ) {
        node = node.body.expression
      }

      if (ts.isAsExpression(node)) {
        node = node.expression
        if (ts.isParenthesizedTypeNode(node)) {
          node = node.type
        }
      }

      const forms: Record<
        string,
        {
          typeNode: ts.TypeNode
        }
      > = {}

      // get type of `default` and prepare it for printing
      if (ts.isObjectLiteralExpression(node)) {
        for (const property of node.properties) {
          const formKey = property.name?.getText()

          if (!formKey || !ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) {
            continue
          }

          /** Type of the form */
          let typeNode: ts.TypeNode | null = null
          const defaultsProp = property.initializer.properties.find((prop) => prop.name?.getText() === 'defaults')

          if (defaultsProp) {
            const defaultsTypeNode = getTypeNodeForNode(defaultsProp)
            typeNode = prepareForPrint(defaultsTypeNode)
          }

          if (!typeNode) {
            typeNode = recordStringAny()
          }

          const capitalizedFormKey = capitalizeFirstLetter(formKey)

          // add deps
          if (!parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms']) {
            parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'] = new Set()
          }
          parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'].add('DeepPartial')
          parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'].add('DeepPartialMap')
          parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'].add('FieldName')
          parsedLogic.typeReferencesToImportFromFiles['node_modules/kea-forms'].add('ValidationErrorType')

          // add actions

          const createAction = (
            name: string,
            parameters: ts.ParameterDeclaration[] = [],
            returnTypeNode: ts.TypeNode | null = null,
          ) => {
            // add action "submitForm" to parsedLogic
            parsedLogic.actions.push({
              name,
              parameters,
              returnTypeNode:
                returnTypeNode ||
                ts.createTypeLiteralNode([
                  ts.createPropertySignature(undefined, ts.createIdentifier('value'), undefined, bool(), undefined),
                ]),
            })
          }

          createAction(
            `set${capitalizedFormKey}Value`,
            [
              // (key: string, value: any)
              ts.createParameter(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier('key'),
                undefined,
                fieldName(),
                undefined,
              ),
              ts.createParameter(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier('value'),
                undefined,
                ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
                undefined,
              ),
            ],
            // { values: Partial<FormValueType> }
            ts.createTypeLiteralNode([
              ts.createPropertySignature(undefined, ts.createIdentifier('name'), undefined, fieldName()),
              ts.createPropertySignature(undefined, ts.createIdentifier('value'), undefined, any()),
            ]),
          )
          createAction(
            `set${capitalizedFormKey}Values`,
            [
              // (values: Partial<FormValueType>)
              ts.createParameter(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier('values'),
                undefined,
                deepPartial(typeNode),
                undefined,
              ),
            ],
            // { values: Partial<FormValueType> }
            ts.createTypeLiteralNode([
              ts.createPropertySignature(undefined, ts.createIdentifier('values'), undefined, deepPartial(typeNode)),
            ]),
          )
          createAction(
            `touch${capitalizedFormKey}Field`,
            [
              ts.createParameter(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier('key'),
                undefined,
                string(),
                undefined,
              ),
            ],
            ts.createTypeLiteralNode([
              ts.createPropertySignature(undefined, ts.createIdentifier('key'), undefined, string()),
            ]),
          )
          createAction(
            `reset${capitalizedFormKey}`,
            [
              // (values: Partial<FormValueType>)
              ts.createParameter(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier('values'),
                ts.createToken(ts.SyntaxKind.QuestionToken),
                typeNode,
                undefined,
              ),
            ],
            // { values: Partial<FormValueType> }
            ts.createTypeLiteralNode([
              ts.createPropertySignature(
                undefined,
                ts.createIdentifier('values'),
                ts.createToken(ts.SyntaxKind.QuestionToken),
                typeNode,
              ),
            ]),
          )
          createAction(`submit${capitalizedFormKey}`, [])
          createAction(
            `submit${capitalizedFormKey}Request`,
            [
              // params = ([formKey]: Form) => void
              ts.createParameter(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier(formKey),
                undefined,
                typeNode,
                undefined,
              ),
            ],
            // type payload = { [formKey]: Form }
            ts.createTypeLiteralNode([
              ts.createPropertySignature(undefined, ts.createIdentifier(formKey), undefined, typeNode),
            ]),
          )
          createAction(
            `submit${capitalizedFormKey}Success`,
            [
              // params = ([formKey]: Form) => void
              ts.createParameter(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier(formKey),
                undefined,
                typeNode,
                undefined,
              ),
            ],
            // type payload = { [formKey]: Form }
            ts.createTypeLiteralNode([
              ts.createPropertySignature(undefined, ts.createIdentifier(formKey), undefined, typeNode),
            ]),
          )
          createAction(
            `submit${capitalizedFormKey}Failure`,
            [
              // params = (error: Error) => void
              ts.createParameter(
                undefined,
                undefined,
                undefined,
                ts.createIdentifier('error'),
                undefined,
                ts.createTypeReferenceNode(ts.createIdentifier('Error'), undefined),
                undefined,
              ),
            ],
            // type payload = { error: Error }
            ts.createTypeLiteralNode([
              ts.createPropertySignature(
                undefined,
                ts.createIdentifier('error'),
                undefined,
                ts.createTypeReferenceNode(ts.createIdentifier('Error'), undefined),
              ),
            ]),
          )

          // add reducer with this default type
          const createReducer = (name: string, typeNode: ts.TypeNode = recordStringAny()) => {
            parsedLogic.reducers.push({
              name,
              typeNode,
            })
          }

          createReducer(`${formKey}`, typeNode)
          createReducer(`is${capitalizedFormKey}Submitting`, bool())
          createReducer(`show${capitalizedFormKey}Errors`, bool())
          createReducer(`${formKey}Changed`, bool())
          createReducer(`${formKey}Touches`, record(string(), bool()))

          // add reducer with this default type
          const createSelector = (
            name: string,
            typeNode: ts.TypeNode = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
          ) => {
            parsedLogic.selectors.push({
              name,
              typeNode,
              functionTypes: [],
            })
          }

          createSelector(`${formKey}Touched`, bool())
          createSelector(`${formKey}ValidationErrors`, deepPartialMap(typeNode, validationErrorType()))
          createSelector(`${formKey}HasErrors`, bool())
          createSelector(`${formKey}Errors`, deepPartialMap(typeNode, validationErrorType()))
          createSelector(`is${capitalizedFormKey}Valid`, bool())

          forms[formKey] = { typeNode: typeNode }
        }

        // add extra type for logic input
        parsedLogic.extraInput!['forms'] = {
          // adds support for both { inline: (logic) => ({}) } and { inline: {} }
          withLogicFunction: true,
          typeNode: ts.createTypeLiteralNode(
            Object.entries(forms).map(([name, { typeNode }]) =>
              // default?: Record<string, any>
              ts.createPropertySignature(
                undefined,
                ts.createIdentifier(name),
                ts.createToken(ts.SyntaxKind.QuestionToken),
                ts.createTypeLiteralNode([
                  // default?: Record<string, any>
                  ts.createPropertySignature(
                    undefined,
                    ts.createIdentifier('defaults'),
                    ts.createToken(ts.SyntaxKind.QuestionToken),
                    typeNode,
                  ),
                  // submit?: (form: $typeNode || Record<string, any>) => void
                  ts.createPropertySignature(
                    undefined,
                    ts.createIdentifier('submit'),
                    ts.createToken(ts.SyntaxKind.QuestionToken),
                    ts.createFunctionTypeNode(
                      undefined,
                      [
                        ts.createParameter(
                          undefined,
                          undefined,
                          undefined,
                          ts.createIdentifier('form'),
                          undefined,
                          typeNode,
                          undefined,
                        ),
                      ],
                      ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                    ),
                  ),
                  // validator?: (form: $typeNode || Record<string, any>) => Record<string, any>
                  ts.createPropertySignature(
                    undefined,
                    ts.createIdentifier('validator'),
                    ts.createToken(ts.SyntaxKind.QuestionToken),
                    ts.createFunctionTypeNode(
                      undefined,
                      [
                        ts.createParameter(
                          undefined,
                          undefined,
                          undefined,
                          ts.createIdentifier('form'),
                          undefined,
                          typeNode,
                          undefined,
                        ),
                      ],
                      deepPartialMap(typeNode, validationErrorType()),
                    ),
                  ),
                ]),
              ),
            ),
          ),
        }
      }
    }
  },
} as Plugin
