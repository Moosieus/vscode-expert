import { describe, expect, test } from "@jest/globals";
import * as semver from "semver";
import { URI } from "vscode-uri";
import { type GithubRelease, type Release, fromGithubRelease } from "../github";

describe("fromGithubRelease", () => {
	test("should throw given github release without a name", () => {
		const githubRelease: GithubRelease = {
			name: null,
			assets: [],
		};

		expect(() => fromGithubRelease(githubRelease)).toThrow();
	});

	test("should throw given github release name is not valid version", () => {
		const githubRelease: GithubRelease = {
			name: "hello",
			assets: [],
		};

		expect(() => fromGithubRelease(githubRelease)).toThrow();
	});

	test("should throw given github release does not have an expert release asset", () => {
		const githubRelease: GithubRelease = {
			name: "2023-05-27T15:48:20",
			assets: [],
		};

		expect(() => fromGithubRelease(githubRelease)).toThrow();
	});

	test("should create a release with a date version", () => {
		const githubReleaseName = "2023-05-27T15:48:20";
		const githubRelease: GithubRelease = {
			name: githubReleaseName,
			assets: [{ name: "expert.zip", browser_download_url: "https://example.com" }],
		};

		const release = fromGithubRelease(githubRelease);

		const expected: Release = {
			name: githubReleaseName,
			version: new Date(githubReleaseName + ".000Z"),
			archiveUrl: URI.parse(githubRelease.assets[0].browser_download_url),
		};
		expect(release).toEqual(expected);
	});

	test("should create a release with a semantic version", () => {
		const githubReleaseName = "v1.2.3";
		const githubRelease: GithubRelease = {
			name: githubReleaseName,
			assets: [{ name: "expert.zip", browser_download_url: "https://example.com" }],
		};

		const release = fromGithubRelease(githubRelease);

		const expected: Release = {
			name: githubReleaseName,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			version: semver.coerce(githubReleaseName)!,
			archiveUrl: URI.parse(githubRelease.assets[0].browser_download_url),
		};
		expect(release).toEqual(expected);
	});
});
