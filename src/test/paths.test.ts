import * as fs from "fs";
import * as os from "os";
import { describe, expect, jest, test } from "@jest/globals";
import { URI } from "vscode-uri";
import * as Paths from "../paths";
import * as ReleaseVersionFixture from "./fixtures/release-version-fixture";
import { mockReturnValue } from "./utils/strict-mocks";

jest.mock("fs");
jest.mock("os");

describe("Paths", () => {
	test("getInstallationDirectory returns the appropriate uri", () => {
		const globalStorageUri = URI.parse("/vscode");
		const installationDirectory = Paths.getInstallationDirectoryUri(globalStorageUri);

		expectUrisToBeEqual(installationDirectory, URI.parse("/vscode/expert_install"));
	});

	test("getZipUri returns the appropriate uri", () => {
		mockTmpDirPath("/real-tmp");

		const zipUri = Paths.getZipUri();

		expectUrisToBeEqual(zipUri, URI.parse("/real-tmp/vscode-expert/expert.zip"));
	});

	test("getZipUri creates the temporary directory if it does not exist", () => {
		mockTmpDirPath("/real-tmp");
		mockReturnValue(fs, "existsSync", false);

		Paths.getZipUri();

		expect(fs.mkdirSync).toHaveBeenCalledWith("/real-tmp/vscode-expert", {
			recursive: true,
		});
	});

	test("getReleaseUri returns the appropriate uri", () => {
		const globalStorageUri = URI.parse("/vscode");
		const releaseUri = Paths.getReleaseUri(globalStorageUri);

		expectUrisToBeEqual(releaseUri, URI.parse("/vscode/expert_install/expert"));
	});

	describe("getStartScriptUri", () => {
		test("returns script from bin when release uses new packaging", () => {
			const releaseUri = URI.parse("/expert");
			const version = ReleaseVersionFixture.thatUsesNewPackaging();
			const startScriptUri = Paths.getStartScriptUri(releaseUri, version);

			expectUrisToBeEqual(startScriptUri, URI.parse("/lexical/bin/start_lexical.sh"));
		});
	});
});

function expectUrisToBeEqual(actual: URI, expected: URI) {
	expect(actual.fsPath).toEqual(expected.fsPath);
}

function mockTmpDirPath(path: string) {
	mockReturnValue(os, "tmpdir", "/tmp");
	mockReturnValue(fs, "realpathSync", path);
}
