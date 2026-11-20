package main

import (
	"testing"

	"github.com/keajs/kea-typegen/plugin"
)

func TestForms(t *testing.T) {
	form := plugin.Property{Name: "profile", Kind: "PropertyAssignment", NameKind: "Identifier", ValueKind: "ObjectLiteralExpression", Properties: []plugin.Property{{Name: "defaults", Type: "Profile"}}}
	out, err := forms(plugin.Request{Properties: []plugin.Property{form}})
	if err != nil || len(out.Actions) != 9 || len(out.Reducers) != 6 || len(out.Selectors) != 6 || len(out.Imports) != 4 {
		t.Fatalf("incomplete form: %+v, %v", out, err)
	}
	if out.Actions[4].Name != "resetProfile" || !out.Actions[4].Params[0].Optional || out.Reducers[0].Type != "Profile" {
		t.Fatal("form lost defaults or reset signature")
	}
	form.Name = "'profile-name'"
	form.NameKind = "StringLiteral"
	out, _ = forms(plugin.Request{Properties: []plugin.Property{form}})
	if !out.Delegate {
		t.Fatal("expected JS visitor for quoted form key")
	}
}
