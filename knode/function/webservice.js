/**
 * New node file
 */

module.exports = function(url, SOAPAction, args) {
	M.soap.createClient(url, function(err, client) {
		return client;
	});
}