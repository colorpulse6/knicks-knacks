/**
 * Legacy exports for backwards compatibility
 * Prefer using the specific exports (base, next, etc.) as shown in the Turborepo docs
 */
module.exports = require('./base');

// Also export the specialized configs
module.exports.next = require('./next');
module.exports.base = require('./base');
module.exports.reactInternal = require('./react-internal');
