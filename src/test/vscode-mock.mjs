// Mock vscode module for tests
import path from "node:path";

// Mutable configuration for tests
export const mockConfigValues = { values: {} };

export const ConfigurationTarget = {
	Global: 1,
	Workspace: 2,
	WorkspaceFolder: 3,
};

export const Uri = {
	joinPath: (base, ...segments) => ({ fsPath: path.join(base.fsPath, ...segments) }),
};

export const window = {
	showErrorMessage: () => Promise.resolve(undefined),
	showInformationMessage: () => Promise.resolve(undefined),
	createOutputChannel: () => ({
		append: () => {},
		appendLine: () => {},
		clear: () => {},
		dispose: () => {},
		hide: () => {},
		show: () => {},
		info: () => {},
		warn: () => {},
		error: () => {},
		debug: () => {},
		trace: () => {},
	}),
};

export const l10n = {
	t: (message) => message,
};

export const commands = {
	registerCommand: () => ({ dispose: () => {} }),
};

// Track update calls for assertions
export const mockUpdateCalls = { calls: [] };

export const workspace = {
	getConfiguration: () => {
		const config = {
			get: (key, defaultValue) =>
				key in mockConfigValues.values ? mockConfigValues.values[key] : defaultValue,
			update: (key, value, target) => {
				mockUpdateCalls.calls.push({ key, value, target });
				return Promise.resolve();
			},
			getConfiguration: () => config,
		};
		return config;
	},
	workspaceFolders: [{ uri: { path: "/test/workspace" } }],
};
