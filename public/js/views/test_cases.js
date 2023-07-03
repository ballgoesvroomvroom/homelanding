const TEST_CASES = [
	["(a-b)(a+b)(a-b)", "a^3-a^2*b-b^2*a+^3"]
]


function RUN_TESTCASES() {
	return new Promise(res => {
		res(TEST_CASES)
	});

}

module.exorts = {
	RUN_TESTCASES
}