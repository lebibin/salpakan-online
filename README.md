# Salpakan Online
The first ever(?) Online Browser-based Real-Time Multiplayer Port of the famous board game here in the Philippines, [Game of the Generals](http://en.wikipedia.org/wiki/Game_of_the_Generals).

This project was developed as an academic requirement for our Web Application Development course.

## Requirements
1. node.js
1. Browser (Chrome/Firefox)

## Objectives
The objective of the game is to eliminate or capture the flag of the opponent, or to maneuver one's flag to the other end of the board.

## Demo
### Local
1. Clone the repository
1. `cd` into the cloned repository and run `node server`
1. Visit `localhost:3000` on your browser
1. Enter any password and wait for opponent
1. Opponent should visit the server's ip address specifying 3000 as port i.e. `192.168.1.1:3000` and enter the password given by the player hosting the server
1. Enjoy the game!

### Online
1. Visit `http://salpakan-online.herokuapp.com/`
1. Enter a password and tell your friend this password
1. Have him/her visit the site and enter the same password
1. Enjoy the game!

### Credits
- [WebChess](https://github.com/benjaminfisher/Web-Chess)
- [socket.io](https://github.com/LearnBoost/socket.io)
- [node.js](https://github.com/joyent/node)
- [express](https://github.com/visionmedia/express)
- [Wikipedia](http://en.wikipedia.org/wiki/Game_of_the_Generals)
