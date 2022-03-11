# Forta Agent Examples

[![build](https://github.com/forta-protocol/forta-agent-examples/actions/workflows/build.yml/badge.svg)](https://github.com/forta-protocol/forta-agent-examples/actions/workflows/build.yml)

These examples demonstrate the possible use cases of Forta Agents with little to no configuration.

To run these examples, you'll need to:

1. Navigate to the directory of the example you'd like to run in your terminal
2. Run `npm install` to install the required packages
3. Run `npm test` to run the unit tests
4. Run `npm start` to start the agent locally. If you get an error like `no jsonRpcUrl provided in config`, then you should create a file called forta.config.json in the example folder that looks like:

```
{
  "jsonRpcUrl": "https://mainnet.infura.io/v3/YOUR_API_KEY"
}
```
