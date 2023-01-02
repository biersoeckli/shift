
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
exports.fetchWrapper = fetch;
