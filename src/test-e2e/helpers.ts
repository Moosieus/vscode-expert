import * as path from "path";
import * as vscode from "vscode";
import { type LanguageClient, State } from "vscode-languageclient/node";

export enum Fixture {
	Diagnostics = "diagnostics",
}

/**
 * Waits for the language client to reach the Running state.
 */
function waitForClientReady(client: LanguageClient, timeoutMs = 30000): Promise<void> {
	if (client.state === State.Running) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			disposable.dispose();
			reject(new Error(`Server init timeout. State: ${State[client.state]}`));
		}, timeoutMs);

		const disposable = client.onDidChangeState((e) => {
			if (e.newState === State.Running) {
				clearTimeout(timeout);
				disposable.dispose();
				resolve();
			}
		});
	});
}

/**
 * Waits for diagnostics to appear for a given URI.
 * @param uri The document URI to wait for diagnostics on
 * @param timeoutMs Maximum time to wait (default 30 seconds)
 * @returns Promise that resolves when diagnostics are available
 */
function waitForDiagnostics(uri: vscode.Uri, timeoutMs = 15000): Promise<vscode.Diagnostic[]> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			disposable.dispose();
			reject(new Error(`Timeout waiting for diagnostics on ${uri.fsPath}`));
		}, timeoutMs);

		// Check if diagnostics already exist
		const existing = vscode.languages.getDiagnostics(uri);
		if (existing.length > 0) {
			clearTimeout(timeout);
			resolve(existing);
			return;
		}

		// Listen for diagnostic changes
		const disposable = vscode.languages.onDidChangeDiagnostics((event) => {
			const hasOurUri = event.uris.some((u) => u.toString() === uri.toString());
			if (hasOurUri) {
				const diagnostics = vscode.languages.getDiagnostics(uri);
				if (diagnostics.length > 0) {
					clearTimeout(timeout);
					disposable.dispose();
					resolve(diagnostics);
				}
			}
		});
	});
}

/**
 * Activates the Expert extension and waits for the language server to initialize.
 */
export async function activate(
	fixture: Fixture,
): Promise<[vscode.TextDocument, vscode.TextEditor]> {
	const fixturesProjectPath = path.resolve(__dirname, "./fixtures");

	// The extensionId is `publisher.name` from package.json
	const ext = vscode.extensions.getExtension("expert-lsp.expert")!;
	const client = (await ext.activate()) as LanguageClient | undefined;

	// Wait for server to initialize
	if (client === undefined) {
		throw new Error("Language client not available - server may have failed to start");
	}
	await waitForClientReady(client);

	try {
		const fixtureFilePath = path.resolve(fixturesProjectPath, "./lib/", `${fixture}.ex`);

		const doc = await vscode.workspace.openTextDocument(fixtureFilePath);
		const editor = await vscode.window.showTextDocument(doc);
		await waitForDiagnostics(doc.uri);

		return [doc, editor];
	} catch (e) {
		console.error(e);
		throw e;
	}
}
