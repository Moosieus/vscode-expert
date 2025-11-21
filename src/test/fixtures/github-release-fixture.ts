import { GithubRelease } from "../../github";

export function any(): GithubRelease {
	return {
		name: "0.0.1",
		assets: [{ name: "expert.zip", browser_download_url: "" }],
	};
}
