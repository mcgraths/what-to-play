# What To Play

A simple web app for board gamers to help them plan their gaming nights and future game purchases. 

Add the BoardGameGeek usernames for all the people in your gaming group and it will create a unified and filterable collection of games. Filter based on games to play or buy (uses player's wishlists), number of players, and game play time.

**Demo:** https://mcgraths.github.io/what-to-play/

## To Install

`git clone https://github.com/mcgraths/what-to-play.git`

`cd what-to-play`

`npm install`

Then edit the `MEMBERS` variable in `app/app.js` with the proper BGG usernames:

```
/* Gaming Group Members */
const MEMBERS = [
	'player1',
	'player2'
];
```

## Configure Users

If you want to configure the demo app to use *your* gaming group of friends you can edit the URL like so:

`https://mcgraths.github.io/what-to-play/?members=username1|username2|username3`

Replacing username1/2/3/etc with the BGG usernames of your friends.