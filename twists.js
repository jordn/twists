FriendList = new Meteor.Collection("friendlist")

if (Meteor.isClient) {

  Template.app.greeting = function () {
    if(Meteor.user()) {
      window.twitterName = Meteor.user().services.twitter.screenNames
    }
    else {
      window.twitterName = "(Not logged in)"
    }
    return "Welcome to twists, " + twitterName ;
  };

  Template.users.friends = function () {
    if(Meteor.user()) {
      twitterName = Meteor.user().services.twitter.screenName
      if (!FriendList.findOne({twitterName: twitterName})) {
        Meteor.call("getFriendsList", twitterName, function(err,result) {
          if(!err) {
            console.log(result);
            friends = JSON.parse(result.content);
            console.log(friends.users);
            friends.users = friends.users.map(function(user){
              user["profile_image_url"] = user["profile_image_url"].replace("_normal", "_bigger");
              return user;
            });
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
  
  Template.users.rendered = function () {
    console.log($(".list"));
    $(".list").draggable();
    $("li.user").droppable({
      accept: ".list",
      drop: function(event, ui){console.log("yes");}
    });
  };

  Template.app.events({
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
