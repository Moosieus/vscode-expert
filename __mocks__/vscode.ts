/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Progress } from "vscode";
import { URI } from "vscode-uri";

function joinPath(base: URI, ...pathSegments: string[]): URI {
	return base.with({ path: [base.path, ...pathSegments].join("/") });
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Uri = { parse: URI.parse, joinPath, file: URI.file };

const progressStub = {
	report: () => {},
};

type WithProgressFun = (
	progress: Progress<{
		message: string;
	}>,
) => Promise<void>;

const outputChannelStub = {
	trace: (_message: string, ..._args: unknown[]) => {},
	debug: (_message: string, ..._args: unknown[]) => {},
	info: (_message: string, ..._args: unknown[]) => {},
	warn: (_message: string, ..._args: unknown[]) => {},
	error: (_message: string, ..._args: unknown[]) => {},
};

export const window = {
	withProgress: (_: unknown, fun: WithProgressFun) => fun(progressStub),
	createOutputChannel: (_name: string, _options: { log: true }) => outputChannelStub,
};

export enum ProgressLocation {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	SourceControl,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Window,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Notification,
}

export const l10n = {
	t(message: string, _args: Record<string, unknown>) {
		return message;
	},
};

export class CallHierarchyItem {}
export class CodeAction {}
export class CodeLens {}
export class CompletionItem {}
export class Converter {}
export class Diagnostic {}
export class DocumentLink {}
export class InlayHint {}
export class TypeHierarchyItem {}
export class SymbolInformation {}
export class CancellationError {}
