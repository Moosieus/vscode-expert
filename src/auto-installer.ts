import * as fs from "fs";
import { Progress, Uri } from "vscode";
import * as Configuration from "./configuration";
import * as Github from "./github";
import * as InstallationManifest from "./installation-manifest";
import * as Logger from "./logger";
import * as Notifications from "./notifications";
import * as Paths from "./paths";
import * as Zip from "./zip";

export function isInstalledReleaseLatest(
	installationDirectoryUri: Uri,
	latestRelease: Github.Release,
) {
	const installationManifest = InstallationManifest.fetch(installationDirectoryUri);
	if (installationManifest === undefined) {
		return false;
	}

	return InstallationManifest.isInstalledVersionGreaterThan(
		installationManifest,
		latestRelease.version,
	);
}

export async function install(
	progress: Progress<{ message: string }>,
	latestRelease: Github.Release,
	releaseUri: Uri,
) {
	progress.report({ message: "Downloading Expert release" });

	const zipBuffer = await Github.downloadZip(latestRelease);

	progress.report({ message: "Installing..." });

	const zipUri = Paths.getZipUri();
	Logger.info(`Writing zip archive to ${zipUri.fsPath}`);
	fs.writeFileSync(zipUri.fsPath, zipBuffer, "binary");

	await Zip.extract(zipUri, releaseUri, latestRelease.version);

	if (Configuration.getAutoInstallUpdateNotification()) {
		Notifications.notifyAutoInstallSuccess(latestRelease.version);
	}
}
