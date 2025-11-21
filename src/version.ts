import { parseISO } from "date-fns";
import * as semver from "semver";

export type Version = Date | semver.SemVer;

export function serialize(version: Version): string {
	if (version instanceof Date) {
		return version.toISOString();
	}

	return version.format();
}

export function deserialize(rawVersion: string): Version {
	const date = deserializeToDate(rawVersion);
	if (date !== undefined) {
		return date;
	}

	const semanticVersion = deserializeToSemantic(rawVersion);
	if (semanticVersion !== undefined) {
		return semanticVersion;
	}

	throw new Error(`Version "${rawVersion} is not a valid ISO8601 nor a valid semantic number.`);
}

export function isValid(rawVersion: string): boolean {
	return (
		deserializeToDate(rawVersion) !== undefined || deserializeToSemantic(rawVersion) !== undefined
	);
}

export function gte(left: Version, right: Version): boolean {
	if (left instanceof semver.SemVer && right instanceof Date) {
		return true;
	}

	if (left instanceof semver.SemVer && right instanceof semver.SemVer) {
		return semver.gte(left, right);
	}

	if (left instanceof Date && right instanceof Date) {
		return left >= right;
	}

	return false;
}

export function fromGithubReleaseName(releaseName: string): Version {
	const dateVersion = githubReleaseNameToDate(releaseName);
	if (dateVersion !== undefined) {
		return dateVersion;
	}

	const semanticVersion = githubReleaseNameToSemanticVersion(releaseName);
	if (semanticVersion !== undefined) {
		return semanticVersion;
	}

	throw new Error(
		`Release name "${releaseName} is not a valid ISO8601 timestamp without milliseconds nor a valid semantic number.`,
	);
}

export function usesNewPackaging(version: Version): boolean {
	return gte(version, deserialize("0.3.0"));
}

function deserializeToDate(rawVersion: string): Date | undefined {
	const date = parseISO(rawVersion);

	if (date.toString() === "Invalid Date") {
		return undefined;
	}

	return date;
}

function deserializeToSemantic(rawVersion: string): semver.SemVer | undefined {
	const semanticVersion = semver.valid(rawVersion);

	if (semanticVersion !== null) {
		return new semver.SemVer(semanticVersion);
	}

	return undefined;
}

function githubReleaseNameToDate(releaseName: string): Date | undefined {
	return deserializeToDate(releaseName + ".000Z");
}

function githubReleaseNameToSemanticVersion(releaseName: string): semver.SemVer | undefined {
	return semver.coerce(releaseName) ?? undefined;
}
