/**
 * This file in its compiled form under lib/typegen.js is picked up by kea-typegen and used
̦ * as input in type generation..
 */

import { Plugin } from 'kea-typegen'
import * as ts from 'typescript'
import { capitalizeFirstLetter } from './utils'

const recordStringAny = () =>
  ts.createTypeReferenceNode(ts.createIdentifier('Record'), [
    ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
  ])

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
          const name = property.name?.getText()

          if (!name || !ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) {
            continue
          }

          // get type of `defaults`

          let typeNode: ts.TypeNode | null = null
          const defaultsProp = property.initializer.properties.find((prop) => prop.name?.getText() === 'defaults')

          if (defaultsProp) {
            const defaultsTypeNode = getTypeNodeForNode(defaultsProp)
            typeNode = prepareForPrint(defaultsTypeNode)
          }

          if (!typeNode) {
            typeNode = recordStringAny()
          }

          const capitalizedName = capitalizeFirstLetter(name)

          // add actions

          const createAction = (name: string) => {
            // add action "submitForm" to parsedLogic
            parsedLogic.actions.push({
              name,
              parameters: [],
              returnTypeNode: ts.createTypeLiteralNode([
                ts.createPropertySignature(
                  undefined,
                  ts.createIdentifier('value'),
                  undefined,
                  ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                  undefined,
                ),
              ]),
            })
          }

          createAction(`set${capitalizedName}Value`)
          createAction(`set${capitalizedName}Values`)
          createAction(`touch${capitalizedName}Field`)
          createAction(`reset${capitalizedName}`)
          createAction(`submit${capitalizedName}`)
          createAction(`submit${capitalizedName}Request`)
          createAction(`submit${capitalizedName}Success`)
          createAction(`submit${capitalizedName}Failure`)

          // add reducer with this default type
          const createReducer = (name: string, typeNode: ts.TypeNode = recordStringAny()) => {
            parsedLogic.reducers.push({
              name,
              typeNode,
            })
          }

          createReducer(`${name}`, typeNode || recordStringAny())
          createReducer(`is${capitalizedName}Submitting`, ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword))
          createReducer(`show${capitalizedName}Errors`)
          createReducer(`${name}Touches`)

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

          createSelector(`${name}Changes`, recordStringAny())
          createSelector(`${name}Changed`, ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword))
          createSelector(`${name}Touched`, ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword))
          createSelector(`${name}ValidationErrors`, recordStringAny())
          createSelector(`${name}HasErrors`, ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword))
          createSelector(`${name}Errors`, recordStringAny())
          createSelector(`is${capitalizedName}Valid`, ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword))

          forms[name] = { typeNode: typeNode }
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
                    typeNode || recordStringAny(),
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
                          typeNode || recordStringAny(),
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
                          typeNode || recordStringAny(),
                          undefined,
                        ),
                      ],
                      recordStringAny(),
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
