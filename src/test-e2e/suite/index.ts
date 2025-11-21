// Adapted from https://github.com/daddykotex/jest-tests

import { runCLI } from "jest";

interface ITestRunner {
	run(testsRoot: string, clb: (error?: Error, failures?: number) => void): void;
}
import path = require("path");

const jestTestRunnerForVSCodeE2E: ITestRunner = {
	run(_testsRoot: string, reportTestResults: (error?: Error, failures?: number) => void): void {
		const projectRootPath = process.cwd();
		const config = path.join(projectRootPath, "jest.e2e.config.js");

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		runCLI({ config } as any, [projectRootPath])
			.then((jestCliCallResult) => {
				jestCliCallResult.results.testResults.forEach((testResult) => {
					testResult.testResults
						.filter((assertionResult) => assertionResult.status === "passed")
						.forEach(({ ancestorTitles, title, status }) => {
							console.info(`  ● ${ancestorTitles} > ${title} (${status})`);
						});
				});

				jestCliCallResult.results.testResults.forEach((testResult) => {
					if (testResult.failureMessage) {
						console.error(testResult.failureMessage);
					}
				});

				reportTestResults(undefined, jestCliCallResult.results.numFailedTests);
			})
			.catch((errorCaughtByJestRunner) => {
				reportTestResults(errorCaughtByJestRunner, 0);
			});
	},
};

module.exports = jestTestRunnerForVSCodeE2E;
