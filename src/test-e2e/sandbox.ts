import { downloadAndUnzipVSCode } from "@vscode/test-electron";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

async function main() {
	const extensionDevelopmentPath = path.resolve(__dirname, "../../");
	const fixturesProjectPath = path.resolve(__dirname, "./fixtures");
	const userDataDir = path.resolve(__dirname, "../../.vscode-test/user-data");

	configureExtensionSettings(userDataDir);

	// Download VS Code (same version as E2E tests)
	const vscodeExecutablePath = await downloadAndUnzipVSCode("1.82.0");

	console.log("Launching VSCode sandbox...");
	console.log(`  Extension: ${extensionDevelopmentPath}`);
	console.log(`  Workspace: ${fixturesProjectPath}`);
	console.log(`  LSP Trace: verbose (check Output > Expert panel)`);

	// Launch VSCode with isolation flags
	const child = spawn(
		vscodeExecutablePath,
		[
			"--extensionDevelopmentPath=" + extensionDevelopmentPath,
			"--user-data-dir=" + userDataDir,
			"--disable-extensions",
			"--skip-welcome",
			"--skip-release-notes",
			"--disable-workspace-trust",
			fixturesProjectPath,
		],
		{
			stdio: "inherit",
			detached: false,
		},
	);

	// Forward termination signals to child
	const cleanup = () => child.kill();

	process.on("SIGINT", cleanup);
	process.on("SIGTERM", cleanup);

	// Wait for VSCode to close
	await new Promise<void>((resolve) => {
		child.on("close", () => resolve());
		child.on("error", () => resolve());
	});

	process.off("SIGINT", cleanup);
	process.off("SIGTERM", cleanup);
}

function configureExtensionSettings(userDataDir: string): void {
	const settingsDir = path.join(userDataDir, "User");
	const settingsPath = path.join(settingsDir, "settings.json");
	fs.mkdirSync(settingsDir, { recursive: true });

	let settings: Record<string, unknown> = {};
	if (fs.existsSync(settingsPath)) {
		try {
			settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
		} catch {
			// Ignore parse errors, start fresh
		}
	}

	// Enable verbose LSP tracing
	settings["expert.trace.server"] = "verbose";

	fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

main().catch((err) => {
	console.error("Failed to launch sandbox:", err);
	process.exit(1);
});
