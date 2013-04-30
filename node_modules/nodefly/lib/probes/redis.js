/*
* Copyright (c) 2012 Dmitri Melikyan
*
* Permission is hereby granted, free of charge, to any person obtaining a 
* copy of this software and associated documentation files (the 
* "Software"), to deal in the Software without restriction, including 
* without limitation the rights to use, copy, modify, merge, publish, 
* distribute, sublicense, and/or sell copies of the Software, and to permit 
* persons to whom the Software is furnished to do so, subject to the 
* following conditions:
* 
* The above copyright notice and this permission notice shall be included 
* in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN 
* NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
* DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
* OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR 
* THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var nf = require('../nodefly');
var proxy = require('../proxy');
var samples = require('../samples');
var tiers = require('../tiers');
var topFunctions = require('../topFunctions');
var graphHelper = require('../graphHelper');

module.exports = function(redis) {

	proxy.before(redis.RedisClient.prototype, 'send_command', function (obj, args, ret) {
		if (nf.paused) return;

		var command = args[0]
			, input = args[1]
			, time = samples.time("Redis", command)
			, query = command + (typeof input[0] === 'string' ? ' "' + input[0] + '"' : '')
			, graphNode = graphHelper.startNode('Redis', query, nf);

		function handle (obj, args, extra) {
			if ( ! time.done()) return;

			topFunctions.add('redisCalls', query, time.ms);
			graphHelper.updateTimes(graphNode, time);

			if (extra) {
				extra.redis = extra.redis || 0;
				extra.redis += time.ms;
				tiers.sample(extra.closed ? 'redis_out' : 'redis_in', time);
			}
		}

		// Support send_command(com, [arg, cb]) and send_command(com, [arg], cb)
		if (typeof args[args.length-1] === 'function') {
			proxy.callback(args, -1, handle);
		} else {
			// Hack to support optional functions by adding noop function when blank
			if (typeof input[input.length-1] !== 'function') {
				input.push(function () {})
			}
			proxy.callback(input, -1, handle);
		}

		if (graphNode) nf.currentNode = graphNode.prevNode;
	});
};