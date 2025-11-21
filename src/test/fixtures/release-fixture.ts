import { URI } from "vscode-uri";
import * as Github from "../../github";
import * as ReleaseVersion from "../../version";
import * as ReleaseVersionFixture from "./release-version-fixture";

export function create(overloads: Partial<Github.Release> = {}): Github.Release {
	const defaultRelease: Github.Release = {
		name: "",
		version: ReleaseVersionFixture.any(),
		archiveUrl: URI.parse("https://example.com"),
	};

	return {
		...defaultRelease,
		...overloads,
	};
}

export function withVersion(version: ReleaseVersion.Version): Github.Release {
	return create({ version });
}
