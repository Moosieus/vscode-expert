import { l10n, window } from "vscode";

type ArgsDictionary = Record<string, number | boolean | string>;

const channel = window.createOutputChannel("Expert", { log: true });

export function trace(message: string, args: ArgsDictionary = {}) {
	const localizedMessage = l10n.t(message, args);
	channel.debug(localizedMessage);
	console.debug(localizedMessage);
}

export function debug(message: string, args: Record<string, number | boolean | string> = {}) {
	const localizedMessage = l10n.t(message, args);
	channel.debug(localizedMessage);
	console.debug(localizedMessage);
}

export function info(message: string, args: Record<string, number | boolean | string> = {}) {
	const localizedMessage = l10n.t(message, args);
	channel.info(localizedMessage);
	console.log(localizedMessage);
}

export function warn(message: string, args: Record<string, number | boolean | string> = {}) {
	const localizedMessage = l10n.t(message, args);
	channel.warn(localizedMessage);
	console.warn(localizedMessage);
}

export function error(message: string, args: Record<string, number | boolean | string> = {}) {
	const localizedMessage = l10n.t(message, args);
	channel.error(localizedMessage);
	console.error(localizedMessage);
}

export function outputChannel() {
	return channel;
}
