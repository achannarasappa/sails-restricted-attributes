/**
 * RestrictedAttrService
 *
 * @module      :: Service
 * @description	:: A set of functions that control view and update access to model attributes
 *                 and allow more granular control over which attributes by which users.
 * @param {Object} object returned by Model.findOne() where Model is any model
 * @param {Object} restrictedAttributes are model attributes that can be viewed or updated
 *                 by certain users
 * @param {Object} user represents the currently logged in user
 * @param {Object} action for which specific access rules should be applied
 * @author      :: Ani Channarasappa
 */
exports.filter = function(object, restrictedAttributes, user, action) {
  // userIdAttribute & objectIdAttribute: attributes will be compared to determine if the 'self' restriction is met
  // accessAttribute: attribute on user that will be checked to see if they have permission to view/update the given attribute on the object
  var config = {
    userIdAttribute: 'id',
    objectIdAttribute: 'id',
    accessAttribute: 'access'
  }, restricted = false;

  restrictedAttributes.forEach(function(rule){
    // Check if the object has the attribute and there are action restrictions on the attribute
    if (object.hasOwnProperty(rule.name) && rule.restrictions[action] != undefined) {
      // Remove attribute if current user's access level is not in the array of allowed access levels
      if (!(rule.restrictions[action].indexOf(user[config.accessAttribute]) > -1)) {
        restricted = true;
      }

      // Remove attribute if only the object itself should be performing the action
      if ((rule.restrictions[action].indexOf('self') > -1) && user[config.userIdAttribute] != object[config.objectIdAttribute] && !restricted) {
        if (rule.restrictions[action].indexOf('self') > rule.restrictions[action].indexOf(user[config.accessAttribute])){
          // Allow users with access level that come before self in the array to still performing action this attribute.
          // This is useful for allowing admins to perform action on all attributes but limiting users to performing given action only their own attributes.
        } else {
          restricted = true;
        }
      }

      if (restricted) {
        delete object[rule.name];
      }
    }
  });
  return object;
};