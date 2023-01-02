if (process.env["IS_PRODUCTION"] !== undefined) {

  const fs = require('fs');
  const targetPath = './src/environments/environment.generated.ts';

  // `environment.prod.ts` file structure
  const envConfigFile = `export const environment = {
    production: ${process.env["IS_PRODUCTION"]},
    parseAppId: "${process.env["PARSE_APP_ID"]}",
    parseServerUrl: "${process.env["PARSE_SERVER_URL"]}"
  };
`;

  console.log('The file `environment.prod.ts` will be written with the following content: \n');
  console.log(envConfigFile);
  fs.writeFileSync(targetPath, envConfigFile);

} else {
  console.log('Prod configuration file will not be published, because the environment parameters are null.');
}