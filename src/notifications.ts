import { window } from "vscode";
import * as Configuration from "./configuration";
import * as ReleaseVersion from "./version";

export function notifyAutoInstallSuccess(version: ReleaseVersion.Version): void {
	const disableNotificationMessage = "Disable this notification";
	const serializedVersion = ReleaseVersion.serialize(version);
	const releaseUrl = `https://github.com/elixir-lang/expert/releases/tag/v${serializedVersion}`;
	const message = `Expert was automatically updated to version ${serializedVersion}. See [what's new](${releaseUrl}).`;

	window.showInformationMessage(message, disableNotificationMessage).then((fulfilledValue) => {
		if (fulfilledValue === disableNotificationMessage) {
			Configuration.disableAutoInstallUpdateNotification();
		}
	});
}
