# Agricultural Microworld
Microworlds, such as the Code.org curriculum, introduce programming concepts in a heavily scaffolded and controlled way by presenting a split interface between a programming environment and a multimedia visualization of the “world” the student code interacts with. Modern agriculture is increasingly reliant on computerized systems, such as autonomous driving, navigation pathing for harvesting, and precision agriculture utilizing sensors and actuators. We will design an agricultural-centric microworld for K-12 students and educators to teach basic programming to novices, and also support more sophisticated functions to advanced students.

Please see the wiki for more information.

## Installation

Opening a codespace and running the dev container is necessary for this project in order to ensure you are programming in the correct environment.

First click the bright green code button above the repo code on github.

Go to the codespaces tab and click the + to create a new codespace on main.

It will take a long time to build as it downloads an image of linux

It will most likely say that the codespace is running in recovery mode. This is expected behavior and it is just because the limited storage that github gives is full.

To get it to work run command ```sudo rm -rf /tmp/*``` this will clear the temporary cache.

Then do ```CTRL + SHIFT + P``` and type ```rebuild container command here```

You'll be asked if you want to Rebuild or Full Rebuild, choose Rebuild (if you choose Full rebuild it will take a long time to build the dev container again)

After you've done all that and the top of the terminal doesn't say ```Running in Recovery Mode``` you are good to continue

Now that you have the Dev Container up and running we can proceed to run the application

If the terminal is not already open, open it by doing ```CTRL + SHIFT + J```

Next in the terminal run ```cd client directory here```

Now you can run ```npm run build```

After that finishes run ```npm run dev```, this should open a new tab where the application is being hosted, if not the console will give you a link to where the website is being hosted click on that

Now you have gotten Agricultrual Microworld running! See the User Guide (add user guide page link) for how to use the application.

## User Guide

## How to Contribute

