import { describe, expect, jest, test } from "@jest/globals";
import { LanguageClient } from "vscode-languageclient/node";
import * as ClientCommands from "../client-commands";
import * as ServerCommands from "../server-commands";
import clientStub from "./fixtures/client-stub";
import { mockResolvedValue } from "./utils/strict-mocks";

describe("ClientCommands", () => {
	describe("getRegisterFunction", () => {
		test("returns a function that registers the command with the client when called", () => {
			const clientRegister = jest.fn();
			const register = ClientCommands.getRegisterFunction(clientRegister);

			register(commandStub, undefined);

			expect(clientRegister).toHaveBeenCalledWith(commandStub.id, handler);
		});
	});

	describe("reindexProject", () => {
		test("should call the 'Reindex' server command", () => {
			const handler = ClientCommands.reindexProject.createHandler({
				client: clientStub({ isRunning: true }),
			});
			mockResolvedValue(ServerCommands, "reindex");

			handler();

			expect(ServerCommands.reindex).toHaveBeenCalled();
		});

		test("given client is not running, it should do nothing", () => {
			const handler = ClientCommands.reindexProject.createHandler({
				client: clientStub({ isRunning: false }),
			});
			mockResolvedValue(ServerCommands, "reindex");

			handler();

			expect(ServerCommands.reindex).not.toHaveBeenCalled();
		});
	});

	describe("restartServer", () => {
		test("given it is running, restarts it", () => {
			const restart = jest.fn<LanguageClient["restart"]>();
			const handler = ClientCommands.restartServer.createHandler({
				client: clientStub({ isRunning: true, restart }),
			});

			handler();

			expect(restart).toHaveBeenCalled();
		});

		test("given the client is not running, starts it", () => {
			const start = jest.fn<LanguageClient["restart"]>();
			const handler = ClientCommands.restartServer.createHandler({
				client: clientStub({ isRunning: false, start }),
			});

			handler();

			expect(start).toHaveBeenCalled();
		});
	});
});

const handler = jest.fn();

const commandStub: ClientCommands.T<undefined> = {
	id: "stub",
	createHandler: () => handler,
};
