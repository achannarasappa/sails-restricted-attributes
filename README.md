sails-restricted-attributes
===========================

Service for SailsJS framework that allows you to restrict access to certain model attributes based on user permissions and provide more granular control.

Installation
-----
In order to start using this service just clone the file into the api/server directory of your Sails app
```sh
cd ~/sailsApp/api/service
git clone git@github.com:achannarasappa/sails-restricted-attributes.git
```

Usage
-----
###Model
Add the attributes you want to restrict access to as an array under `restrictedAttributes`. For this specific example, the `access` attribute on the user model represents the permissions granted to the user. 

Example:
```javascript
// ~/sailsApp/api/models/User.js
module.exports = {
  tableName: 'users',
  attributes: {
    email: {
      type: 'string',
      unique: true,
      required: true
    },
    password: {
      type: 'string',
      minLength: 5,
      required: true,
      columnName: 'encrypted_password'
    },
    name: 'string',
    warnings: 'string',
    access: 'integer'
  },
  restrictedAttributes: [
    {
      name: "warnings",
      restrictions: {
        view: [1],
        update: [1]
      }
    },
    {
      name: "name",
      restrictions: {
        update: [1,'self', 2]
      }
    },
    {
      name: "password",
      restrictions: {
        view: [],
        update: ['self']
      }
    }
  ]
};
```
One simple use case is restricting the password field from being returned from an API call. In this example, the `password` attribute can not be viewed by anyone regardless or permissions and can only be updated by the user it belongs to. 

Also in this example model, the `warnings` attribute can only be viewed or updated by users with access = 1 (only admins can view/update for example). More complex restrictions can also be used such as allowing users to update only their own `name` but also allowing any user  with certain access to update any other user's `name`. In the example, users with access = 1 can update any user's name, users with access = 2 can only update their own names, and user's with access = 3 can update neither their own names nor anyone else's names.

###Controller
In order to get the filtered object with the restricted attributes removed, call `RestrictedAttrService.filter(object, restrictedAttributes, user, action)` there the parameters are:
- `object`: the object form which you want to restrict access to attributes
- `restrictedAttributes`: the array of restricted attributes defined in the model
- `user`: the user object that has the access attribute and an id attribute (`access` and `id` in the example)
- `action`: the action for which the restrictions are to be applied (`view` and `update` in the example but any be any custom action)
 
Example:
```javascript
// ~/sailsApp/api/controllers/UserController.js
module.exports = {

  find: function(req, res) {
    User.findOneById(req.param('id'), function (err, user) {
      res.json(RestrictedAttrService.filter(user, User.restrictedAttributes, res.session.user, 'view'))
    })
  }
}
```
Continuing from the same example, here Sails will respond with JSON that has the password attribute removed from the requested user object since the `password` attribute is set to be restricted regardless of user access level.

So while the `User.findOneById()` may return something like:
```json
{
    name: "John Smith",
    email: "john@example.com",
    id: 23,
    createdAt: "2014-03-04T05:51:45.000Z",
    updatedAt: "2014-03-07T03:41:41.000Z",
    password: "hashedpassword",
    warnings: 1,
    access: 2
}
```
The filtered JSON would look like this with attributes removed based on access level:
```json
{
    name: "John Smith",
    email: "john@example.com",
    id: 23,
    createdAt: "2014-03-04T05:51:45.000Z",
    updatedAt: "2014-03-07T03:41:41.000Z",
    access: 2
}
```