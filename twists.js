FriendList = new Meteor.Collection("friendlist")
ListList = new Meteor.Collection("listlist")


if (Meteor.isClient) {

  Template.app.greeting = function () {
    if(Meteor.user()) {
      twitterName = Meteor.user().services.twitter.screenName
    } else {
      twitterName = "(Not logged in)"
    }
    return "Welcome to twists, " + twitterName ;
  };

  Template.users.rendered = function () {
    console.log($(".list"));
    $(".list").draggable({
      revert: "invalid",
      snap: ".user",
      snapMode: "inner",
      helper: "clone",
      drag: function( event, ui ) {
        console.log($(this).css('background-color'));
        $(".overlay span").html("Add to " + $(this).html());
        var color = $.Color(this,'background-color').alpha(0.7);
        $(".overlay").css('background-color', color.toRgbaString());
      }
    });
    $("li.user").droppable({
      accept: ".list",
      hoverClass: "ui-state-active",
      drop: function(event, ui){
        var $firstDrag = ui.draggable;
        var $secondDrag = $(this).children(":first");
        var $destDrop = $(this);
        var $sourceDrop = $firstDrag.parent();
      }
    });
  };

  Template.users.friends = function () {
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

  Template.lists.lists = function () {
    if(Meteor.user()) {
      twitterName = Meteor.user().services.twitter.screenName
      if (!ListList.findOne({twitterName: twitterName})) {
        lists = getLists(twitterName)
        if (lists) {
          ListList.insert({userId: Meteor.userId(), twitterName: twitterName, lists: lists});
        } else {
          return false;
        };
      };
      return ListList.findOne({twitterName: twitterName}).lists;
    } else {
      return false;
    };
  };


  Template.hello.events({
    'click .refresh-friends-button' : function () {
      console.log('Refreshing lists');
      twitterName = Meteor.user().services.twitter.screenName;
      if (FriendList.findOne({twitterName: twitterName})) {
        friendListId = FriendList.findOne({twitterName: twitterName})._id
        friends = getFriends(twitterName);
        FriendList.update({_id: friendListId}, {userId: Meteor.userId(), twitterName: twitterName, friends: friends});
      }
    },
    'click .list-button' : function () {
      if(Meteor.user()) {
        twitterName = Meteor.user().services.twitter.screenName
        if (!ListList.findOne({twitterName: twitterName})) {
          lists = getLists(twitterName)
          if (lists) {
            ListList.insert({userId: Meteor.userId(), twitterName: twitterName, lists: lists});
          }
        };
      }
    } 
  });

} //end client

function getFriends (twitterName) {
  Meteor.call("FriendsList", twitterName, function(err,result) {
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

function getLists (twitterName) {
  Meteor.call("ListsList", twitterName, function(err,result) {
    if(!err) {
      console.log(result);
      lists = JSON.parse(result.content).lists;
      return lists;
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
      console.log('friendslist of ' + screenName + 'requested')
      if(Meteor.user()) {
        result = twitter.get('friends/list.json', {screen_name: screenName});
        return result;
      } else {
        console.log('not logged in')
        return false;
      };
    },
    ListsList: function (screenName) {
      console.log('lists of '+ screenName + ' requested')
      if(Meteor.user()) {
        result = twitter.get('lists/ownerships.json', {screen_name: screenName, count: 1000});
        return result;
      } else {
        console.log('not logged in')
        return false;
      };
    }
  });

}
