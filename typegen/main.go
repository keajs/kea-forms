package main

import (
	"strings"

	"github.com/keajs/kea-typegen/plugin"
)

func main() { plugin.Serve(forms) }

func forms(req plugin.Request) (plugin.Result, error) {
	var out plugin.Result
	for _, form := range req.Properties {
		if form.Kind != "PropertyAssignment" || form.ValueKind != "ObjectLiteralExpression" {
			continue
		}
		name := form.Name
		if form.NameKind != "Identifier" || name == "" || name[0] >= 128 || strings.Contains(name, `\`) {
			return plugin.Result{Delegate: true}, nil
		}
		typ := "Record<string, any>"
		for _, p := range form.Properties {
			if p.Name == "defaults" {
				typ = p.Type
				break
			}
		}
		formFields(&out, name, typ)
	}
	return out, nil
}

func formFields(l *plugin.Result, name, typ string) {
	for _, key := range []string{"DeepPartial", "DeepPartialMap", "FieldName", "ValidationErrorType"} {
		l.Imports = append(l.Imports, plugin.Import{File: "node_modules/kea-forms", Name: key})
	}
	title := strings.ToUpper(name[:1]) + name[1:]
	const record = "Record<string, any>"
	partial := "DeepPartial<" + typ + ">"
	errors := "DeepPartialMap<" + typ + ", ValidationErrorType>"
	addAction := func(key, payload string, params ...plugin.Parameter) {
		l.Actions = append(l.Actions, plugin.Action{Name: key, Type: payload, Params: params})
	}
	addAction("set"+title+"Value", "{ name: FieldName; value: any }", plugin.Parameter{Name: "key", Type: "FieldName"}, plugin.Parameter{Name: "value", Type: "any"})
	addAction("set"+title+"Values", "{ values: "+partial+" }", plugin.Parameter{Name: "values", Type: partial})
	addAction("set"+title+"ManualErrors", "{ errors: "+record+" }", plugin.Parameter{Name: "errors", Type: record})
	addAction("touch"+title+"Field", "{ key: string }", plugin.Parameter{Name: "key", Type: "string"})
	addAction("reset"+title, "{ values?: "+typ+" }", plugin.Parameter{Name: "values", Type: typ, Optional: true})
	addAction("submit"+title, "{ value: boolean }")
	addAction("submit"+title+"Request", "{ "+name+": "+typ+" }", plugin.Parameter{Name: name, Type: typ})
	addAction("submit"+title+"Success", "{ "+name+": "+typ+" }", plugin.Parameter{Name: name, Type: typ})
	addAction("submit"+title+"Failure", "{ error: Error; errors: "+record+" }", plugin.Parameter{Name: "error", Type: "Error"}, plugin.Parameter{Name: "errors", Type: record})
	l.Reducers = append(l.Reducers,
		plugin.Value{Name: name, Type: typ},
		plugin.Value{Name: "is" + title + "Submitting", Type: "boolean"},
		plugin.Value{Name: "show" + title + "Errors", Type: "boolean"},
		plugin.Value{Name: name + "Changed", Type: "boolean"},
		plugin.Value{Name: name + "Touches", Type: "Record<string, boolean>"},
		plugin.Value{Name: name + "ManualErrors", Type: record},
	)
	l.Selectors = append(l.Selectors,
		plugin.Value{Name: name + "Touched", Type: "boolean"},
		plugin.Value{Name: name + "ValidationErrors", Type: errors},
		plugin.Value{Name: name + "AllErrors", Type: record},
		plugin.Value{Name: name + "HasErrors", Type: "boolean"},
		plugin.Value{Name: name + "Errors", Type: errors},
		plugin.Value{Name: "is" + title + "Valid", Type: "boolean"},
	)
}
