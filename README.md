RadioTAG radio
===

A simple radio supporting RadioTAG using the PiFace control and display.

Setup
---

You will need:
 - a PiFace control and display
 - a Raspberry Pi with the Radiodan software

### Get PiFace working on the Pi

1. Enable SPI

Commenting out the `blacklist spi-bcm2708` line in `/etc/modprobe.d/raspi-blacklist.conf`.

The /dev/spidev* devices should now appear but they require special privileges for the user pi to access them. You can set these up by adding the following udev rule to `/etc/udev/rules.d/50-spi.rules`:

    KERNEL=="spidev*", GROUP="spi", MODE="0660"

Then create the spi group and add the user pi:

$ groupadd spi
$ gpasswd -a pi spi

2. sudo apt-get install python-pifacecad

3. Stop radiodan-magic and radiodan-example from running

### Install app and dependencies

    $ git clone <this-repo> radiotag-radio
    $ cd radiotag-radio
    $ npm install

Running
---

There are two parts:

- `piface-socket` a small Python script that displays things on the PiFace and listens for button presses.
- `radio` a node.js app that plays radio streams and does tagging

The two parts communicate over a unix socket which you specify as an argument when starting them.

Start `piface-socket` first:

    $ bin/piface-socket /tmp/piface.sock

Start the radio next. It required TAG_SERVICE_URL and BBC_SERVICES_URL environment variables

    $ TAG_SERVICE_URL=http://tag.service.example.com BBC_SERVICES_URL=https://bbc-services-api.herokuapp.com bin/radio /tmp/piface.sock

Development
---

When not running on a Pi, you can launch a fake PiFace web UI. Start `piface-socket` with the `DEBUG` variable:

    $ DEBUG=true bin/piface-socket /tmp/piface.sock

The web UI will be available at http://localhost:4000/static/index.html. Load it to see text to be displayed on the PiFace and to press buttons.