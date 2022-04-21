/**
 * A fake implementation of the Scalyr Backend that can be used to implement the User Management page.
 *
 * It keeps an in-memory list of users that is not persisted (so any changes are lost on a full
 * page reload).
 *
 * Loading this file will create an instance of the Scalyr Backend and store it in
 * `scalyrBackend` in the global scope.
 *
 * Each user is represented by a JSON Object with the following fields:
 *
 *   email:         A string recording the email address for this user.
 *   accessLevel:   A string representing the permissions the user has.  The only three valid
 *                  values are: read-only, full, and limited.
 *   state:         A string representing the state for the user (have they activated their account.)
 *                  The only two valid values are: active and invited.
 *
 * The Scalyr Backend is supposed to simulate API calls to a real backend.  As such, all the public
 * methods for the Scalyr Backend return a promise, which can be used to perform work once the
 * simulated asynchronous API calls are completed.
 *
 * The methods you will be using directly are:
 *
 *   scalyrBackend.getUsers():  Returns a promise that will resolve to an object with two fields:
 *         `status` recording if the request was successful or not and `users` containing a JSON
 *         array with user objects. See the documentation below for more details about the
 *         `getUsers` method.
 *
 *   scalyrBackend.inviteUsers(userEmails, accessLevel):  Returns a promise that will resolve once
 *         the specified list of users has been added to the backend. Each user in the list will
 *         be added with the specified accessLevel. See the documentation below for more details
 *         about the `inviteUsers` method.
 *
 *   scalyrBackend.resendInvite(userEmail):  Returns a promise that will resolve once the specified
 *         user has been sent a new invite email. Note that for this exercise we're not actually
 *         sending a real email. See the documentation below for more details about the
 *         `resendInvite` method.
 *
 *   scalyrBackend.revokeAccess(userEmail):  Returns a promise that will resolve once the specified
 *         user has been removed from the backend list of users. This call will revoke both an
 *         invited user and an active user. See the documentation below for more details about the
 *         `revokeAccess` method.
 */

'use strict';
/**
 * The permission levels for a user.
 */
const AccessLevel = {
  'READ_ONLY': 'read-only',
  'FULL':      'full',
  'LIMITED':   'limited'
};

/**
 * The states for a user, indicating either they have been invited or are active (indicating they have
 * accepted the invitation).
 */
const UserState = {
  'ACTIVE':  'active',
  'INVITED': 'invited'
};

function ScalyrBackend() {
  /**
   * The current user list for this instance of the backend.  We hold this list in memory and only for the
   * duration of the current page.  This is used only for testing purposes.
   *
   * @type {[{email: String, accessLevel: String, state: String}]}
   * @private
   */
  this._userList = [
    this._createUserRecord('czerwin@scalyr.com', AccessLevel.FULL, UserState.ACTIVE),
    this._createUserRecord('asma@scalyr.com', AccessLevel.FULL, UserState.ACTIVE),
    this._createUserRecord('jeff@scalyr.com', AccessLevel.FULL, UserState.INVITED),
    this._createUserRecord('claudia@scalyr.com', AccessLevel.READ_ONLY, UserState.ACTIVE),
    this._createUserRecord('steve@scalyr.com', AccessLevel.LIMITED, UserState.INVITED)
  ];
}

/**
 * Returns a promise that will resolve to the current list of users.
 *
 * Each user record will have three fields: `email`, `accessLevel`, and `state.
 */
ScalyrBackend.prototype.getUsers = function getUsers() {
  const result = [];
  for (let i = 0; i < this._userList.length; ++i) {
    result.push(this._copyUserRecord(this._userList[i]));
  }

  return this._returnResult({
    'status': 'success',
    'users': result
  });
};

/**
 * Adds the specified list of users with the specified access level.  Each user's state will be set to
 * `invited`.
 *
 * @param {[String]} users  The list of email addresses of the users to add.
 * @param {String} accessLevel  The access level.  Must be drawn from one of `read-only`, `full`, and `limited`.
 * @return {Promise} A promise that will resolve to success if the adds were valid, or an error message.
 */
ScalyrBackend.prototype.inviteUsers = function inviteUsers(users, accessLevel) {
  if (!this._hasValue(AccessLevel, accessLevel)) {
    return this._returnError('invalidAccess', 'The specified accessLevel "' + accessLevel + '" is not valid.');
  }

  for (let i = 0; i < users.length; ++i) {
    if (this._findUser(users[i])) {
      return this._returnError('userExists', 'The specified user "' + users[i] + '" already exists.');
    }
  }

  for (let i = 0; i < users.length; ++i) {
    this._userList.push(this._createUserRecord(users[i], accessLevel, UserState.INVITED));
  }

  return this._returnSuccess();
};

