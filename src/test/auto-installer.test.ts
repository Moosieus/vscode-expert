import * as fs from "fs";
import * as os from "os";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { URI } from "vscode-uri";
import * as AutoInstaller from "../auto-installer";
import * as Configuration from "../configuration";
import * as Github from "../github";
import * as InstallationManifest from "../installation-manifest";
import * as Notifications from "../notifications";
import * as ReleaseVersion from "../version";
import * as Zip from "../zip";
import * as ReleaseFixture from "./fixtures/release-fixture";
import { mockResolvedValue, mockReturnValue } from "./utils/strict-mocks";

jest.mock("fs", () => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { mockKeys } = require("./utils/strict-mocks");

	const original = jest.requireActual<typeof fs>("fs");
	const mocked = mockKeys(original);
	return {
		...mocked,
		realpathSync: original.realpathSync,
	};
});

describe("AutoInstaller", () => {
	beforeEach(() => {
		mockResolvedValue(Zip, "extract");
		mockReturnValue(Notifications, "notifyAutoInstallSuccess");
		mockReturnValue(Configuration, "getAutoInstallUpdateNotification", false);
	});

	describe("isInstalledReleaseLatest", () => {
		test("should return false given manifest version is lower than remote version", () => {
			givenAnInstallationManifestWithVersion("0.3.0");
			const release = givenReleaseWithVersion("0.4.0");

			const isLatest = AutoInstaller.isInstalledReleaseLatest(AN_INSTALLATION_DIR_URI, release);

			expect(isLatest).toBeFalse();
		});

		test("should return true given manifest version is higher than remote version", () => {
			givenAnInstallationManifestWithVersion("0.5.0");
			const release = givenReleaseWithVersion("0.4.0");

			const isLatest = AutoInstaller.isInstalledReleaseLatest(AN_INSTALLATION_DIR_URI, release);

			expect(isLatest).toBeTrue();
		});

		test("should return true given manifest version is equal to remote version", () => {
			givenAnInstallationManifestWithVersion("0.5.0");
			const release = givenReleaseWithVersion("0.5.0");

			const isLatest = AutoInstaller.isInstalledReleaseLatest(AN_INSTALLATION_DIR_URI, release);

			expect(isLatest).toBeTrue();
		});

		test("should return false given there is no installation manifest", () => {
			givenNoInstallationManifest();
			const release = ReleaseFixture.create();

			const isLatest = AutoInstaller.isInstalledReleaseLatest(AN_INSTALLATION_DIR_URI, release);

			expect(isLatest).toBeFalse();
		});
	});

	describe("install", () => {
		test("downloads the release from github", async () => {
			givenZipUri();
			givenDownloadedZip();
			await AutoInstaller.install(A_PROGRESS, A_RELEASE, A_RELEASE_URI);

			expect(Github.downloadZip).toHaveBeenCalledWith(A_RELEASE);
		});

		test("writes the downloaded zip to the file system", async () => {
			givenZipUri();
			const real_tmp_dir = fs.realpathSync(os.tmpdir());
			const buffer = givenDownloadedZip();

			await AutoInstaller.install(A_PROGRESS, A_RELEASE, A_RELEASE_URI);

			expect(fs.writeFileSync).toHaveBeenCalledWith(real_tmp_dir, buffer, "binary");
		});

		test("extracts the zip to the release uri", async () => {
			const zipUri = givenZipUri();
			givenDownloadedZip();
			
			await AutoInstaller.install(A_PROGRESS, A_RELEASE, A_RELEASE_URI);

			expect(Zip.extract).toHaveBeenCalledWith(zipUri, A_RELEASE_URI, A_RELEASE.version);
		});

		test("notifies the user of the newly installed version", async () => {
			mockReturnValue(Configuration, "getAutoInstallUpdateNotification", true);
			mockReturnValue(Notifications, "notifyAutoInstallSuccess");
			givenDownloadedZip();
			await AutoInstaller.install(A_PROGRESS, A_RELEASE, A_RELEASE_URI);

			expect(Notifications.notifyAutoInstallSuccess).toHaveBeenCalledWith(
				ReleaseVersion.deserialize(ReleaseVersion.serialize(A_RELEASE.version)),
			);
		});

		test("given auto-install notifications are disabled, it does not notify user of the newly installed version", async () => {
			mockReturnValue(Configuration, "getAutoInstallUpdateNotification", false);
			mockReturnValue(Notifications, "notifyAutoInstallSuccess");
			givenDownloadedZip();
			await AutoInstaller.install(A_PROGRESS, A_RELEASE, A_RELEASE_URI);

			expect(Notifications.notifyAutoInstallSuccess).not.toHaveBeenCalled();
		});
	});
});

const A_PROGRESS = { report: jest.fn() };
const A_RELEASE_URI = URI.parse("");
const A_RELEASE = ReleaseFixture.create();
const AN_INSTALLATION_DIR_URI = URI.parse("");

function givenAnInstallationManifestWithVersion(version: string): void {
	mockReturnValue(InstallationManifest, "fetch", {
		installedVersion: ReleaseVersion.deserialize(version),
	});
}

function givenNoInstallationManifest(): void {
	mockReturnValue(InstallationManifest, "fetch", undefined);
}

function givenReleaseWithVersion(version: string): Github.Release {
	const releaseVersion = ReleaseVersion.deserialize(version);
	const release = ReleaseFixture.withVersion(releaseVersion);
	return release;
}

function givenZipUri(): URI {
	mockReturnValue(os, "tmpdir", "/tmp");
	mockReturnValue(fs, "existsSync", true);
	const zipUri = URI.parse("/tmp/vscode-expert/expert.zip");
	// Need to call this because URI is a dumb class and accessing fsPath changes the internal structure
	zipUri.fsPath;

	return zipUri;
}

function givenDownloadedZip() {
	const buffer = Buffer.alloc(0);
	mockResolvedValue(Github, "downloadZip", buffer);
	return buffer;
}
