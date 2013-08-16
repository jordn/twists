FriendList = new Meteor.Collection("friendlist")

if (Meteor.isClient) {

  Template.hello.greeting = function () {
    if(Meteor.user()) {
      twitterName = Meteor.user().services.twitter.screenName
    } else {
      twitterName = "(Not logged in)"
    }
    return "Welcome to twists, " + twitterName ;
  };

  Template.hello.friends = function () {
    if(Meteor.user()) {
      twitterName = Meteor.user().services.twitter.screenName
      if (!FriendList.findOne({twitterName: twitterName})) {
        friends = getFriends(twitterName)
        if (friends) {
          FriendList.insert({userId: Meteor.userId(), twitterName: twitterName, friends: friends});
        } else {
          return false;
        };
      };
      return FriendList.findOne({twitterName: twitterName}).friends;
    } else {
      return false;
    };
  };

  Template.hello.events({
    'click input' : function () {
      console.log('Refreshing friends list');     
    }
  });

} //end client

function getFriends (twitterName) {
  Meteor.call("getFriendsList", twitterName, function(err,result) {
    if(!err) {
      console.log(result);
      friends = JSON.parse(result.content).users;
      return friends;
    } else {
      console.log(err);
      return false;
    }
  });
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  var twitter = new Twitter();
  Meteor.methods({
    FriendsList: function (screenName) {
        console.log('timeline')
        if(Meteor.user()) {
          result = twitter.get('friends/list.json', {screen_name: screenName});
          return result;
        } else {
          console.log('not logged in')
          return false;
        };
    }
  });

}
