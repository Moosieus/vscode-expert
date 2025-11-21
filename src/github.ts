import axios from "axios";
import { Uri } from "vscode";
import * as Logger from "./logger";
import { Version as ReleaseVersion, fromGithubReleaseName } from "./version";

// Raw github types as per official documentation: https://docs.github.com/en/rest?apiVersion=2022-11-28

export interface GithubRelease {
	name: string | null;
	assets: Asset[];
}

interface Asset {
	browser_download_url: string;
	name: string;
}

export interface Release {
	name: string;
	version: ReleaseVersion;
	archiveUrl: Uri;
}

export function fromGithubRelease(githubRelease: GithubRelease): Release {
	if (githubRelease.name === null) {
		throw new Error("Github release did not contain a name.");
	}

	return {
		name: githubRelease.name,
		version: fromGithubReleaseName(githubRelease.name),
		archiveUrl: findArchiveUri(githubRelease),
	};
}

function findArchiveUri(githubRelease: GithubRelease): Uri {
	const zipAsset = githubRelease.assets.find((asset) => asset.name === "expert.zip");

	if (zipAsset === undefined) {
		throw new Error(`Github release ${githubRelease.name} did not contain the expected assets.`);
	}

	return Uri.parse(zipAsset.browser_download_url);
}

export async function fetchLatestRelease(): Promise<Release> {
	const latestRelease = (
		await axios.get<GithubRelease>(
			"https://api.github.com/repos/elixir-lang/expert/releases/latest",
			{ headers: { accept: "application/vnd.github+json" } },
		)
	).data;

	Logger.info(`Latest release is "${latestRelease.name}"`);

	return fromGithubRelease(latestRelease);
}

export async function downloadZip(release: Release): Promise<NodeJS.ArrayBufferView> {
	Logger.info(`Downloading expert archive from github with path "${release.archiveUrl}"`);

	const zipArrayBuffer = (
		await axios.get<NodeJS.ArrayBufferView>(release.archiveUrl.toString(), {
			responseType: "arraybuffer",
		})
	).data;

	return zipArrayBuffer;
}
