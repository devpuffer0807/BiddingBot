export function emailTemplate(verificationUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Email Verification</title>
		<style>
			body {
				margin: 0;
				padding: 0;
				font-family: Arial, sans-serif;
				background-color: #1e1e1e;
				color: #ffffff;
			}
			.container {
				width: 100%;
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				background-color: #2d2d2d;
				border-radius: 10px;
				margin-top: 48px;
			}
			.header {
				text-align: center;
				padding: 10px 0;
			}
			.header img {
				width: 100px;
				height: auto;
			}
			.content {
				text-align: center;
				padding: 20px;
				color: #ffffff;
			}
			.button {
				display: inline-block;
				padding: 15px 25px;
				font-size: 16px;
				color: #ffffff;
				background-color: #7364db;
				border: none;
				border-radius: 5px;
				text-decoration: none;
				margin: 20px 0;
			}
			.footer {
				text-align: center;
				padding: 20px;
				font-size: 12px;
				color: #bbbbbb;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<img
					src="https://res.cloudinary.com/dgbfritim/image/upload/v1722193366/kxvelhjjm8omb0vlfqxk.png"
					alt="NFTTools Logo" />
			</div>
			<div class="content">
				<h1>Welcome to NFTTools!</h1>
				<p>
					We're excited to have you on board. Click the button below to verify
					your email address and get started.
				</p>
				<a href="${verificationUrl}" class="button">Verify Email</a>
				<a href="${verificationUrl}" class="button">${verificationUrl}</a>
			</div>
			<div class="footer">
				<p>
					If you did not sign up for this account, please ignore this email.
				</p>
				<p>&copy; 2024 NFTTools. All rights reserved.</p>
			</div>
		</div>
	</body>
</html>
`;
}