/**
 * Will resend the invitation for the specified user.
 *
 * (Note, this method doesn't really do anything.  In a real world example, it would send an email.)
 *
 * @param {String} user  The email address of the user to resend.
 * @returns {Promise}  A promise that will either resolve to an object with `status` set to `success` or be
 *     rejected with an appropriate error message.
 */
ScalyrBackend.prototype.resendInvite = function resendInvite(user) {
  if (!this._findUser(user)) {
    return this._returnError('userNotExists', 'The specified user "' + user + '" does not exists.');
  }

  return this._returnSuccess();
};

/**
 * Will remove the specified user from the current list.
 *
 * @param {String} user  The email address of the user to remove.
 * @returns {Promise}  A promise that will either resolve to an object with `status` set to `success` or be
 *     rejected with an appropriate error message.
 */
ScalyrBackend.prototype.revokeAccess = function revokeAccess(user) {
  let targetUser = this._findUser(user);
  if (!targetUser) {
    return this._returnError('userNotExists', 'The specified user "' + user + '" does not exists.');
  }
  this._userList.splice(this._userList.indexOf(targetUser), 1);

  return this._returnSuccess();
};

/**
 * Used for testing purposes only.
 *
 * Updates the specified user record to mark it as `active`.
 *
 * @param {String} user  The email address of the user.
 * @returns {Promise}  A promise that will resolve to success if it was successful.
 */
ScalyrBackend.prototype.markAsActive = function markAsActive(user) {
  let targetUser = this._findUser(user);
  if (!targetUser) {
    return this._returnError('userNotExists', 'The specified user "' + user + '" does not exists.');
  }
  targetUser.state = UserState.ACTIVE;

  return this._returnSuccess();
};

/**
 * Returns a new instance of a user record.
 *
 * @param {String} emailAddress  The email address.
 * @param {String} accessLevel  The access level.
 * @param {String} userState  The user state.
 * @returns {{email: String, accessLevel: String, state: String}}
 * @private
 */
ScalyrBackend.prototype._createUserRecord = function createUserRecord(emailAddress, accessLevel, userState) {
  return {
    'email': emailAddress,
    'accessLevel': accessLevel,
    'state': userState
  };
};

/**
 * Returns the user record for `emailAddress` if present in the current list, or null.
 *
 * @param {String} emailAddress  The email address of the user to search for.
 * @returns {{}|null}  The user record or null if there is no record with the specified email address.
 * @private
 */
ScalyrBackend.prototype._findUser = function findUser(emailAddress) {
  for (let i = 0; i < this._userList.length; ++i) {
    if (this._userList[i].email === emailAddress) {
      return this._userList[i];
    }
  }

  return null;
};

/**
 * Returns a copy of the specified user record.
 *
 * @param source  The input object.
 * @returns {{}}  The user record.
 * @private
 */
ScalyrBackend.prototype._copyUserRecord = function copy(source) {
  return {
    'email': source.email,
    'accessLevel': source.accessLevel,
    'state': source.state
  };
};

/**
 * Returns true if `value` is a value in the object `inputObject`.
 *
 * @param {{}} inputObject  The object
 * @param {String} value  The value to check.
 * @returns {boolean}  True if `value` is a value in `inputObject`.
 * @private
 */
ScalyrBackend.prototype._hasValue = function hasValue(inputObject, value) {
  return Object.values(inputObject).indexOf(value) >= 0;
};

/**
 * Returns a promise that will resolve (in a short amount of time) to the specified object.
 *
 * @param result The result to resolve the promise to
 * @returns {Promise}
 * @private
 */
ScalyrBackend.prototype._returnResult = function returnResult(result) {
  return this._returnPromise(true, result);
};

/**
 * Returns a promise that will be rejected with a reason created by the specified error code and message.
 *
 * The reason object will be created with two fields: `status` (containing the error code) and `message`
 * containing message.
 *
 * @param {String} errorCode  The error code.
 * @param {String} message  The error message.
 * @returns {Promise}
 * @private
 */
ScalyrBackend.prototype._returnError = function returnError(errorCode, message) {
  return this._returnPromise(false, {
    'status': errorCode,
    'message': message
  });
};

/**
 * Returns a promise that will resolve to a success message in a short amount of time.
 *
 * @returns {Promise}  The promise
 * @private
 */
ScalyrBackend.prototype._returnSuccess = function returnSuccess() {
  return this._returnResult({ 'status': 'success'});
};

/**
 * Returns a promise that will be either resolved or rejected in a short amount of time.
 *
 * @param {Boolean} success  If true, the promise will be resolved.  Otherwise, it will be rejected.
 * @param {Object} value  The value to resolve the promise with if success, otherwise the reason for the rejection.
 * @returns {Promise}
 * @private
 */
ScalyrBackend.prototype._returnPromise = function returnPromise(success, value) {
  return new Promise(function(resolve, reject) {
    window.setTimeout(function() {
      if (success) {
        resolve(value);
      } else {
        reject(value);
      }
    }, 100);
  });
};

export default new ScalyrBackend();