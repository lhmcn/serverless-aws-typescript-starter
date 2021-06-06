import axios, {AxiosRequestConfig, AxiosResponse} from "axios";

const verifyUrl: string = "https://www.google.com/recaptcha/api/siteverify";

const verifyScore: number = parseFloat(process.env.RECAPTCHA_V3_SCORE);

const secret: string = "secret=" + process.env.RECAPTCHA_V3_KEY;

const verifyConfig: AxiosRequestConfig = {
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	},
}

/**
 * Schema of the verify result
 */
interface VerifyResult {
	valid: boolean,
	error?: any[],
}

/**
 * Verifies the reCaptcha V3 token
 * @param token The token
 * @param sourceIp The user"s IP (optional)
 */
const verify = async (token, sourceIp = ""): Promise<VerifyResult> => {
	//return {valid: true};

	const result: VerifyResult = {
		valid: false,
		error: [],
	};

	try {
		// Verify with reCaptcha
		const data: string = secret + "&response=" + encodeURIComponent(token) + "&remoteip=" + encodeURIComponent(sourceIp);
		const response: AxiosResponse = await axios.post(verifyUrl, data, verifyConfig);

		if (response.status !== 200) {
			result.error.push("Server error");
		} else if (!response.data.success) {
			result.error = response.data["error-codes"];
		} else if (response.data.score <= verifyScore) {
			result.error.push("LowScore");
		} else {
			result.valid = true;
		}
	} catch (e) {
		result.error.push(e);
	}

	return result;
};

export default {
	verify,
};
