import * as fs from "fs";
import { describe, expect, jest, test } from "@jest/globals";
import * as semver from "semver";
import { Uri } from "vscode";
import * as InstallationManifest from "../installation-manifest";
import * as ReleaseVersion from "../version";
import { mockReturnValue } from "./utils/strict-mocks";

jest.mock("fs");

const aVersion = new semver.SemVer("1.2.3");
const aDirectoryUri = Uri.parse("file:///vscode");

describe("write", () => {
	test("writes the serialized manifest to disk", () => {
		InstallationManifest.write(Uri.parse("file:///vscode"), {
			name: "",
			version: aVersion,
			archiveUrl: Uri.parse("http://example.com"),
		});

		expect(fs.writeFileSync).toHaveBeenCalledWith(
			"/vscode/installation_manifest.json",
			`{"installedVersion":"${aVersion.format()}"}`,
		);
	});
});

describe("fetch", () => {
	test("returns undefined when installation manifest does not exist", () => {
		givenFileDoesNotExist();

		expect(InstallationManifest.fetch(aDirectoryUri)).toBeUndefined();
	});

	test("returns undefined when the stored manifest is invalid", () => {
		givenStoredManifest({});

		expect(InstallationManifest.fetch(aDirectoryUri)).toBeUndefined();
	});

	test("returns a manifest when the stored manifest is valid", () => {
		givenStoredManifest({ installedVersion: aVersion.format() });

		expect(InstallationManifest.fetch(aDirectoryUri)).toEqual({
			installedVersion: aVersion,
		});
	});
});

describe("isInstalledVersionGreaterThan", () => {
	test("returns true if installed version is greater", () => {
		const installedVersion = ReleaseVersion.deserialize("2.0.0");
		const otherVersion = ReleaseVersion.deserialize("1.0.0");
		const manifest: InstallationManifest.T = {
			installedVersion: installedVersion,
		};

		expect(InstallationManifest.isInstalledVersionGreaterThan(manifest, otherVersion)).toBeTrue();
	});

	test("returns false if installed version is not greater", () => {
		const installedVersion = ReleaseVersion.deserialize("1.0.0");
		const otherVersion = ReleaseVersion.deserialize("2.0.0");
		const manifest: InstallationManifest.T = {
			installedVersion: installedVersion,
		};

		expect(InstallationManifest.isInstalledVersionGreaterThan(manifest, otherVersion)).toBeFalse();
	});
});

function givenFileDoesNotExist() {
	mockReturnValue(fs, "existsSync", false);
}

function givenStoredManifest(manifest: Record<string, unknown>) {
	mockReturnValue(fs, "existsSync", true);
	mockReturnValue(fs, "readFileSync", Buffer.from(JSON.stringify(manifest), "utf-8"));
}
