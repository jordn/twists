FriendList = new Meteor.Collection("friendlist");
ListList = new Meteor.Collection("listlist");
ListMembers = new Meteor.Collection("listmembers");

if (Meteor.isClient) {

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
        $lists = $(this).find(".belongs-to").first();
        $draggable = ui.draggable;
        if ($lists.find("." + $draggable.data('list')).length == 0) {
          $lists.append($("<li></li>").append($draggable.clone()));
        }
      }
    });
  };

  Template.users.friends = function () {
    if(Meteor.user()) {
      twitterName = Meteor.user().services.twitter.screenName
      if (!FriendList.findOne({twitterName: twitterName})) {
        Meteor.call("FriendsList", twitterName, function(err,result) {
          if(!err) {
            console.log('no error friends list');
            friends = JSON.parse(result.content).users;
            friends = friends.map(function(friend){
              friend["profile_image_url"] = friend["profile_image_url"].replace("_normal", "_bigger");
              return friend;
            });
            FriendList.insert({userId: Meteor.userId(), twitterName: twitterName, friends: friends});
          } else {
            console.log(err);
            return false;
          }
        });
      };
      return FriendList.findOne({twitterName: twitterName}).friends;
    } else {
      console.log('not logged in')
      return false;
    };
  };

  Template.lists.lists = function () {
    if(Meteor.user()) {
      twitterName = Meteor.user().services.twitter.screenName
      if (!ListList.findOne({twitterName: twitterName})) {
        Meteor.call("ListsList", twitterName, function(err,result) {
          if(!err) {
            console.log('NO error list');
            lists = JSON.parse(result.content).lists;
            ListList.insert({userId: Meteor.userId(), twitterName: twitterName, lists: lists});
            for (var i = lists.length - 1; i >= 0; i--) {
              console.log("LIST ID:" + lists[i].id)
              Meteor.call("ListMembers", lists[i].id, function(err,result) {
                if(!err) {
                  console.log('no error list members');
                  listMembers = result;
                  console.log(result)
                  ListMembers.insert({userId: Meteor.userId(), twitterName: twitterName, listId: lists[i].id, listMembers: listMembers});
                } else {
                  console.log(err);
                  return false;
                };
              });
            };
            return lists;
          } else {
            console.log(err);
          }
        });
      };
      return ListList.findOne({twitterName: twitterName}).lists;
    } else {
      return false;
    };
  };

  Template.lists.rendered = function () {
    function get_random_color() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
      }
      return color;
    }
    _.each(ListList.findOne({twitterName: twitterName}).lists, function(list){
      $("." + list["slug"]).css("background-color", get_random_color());
    });
  }



  Template.app.events({
    'click .refresh-friends-button' : function () {
      console.log('Refreshing lists');
      twitterName = Meteor.user().services.twitter.screenName;
      if (FriendList.findOne({twitterName: twitterName})) {
        friendListId = FriendList.findOne({twitterName: twitterName})._id
        Meteor.call("FriendsList", twitterName, function(err,result) {
          if(!err) {
            console.log('no error friends list');
            friends = JSON.parse(result.content).users;
            FriendList.update({_id: friendListId}, {userId: Meteor.userId(), twitterName: twitterName, friends: friends});
          } else {
            console.log(err);
          }
        });
      }
    },
    'click .lists-button' : function () {
      if(Meteor.user()) {
        twitterName = Meteor.user().services.twitter.screenName
        if (!ListList.findOne({twitterName: twitterName})) {
          Meteor.call("ListsList", twitterName, function(err,result) {
            if(!err) {
              console.log('NO error list');
              lists = JSON.parse(result.content).lists;
              ListList.insert({userId: Meteor.userId(), twitterName: twitterName, lists: lists});
            } else {
              console.log(err);
            }
          });
        };
      }
    } 
  });

} //end client

function getLists (twitterName) {
  Meteor.call("ListsList", twitterName, function(err,result) {
    if(!err) {
      console.log('NO error list');
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
    },
    ListMembers: function (list_id) {
      console.log('members of '+ list_id + ' requested')
      if(Meteor.user()) {
        result = twitter.get('lists/members.json', {list_id: list_id});
        return result;
      } else {
        console.log('not logged in')
        return false;
      };
    },
    AddToList: function (list_id, user_id) {
      console.log(user_id +'Add to '+ list_id + ' requested');
      if(Meteor.user()) {
        result = twitter.post('lists/members/create.json', {list_id: list_id, user_id: user_id});
        return result;
      } else {
        console.log('not logged in')
        return false;
      };
    },


  });

}
