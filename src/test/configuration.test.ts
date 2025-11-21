import { describe, expect, jest, test } from "@jest/globals";
import { URI } from "vscode-uri";
import * as Configuration from "../configuration";
import * as WorkspaceFixture from "./fixtures/workspace-fixture";

// Mock the vscode module
jest.mock("vscode", () => ({
	workspace: {
		getConfiguration: jest.fn(),
	},
	window: {
		createOutputChannel: jest.fn().mockReturnValue({
			append: jest.fn(),
			appendLine: jest.fn(),
			clear: jest.fn(),
			dispose: jest.fn(),
			hide: jest.fn(),
			show: jest.fn(),
			trace: jest.fn(),
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		}),
	},
	l10n: {
		t: jest.fn((message: string) => message),
	},
	ConfigurationTarget: {
		Global: 1,
	},
}));

describe("Configuration", () => {
	test("getProjectDirUri returns the workspace URI when project dir is not configured", () => {
		const workspace = WorkspaceFixture.withUri(URI.file("/stub"));

		// Mock getConfiguration to return undefined for projectDir
		const mockGet = jest.fn().mockReturnValue(undefined);
		const vscode = require("vscode");
		vscode.workspace.getConfiguration = jest.fn().mockReturnValue({
			get: mockGet,
		});

		const projectDirUri = Configuration.getProjectDirUri(workspace);

		expect(projectDirUri).toEqual(workspace.workspaceFolders![0].uri);
		expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("expert.server");
	});

	test("getProjectDirUri returns the full directory URI when project dir is configured", () => {
		const workspace = WorkspaceFixture.withUri(URI.file("/stub"));

		// Mock getConfiguration to return "subdirectory" for projectDir
		const mockGet = jest.fn().mockReturnValue("subdirectory");
		const vscode = require("vscode");
		vscode.workspace.getConfiguration = jest.fn().mockReturnValue({
			get: mockGet,
		});

		const projectDirUri = Configuration.getProjectDirUri(workspace);

		expect(projectDirUri).toEqual(URI.file("/stub/subdirectory"));
		expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("expert.server");
	});
});
