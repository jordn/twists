FriendList = new Meteor.Collection("friendlist")

if (Meteor.isClient) {

  Template.hello.greeting = function () {
    if(Meteor.user()) {
      window.twitterName = Meteor.user().services.twitter.screenNames
    }
    else {
      window.twitterName = "(Not logged in)"
    }
    return "Welcome to twists, " + twitterName ;
  };

  Template.hello.friends = function () {
    if(Meteor.user()) {
      twitterName = Meteor.user().services.twitter.screenName
      if (!FriendList.findOne({twitterName: twitterName})) {
        Meteor.call("getFriendsList", twitterName, function(err,result) {
          if(!err) {
            console.log(result);
            friends = JSON.parse(result.content);
            FriendList.insert({userId: Meteor.userId(), twitterName: twitterName, friends: friends.users});
          } else {
            console.log(err);
            return false;
          }
        });
      };
      return FriendList.findOne({twitterName: twitterName}).friends;
      };


  };

  Template.hello.events({
    'click input' : function () {
      if(Meteor.user()) {
        window.twitterName = Meteor.user().services.twitter.screenName
      }
      else {
        window.twitterName = "(Not logged in)"
      }
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  var twitter = new Twitter();
  Meteor.methods({
      getFriendsList: function (screenName) {
          console.log('timeline')
          if(Meteor.user()) {
            result = twitter.get('friends/list.json', {screen_name: screenName});
            return result;
          }
          else {
            console.log('not logged in')
            return false;
          }
      }

  });
}
