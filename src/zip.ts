import { Uri } from "vscode";
import extractZip = require("extract-zip");
import * as fs from "fs";
import * as Logger from "./logger";
import * as ReleaseVersion from "./version";

export async function extract(zipUri: Uri, releaseUri: Uri, version: ReleaseVersion.Version) {
	Logger.info("Extracting zip archive to {path}", {
		path: releaseUri.fsPath,
	});

	fs.rmSync(releaseUri.fsPath, { recursive: true, force: true });

	const zipDestinationUri = ReleaseVersion.usesNewPackaging(version)
		? Uri.joinPath(releaseUri, "..")
		: releaseUri;

	try {
		await extractZip(zipUri.fsPath, { dir: zipDestinationUri.fsPath });

		if (ReleaseVersion.usesNewPackaging(version)) {
			addExecutePermission(Uri.joinPath(releaseUri, "bin/start_lexical.sh"));
			addExecutePermission(Uri.joinPath(releaseUri, "bin/debug_shell.sh"));
			addExecutePermission(Uri.joinPath(releaseUri, "priv/port_wrapper.sh"));
		}
	} catch (err) {
		console.error(err);
		throw err;
	}
}

function addExecutePermission(fileUri: Uri) {
	return fs.chmodSync(fileUri.fsPath, 0o755);
}
