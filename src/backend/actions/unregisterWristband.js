import backend from "../backend.js";

/**
 * Successful wristband release payload
 *
 * @typedef {Object} SuccessPayload
 * @property {string} result - OK
 * @property {string} message
 *
 * @example <caption>Example of a payload received at successful wristband release </caption>
 * result: "OK"
 * message: "successfully unregisterWristbandToPlayer"
 */

/**
 * Failed wristband release payload.
 *
 * @typedef {Object} FailurePayload
 * @property {string} result - NOK
 *
 * @example <caption> Example of a payload received at failed wristband release </caption>
 * // occurs when trying to release an unregistered wristband
 * result: "NOK"
 * message: "Cannot invoke \"gr.agentfactory...*\""
 */

/**
 * Unregister Wristband
 *
 * @param {Object} payload
 * @param {string} payload.username
 * @param {string || number} payload.wristbandNumber
 * @returns {Promise<SuccessPayload || FailurePayload>}
 * @throws {ModelError}
 */
function unregisterWristband(payload) {
  return backend.publish("/wristband/unregister", payload);
}

export { unregisterWristband };
