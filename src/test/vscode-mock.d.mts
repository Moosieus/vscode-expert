export const mockConfigValues: { values: Record<string, unknown> };
export const mockUpdateCalls: { calls: Array<{ key: string; value: unknown; target: number }> };
export const ConfigurationTarget: { Global: 1; Workspace: 2; WorkspaceFolder: 3 };
export const Uri: {
	joinPath: (base: { fsPath: string }, ...segments: string[]) => { fsPath: string };
};
export const window: {
	showErrorMessage: () => Promise<undefined>;
	showInformationMessage: () => Promise<undefined>;
	createOutputChannel: () => Record<string, () => void>;
};
export const l10n: { t: (message: string) => string };
export const commands: { registerCommand: () => { dispose: () => void } };
export const workspace: {
	getConfiguration: () => {
		get: <T>(key: string, defaultValue?: T) => T;
		update: (key: string, value: unknown, target: number) => Promise<void>;
		getConfiguration: () => ReturnType<typeof workspace.getConfiguration>;
	};
	workspaceFolders: Array<{ uri: { path: string } }>;
};
