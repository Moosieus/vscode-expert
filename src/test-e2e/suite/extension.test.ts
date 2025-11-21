import { expect, test } from "@jest/globals";
import * as vscode from "vscode";
import { Fixture, activate } from "../helpers";

test("Should get diagnostics", async () => {
	await testDiagnostics(Fixture.Diagnostics, [
		{
			message: "undefined function foo/0",
			range: toRange(2, 4, 3, 0),
			severity: vscode.DiagnosticSeverity.Error,
			source: "Elixir",
		},
	]);
});

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
	const start = new vscode.Position(sLine, sChar);
	const end = new vscode.Position(eLine, eChar);
	return new vscode.Range(start, end);
}

async function testDiagnostics(fixture: Fixture, expectedDiagnostics: vscode.Diagnostic[]) {
	const [doc] = await activate(fixture);

	const actualDiagnostics = vscode.languages.getDiagnostics(doc.uri);

	expect(actualDiagnostics.length).toEqual(expectedDiagnostics.length);

	expectedDiagnostics.forEach((expectedDiagnostic, i) => {
		const actualDiagnostic = actualDiagnostics[i];
		expect(actualDiagnostic.message).toEqual(expectedDiagnostic.message);
		expect(actualDiagnostic.range).toEqual(expectedDiagnostic.range);
		expect(actualDiagnostic.severity).toEqual(expectedDiagnostic.severity);
	});
}
