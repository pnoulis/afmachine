import { backendClientService } from "../client.js";

/**
 * Successful info wristband payload
 *
 * @typedef {Object} SuccessPayload
 * @property {string} result - OK
 * @property {Object} wristband
 * @property {number} wristband.wristbandNumber
 * @property {number} wristband.wristbandColor
 * @property {boolean} wristband.active
 */

/**
 * Failed info wristband payload
 *
 * @typedef {Object} FailurePayload
 * @property {string} result - NOK
 */

/**
 * Info wristband
 *
 * @param {Object} payload
 * @param {string} payload.wristbandNumber
 * @returns {Promise} SuccessPayload or FailurePayload
 * @throws {TimeoutError}
 **/

function infoWristband(payload) {
  return backendClientService.publish("/wristband/info", payload);
}

export { infoWristband };
