import { ExecuteCommandRequest, LanguageClient } from "vscode-languageclient/node";

const REINDEX_COMMAND_NAME = "Reindex";

export async function reindex(client: LanguageClient) {
	await client.sendRequest(ExecuteCommandRequest.type, {
		command: REINDEX_COMMAND_NAME,
		arguments: [],
	});
}
