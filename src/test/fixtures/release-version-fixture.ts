import * as ReleaseVersion from "../../version";

export function any(): ReleaseVersion.Version {
	return ReleaseVersion.deserialize("0.3.0");
}

export function thatUsesNewPackaging(): ReleaseVersion.Version {
	return ReleaseVersion.deserialize("0.3.0");
}

export function thatDoesNotUseNewPackaging(): ReleaseVersion.Version {
	return ReleaseVersion.deserialize("0.2.0");
}
