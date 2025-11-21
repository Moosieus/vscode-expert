import { describe, expect, test } from "@jest/globals";
import { SynchronousPromise } from "synchronous-promise";
import { MessageItem, window } from "vscode";
import * as Configuration from "../configuration";
import * as Notifications from "../notifications";
import * as ReleaseVersion from "../version";
import { mockReturnValue } from "./utils/strict-mocks";

describe("notifyAutoInstallSuccess", () => {
	test("sends an information message with the installed version", () => {
		mockReturnValue(window, "showInformationMessage", Promise.resolve(undefined));

		Notifications.notifyAutoInstallSuccess(ReleaseVersion.deserialize("1.2.3"));

		expect(window.showInformationMessage).toHaveBeenCalledWith(
			expect.stringContaining("version 1.2.3"),
			"Disable this notification",
		);
	});

	test("when user requests to disable the notification, it updates the configuration", () => {
		mockReturnValue(Configuration, "disableAutoInstallUpdateNotification");
		mockReturnValue(
			window,
			"showInformationMessage",
			SynchronousPromise.resolve("Disable this notification" as unknown as MessageItem),
		);

		Notifications.notifyAutoInstallSuccess(ReleaseVersion.deserialize("1.2.3"));

		expect(Configuration.disableAutoInstallUpdateNotification).toHaveBeenCalled();
	});

	test("notification should include a link to the release notes", () => {
		mockReturnValue(window, "showInformationMessage", Promise.resolve(undefined));

		Notifications.notifyAutoInstallSuccess(ReleaseVersion.deserialize("1.2.3"));

		expect(window.showInformationMessage).toHaveBeenCalledWith(
			expect.stringContaining("https://github.com/elixir-lang/expert/releases/tag/v1.2.3"),
			"Disable this notification",
		);
	});
});
