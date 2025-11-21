import { describe, expect, test } from "@jest/globals";
import { SemVer } from "semver";
import * as ReleaseVersion from "../version";

const validDate = "2023-05-27T15:48:20.000Z";
const validSemanticVersion = "1.2.3";
const invalidVersion = "hello";

describe("serialize", () => {
	test("should serialize a date version", () => {
		const serialized = ReleaseVersion.serialize(new Date(validDate));
		expect(serialized).toEqual(validDate);
	});

	test("should serialize a semantic version", () => {
		const serialized = ReleaseVersion.serialize(new SemVer(validSemanticVersion));
		expect(serialized).toEqual(validSemanticVersion);
	});
});

describe("deserialize", () => {
	test("should deserialize a date version", () => {
		const version = ReleaseVersion.deserialize(validDate);
		expect(version).toEqual(new Date(validDate));
	});

	test("should deserialize a semantic version", () => {
		const version = ReleaseVersion.deserialize(validSemanticVersion);
		expect(version).toEqual(new SemVer(validSemanticVersion));
	});

	test("should throw if version is not deserializable", () => {
		expect(() => ReleaseVersion.deserialize(invalidVersion)).toThrow();
	});
});

describe("isValid", () => {
	test("should accept date versions", () => {
		expect(ReleaseVersion.isValid(validDate)).toBe(true);
	});

	test("should accept semantic versions", () => {
		expect(ReleaseVersion.isValid(validSemanticVersion)).toBe(true);
	});

	test("should not accept invalid versions", () => {
		expect(ReleaseVersion.isValid(invalidVersion)).toBe(false);
	});
});

describe("gte", () => {
	test("should be true if left side is a semantic version and right side is a date", () => {
		const semanticVersion = new SemVer(validSemanticVersion);
		const dateVersion = new Date(validDate);

		expect(ReleaseVersion.gte(semanticVersion, dateVersion)).toBe(true);
	});

	test("should be false if left side is a date version and right side is a semantic", () => {
		const semanticVersion = new SemVer(validSemanticVersion);
		const dateVersion = new Date(validDate);

		expect(ReleaseVersion.gte(dateVersion, semanticVersion)).toBe(false);
	});

	test("should compare two semantic versions", () => {
		const lowerSemanticVersion = new SemVer("1.1.1");
		const greaterSemanticVersion = new SemVer("2.2.2");

		expect(ReleaseVersion.gte(greaterSemanticVersion, lowerSemanticVersion)).toBe(true);
	});

	test("should compare two date versions", () => {
		const lowerDateVersion = new Date("2023-01-01T00:00:00.000Z");
		const greaterDateVersion = new Date("2024-01-01T00:00:00.000Z");

		expect(ReleaseVersion.gte(greaterDateVersion, lowerDateVersion)).toBe(true);
	});
});

describe("fromGithubReleaseName", () => {
	test("should parse a semantic github release name", () => {
		const version = ReleaseVersion.fromGithubReleaseName("v1.2.3");

		expect(version).toEqual(new SemVer("1.2.3"));
	});

	test("should parse a date github release name", () => {
		const version = ReleaseVersion.fromGithubReleaseName("2023-05-27T15:48:20");

		expect(version).toEqual(new Date("2023-05-27T15:48:20.000Z"));
	});

	test("should throw given invalid release name", () => {
		expect(() => ReleaseVersion.fromGithubReleaseName("hello")).toThrow();
	});
});

describe("usesNewPackaging", () => {
	test("true if version is equal to 0.3.0", () => {
		const version = ReleaseVersion.deserialize("0.3.0");
		expect(ReleaseVersion.usesNewPackaging(version)).toBe(true);
	});

	test("false if version is lower than 0.3.0", () => {
		const version = ReleaseVersion.deserialize("0.2.9");
		expect(ReleaseVersion.usesNewPackaging(version)).toBe(false);
	});

	test("true if version is greater than 0.3.0", () => {
		const version = ReleaseVersion.deserialize("0.3.1");
		expect(ReleaseVersion.usesNewPackaging(version)).toBe(true);
	});
});
