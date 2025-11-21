import * as fs from "fs";
import * as os from "os";
import { Uri } from "vscode";
import * as ReleaseVersion from "./version";

export function getInstallationDirectoryUri(globalStorageUri: Uri) {
	const installationDirectory = Uri.joinPath(globalStorageUri, "expert_install");
	ensureDirectoryExists(installationDirectory);
	return installationDirectory;
}

export function getReleaseUri(globalStorageUri: Uri) {
	return Uri.joinPath(getInstallationDirectoryUri(globalStorageUri), "expert");
}

export function getStartScriptUri(releaseUri: Uri, version: ReleaseVersion.Version) {
	if (ReleaseVersion.usesNewPackaging(version)) {
		return Uri.joinPath(releaseUri, "bin", "start_lexical.sh");
	}

	return Uri.joinPath(releaseUri, "start_lexical.sh");
}

export function getZipUri() {
	const tempDirUri = getTempDirUri();
	return Uri.joinPath(tempDirUri, "expert.zip");
}

function getTempDirUri() {
	const path = fs.realpathSync(os.tmpdir());
	const tmpDirUri = Uri.file(path);
	const expertTmpDir = Uri.joinPath(tmpDirUri, "vscode-expert");
	ensureDirectoryExists(expertTmpDir);
	return expertTmpDir;
}

function ensureDirectoryExists(directory: Uri) {
	if (!fs.existsSync(directory.fsPath)) {
		fs.mkdirSync(directory.fsPath, { recursive: true });
	}
}
