import backend from "../backend.js";

/**
 * Successful package removal payload
 *
 * @typedef {Object} SuccessPayload
 */

/**
 * Failed package removal payload
 *
 * @typedef {Object} FailurePayload
 */

/**
 * Remove package from team
 *
 * @param {Object} payload
 * @param {string} payload.teamName
 * @param {number || string} payload.packageId
 *
 * @returns {Promise<BackendTeam>}
 * @throws {ModelError}
 */
function removePackage(payload) {
  return backend.publish("/team/package/delete", payload);
}

export { removePackage };
