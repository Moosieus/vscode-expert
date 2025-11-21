import * as path from "path";
import * as vscode from "vscode";

export enum Fixture {
	Diagnostics = "diagnostics",
}

/**
 * Activates the vscode.lsp-sample extension
 */
export async function activate(
	fixture: Fixture,
): Promise<[vscode.TextDocument, vscode.TextEditor]> {
	const fixturesProjectPath = path.resolve(__dirname, "./fixtures");

	// The extensionId is `publisher.name` from package.json
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const ext = vscode.extensions.getExtension("expert-lsp.expert")!;
	await ext.activate();
	try {
		const fixtureFilePath = path.resolve(fixturesProjectPath, "./lib/", `${fixture}.ex`);

		const doc = await vscode.workspace.openTextDocument(fixtureFilePath);
		const editor = await vscode.window.showTextDocument(doc);
		await sleep(1000); // Wait for server activation

		return [doc, editor];
	} catch (e) {
		console.error(e);
		throw e;
	}
}

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
