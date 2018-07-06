const ALLOWED_ORIGINS = [
    'http://localhost:5000',
    'http://jeffsaenz.surge.sh'
];

if (ALLOWED_ORIGINS.indexOf('http://localhost:5000') > -1) {
	console.log('in')
}
