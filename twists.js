FriendList = new Meteor.Collection("friendlist")

if (Meteor.isClient) {

  Template.hello.greeting = function () {
    if(Meteor.user()) {
      window.twitterName = Meteor.user().services.twitter.screenName
    }
    else {
      window.twitterName = "(Not logged in)"
    }
    return "Welcome to twists, " + twitterName ;
  };

  Template.hello.friends = function () {
    return FriendList.findOne().friends;

  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
    if(Meteor.user()) {
      window.twitterName = Meteor.user().services.twitter.screenName
    }
    else {
      window.twitterName = "(Not logged in)"
    }

      if (typeof console !== 'undefined')
        console.log("You pressed the button");
        Meteor.call("getFriendsList", twitterName, function(err,result) {
          if(!err) {
            console.log(result);
            friends = JSON.parse(result.content);
            FriendList.insert({twitterName: twitterName, friends: friends.users});
          }
          else {
            console.log(err)
          }
        });
    }
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });


  var twitter = new Twitter();
  Meteor.methods({
      postTweet: function (text) {
          console.log('post tweet method')
          if(Meteor.user()) {
            console.log('there is a user')
            twitter.postTweet(text);
            return true;
          }
          else {
            console.log('not logged in')
            return false;
          }
      },
      follow: function (screenName) {
          console.log('follow')
          if(Meteor.user()) {
            console.log('there is a user')
            twitter.follow(screenName);
            return true;
          }
          else {
            console.log('not logged in')
            return false;
          }
      },
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
