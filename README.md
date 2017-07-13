# Home Pi

Home Automation with Raspberry Pi and Node Js

See [platform support](http://johnny-five.io/platform-support/)

## Getting Started

```bash
$ git clone https://github.com/AlexisLeon/HomePi.git
$ cd HomePi
$ yarn install
$ yarn start
```

### Prerequisites

**[Node JS](https://nodejs.org)**

  ```bash
  curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
  sudo apt-get update && sudo apt-get install nodejs
  ```

**[MongoDB](https://www.mongodb.org/downloads)**

  ```bash
  sudo apt-get install mongodb
  sudo systemctl start mongodb
  ```

**[Yarn](https://yarnpkg.com)**

  ```bash
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  sudo apt-get update && sudo apt-get install yarn
  ```

### Installing

Clone project and install modules
```bash
git clone https://github.com/AlexisLeon/HomePi.git
cd HomePi
yarn install
```

To use as binary `homepi` do follows:

```
npm link
```

Connect your board and start the server

```
$ homepi
Database connection stabilised
WAITING FOR BOARD...

  ┌────────────────────────────────┐  
  │  Running at 192.168.1.64:8080  │  
  └────────────────────────────────┘  

1499908741596 Board Looking for connected device
...
```

Open [http://localhost:8080](http://localhost:8080)

## Running the tests

```
yarn test
```

## Built With

* [Johnny-Five](http://johnny-five.io) - Microcontrollers
* [Socket.io](http://socket.io) - WebSocket server

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/AlexisLeon/HomePi/tags).

## Authors

* **[Alexis Leon](https://github.com/AlexisLeon)**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
