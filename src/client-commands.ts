import { LanguageClient } from "vscode-languageclient/node";
import * as Logger from "./logger";
import * as ServerCommands from "./server-commands";

type CommandHandler = () => void;

interface Context {
	client: LanguageClient;
}

type RegisterFunction = <Context>(command: T<Context>, context: Context) => void;

export interface T<Context> {
	id: string;
	createHandler: (context: Context) => CommandHandler;
}

export function getRegisterFunction(
	clientRegister: (id: string, handler: CommandHandler) => void,
): RegisterFunction {
	return <Context>(command: T<Context>, context: Context) =>
		clientRegister(command.id, command.createHandler(context));
}

export const reindexProject: T<Context> = {
	id: "expert.server.reindexProject",
	createHandler: ({ client }) => {
		function handle() {
			if (!client.isRunning()) {
				Logger.error("Client is not running, cannot send command to server.");
				return;
			}

			ServerCommands.reindex(client);
		}

		return handle;
	},
};

export const restartServer: T<Context> = {
	id: "expert.server.restart",
	createHandler: ({ client }) => {
		function handle() {
			if (client.isRunning()) {
				Logger.info("Expert client is already running. Restarting.");
				client.restart();
			} else {
				Logger.info("Expert client is not running. Starting.");
				client.start();
			}
		}

		return handle;
	},
};
