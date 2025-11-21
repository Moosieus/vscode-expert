import { ProgressLocation, Uri, window } from "vscode";
import * as AutoInstaller from "./auto-installer";
import * as Github from "./github";
import * as InstallationManifest from "./installation-manifest";
import * as Logger from "./logger";
import * as Paths from "./paths";

export async function install(globalStorageUri: Uri, showError: (message: string) => void) {
	const installationDirectoryUri = Paths.getInstallationDirectoryUri(globalStorageUri);
	const releaseUri = Paths.getReleaseUri(globalStorageUri);

	let latestRelease: Github.Release;
	try {
		latestRelease = await Github.fetchLatestRelease();
	} catch (e) {
		return tryToFallbackOnInstalledVersion(
			installationDirectoryUri,
			releaseUri,
			e,
			"Failed to fetch latest release from Github.",
			showError,
		);
	}

	if (AutoInstaller.isInstalledReleaseLatest(installationDirectoryUri, latestRelease)) {
		Logger.info("Latest release is already installed. Skipping auto-install.");
		return Paths.getStartScriptUri(releaseUri, latestRelease.version).fsPath;
	}

	return window.withProgress(
		{
			title: "Installing Expert server...",
			location: ProgressLocation.Notification,
		},
		async (progress) => {
			try {
				await AutoInstaller.install(progress, latestRelease, releaseUri);
			} catch (e) {
				const failedActionMessage = `Failed to install release ${latestRelease.name} of Expert.`;

				return tryToFallbackOnInstalledVersion(
					installationDirectoryUri,
					releaseUri,
					e,
					failedActionMessage,
					showError,
				);
			}

			InstallationManifest.write(installationDirectoryUri, latestRelease);

			return Paths.getStartScriptUri(releaseUri, latestRelease.version).fsPath;
		},
	);
}

function tryToFallbackOnInstalledVersion(
	installationDirectoryUri: Uri,
	releaseUri: Uri,
	e: unknown,
	failedActionMessage: string,
	showError: (message: string) => void,
) {
	const manifest = InstallationManifest.fetch(installationDirectoryUri);

	if (manifest !== undefined) {
		showError(
			`${failedActionMessage} Using already installed release ${manifest.installedVersion.toString()} instead. Installation error: ${e}`,
		);
		return Paths.getStartScriptUri(releaseUri, manifest.installedVersion).fsPath;
	} else {
		showError(
			`${failedActionMessage} No installed version was found. Please see the following error to try and remediate the issue. Installation erro: ${e}`,
		);
		return undefined;
	}
}
