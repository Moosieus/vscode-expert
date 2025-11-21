import { describe, expect, jest, test } from "@jest/globals";
import { ExecuteCommandRequest } from "vscode-languageclient/node";
import * as ServerCommands from "../server-commands";
import clientStub from "./fixtures/client-stub";

describe("reindex", () => {
	test("it should send a request to the server with the 'Reindex' command", () => {
		const sendRequest = jest.fn();
		const client = clientStub({ sendRequest });

		ServerCommands.reindex(client);

		expect(sendRequest).toHaveBeenCalledWith(ExecuteCommandRequest.type, {
			command: "Reindex",
			arguments: [],
		});
	});
});
