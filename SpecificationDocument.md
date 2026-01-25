# Programming Fundamentals: Agricultural Microworlds 

**Introduction**  
Currently there are many children in rural areas of Kansas and other states that don’t have access to the software knowledge that is needed for the ever growing technology in agriculture. Agricultural microworld’s will use a simple block based coding system to control an agricultural simulation. This document will describe what capabilities the Agricultural Microworlds will have and is intended for current and future developers to read.

**Project Overview**  
The Agricultural Microworlds will be used by all grades K-12 as a software learning system with a focus in controlling an agricultural simulation to complete tasks. Lessons will be created, altered and assigned by teachers to students. The application is meant for all students, no matter the location, to be able to use. Many schools have different devices and internet capabilities and so the application must be extremely efficient. Alongside the technological differences, there is a wide variety of students with different capabilities. Therefore the application must be extremely adaptive and easy to use for those with disabilities.   
Modern agriculture is increasingly reliant on computerized systems, such as autonomous driving, navigation pathing for harvesting, and precision agriculture utilizing sensors and actuators. The Agricultural Microworlds application will have students autonomously control an agricultural simulation in order to complete a task. The simulation is controlled by code created by the student using Blockly coding blocks.

**Appendices**
* [Appendix A \- Frontend Simulation Diagram](./Diagrams/FrontendSimulationDiagram.png)

* [Appendix B \- Planned Database Diagram](./Diagrams/DatabaseDiagram.png)

**Technical Requirements**

* Should be deployed as a docker image with configurable:  
  * Specifiable port for reverse proxy  
  * CAS protocol parameters  
  * Database connection string  
* Should utilize a PostgreSQL database  
* Must store student personal identifying information (PII) and academic information securely  
* Must conform to FERPA requirements  
* Must conform to ADA requirements  
* Must scale to at least 1,000 users, and upwards of 10,000+  
* Must be able to run with school computer specs  
* Must include settings for application accessibility
  

**Nonfunctional Requirements**

* Documentation  
* Scalability  
* Responsiveness (\<5 seconds load time average)  
* Each display must conform to all accessibility requirements, including but not limited to:  
  * Proper labeling of all images and graphics  
  * Compatibility with screen readers  
  * Specified and logical tab order for controls  
  * Visual indications that are clear even for colorblindness  
  * Drag-and-drop elements of sufficient size for low dexterity  
  * Complete scalability for varying resolutions  
    

**Functional Requirements**

* Availability (99.99% average uptime)  
* Browser based (HTTPS)  
* Provide login capabilities / Update/Forgot password  
* Teachers control student dashboards  
* Provide interactable representation of processes  
* Reporting of student performance  
* Create and modify lesson plans  
* Store lessons/retrieve lessons  
* Reverse proxy to handle client requests

**User Interaction**

*Login Screen*

* Should allow user to select either teacher or student login  
* Selecting teacher login brings up screen to enter email and password which then sends a 2FA email to the teacher  
* Should bring up an input screen upon attempting to login if successful, which takes in six numbers which should only accept the matching 2FA number emailed to user  
* If an account is not found or the user information inputted was incorrect, the display should notify the user with “Incorrect username or password”, clear the password input box, and allow the user to attempt again  
* Should allow the user to select “Forgot password?” button which brings up process of resetting password  
* Selecting student login brings up screen to enter email and password which has the same functionality as the teacher login (2FA, incorrect input, reset password)   
* Below student login is a “Sign in with code” button which brings up a six digit input box for a one-time code either manually inputted by teacher or emailed to student

*Student Portal*

* Increase simplicity of accessibility, depending on grade level  
* Should allow user to select lesson card to bring them into simulation  
* Should allow user to view progress on current lesson and curriculum path  
* More advanced grade levels may show more advanced details of lesson and simulation when tracking progress such as “cash earned” or “efficiency rating”  
* Should allow user to log out of website

*K-5 Student Lessons*

* When a teacher assigns a class a lesson, logging in should display that lesson only, without the ability to go to another screen  
* Allow the student to continue to play around in the lesson after it’s been completed.  
* If a lesson is past its due date, the screen should display as such before exiting the program.  
* The blocks in the microworld should be far more restricted to what the current lesson requires


*6-8 Student Dashboard*

* Show all completed lessons for the curriculum  
* Provide quick links to access the currently assigned lessons  
* Show a point average for all completed assignments (if grades are not fully based on completion)  
* Lessons should display topics covered before beginning


*9-12 Student Dashboard*

* Display all information for completed lessons, as well as any future ones if the semester is planned out  
* Provide quick links to access the currently assigned lessons  
* Show a point average for all completed assignments (if grades are not fully based on completion)  
* Display total “cash” earned from lessons, as well as a graph of efficiency over the course of the lessons  
* Allow viewing and editing of custom code block chunks via the microworld

*Teacher Portal*

* If a teacher is apart of multiple classes they should be able to easily switch between all of their classes  
* Should be able to delete a class if no longer relevant to the teacher  
* Should be able to create lessons and preview them before publishing them to the class  
* Should be able to allow tracking of class progress, history and other useful metrics  
* Should be able to set settings for younger students and students with disabilities  
* Should be able to view an account information screen  
* Should be able to log out of website

*Adding a new class*

* Should have the ability to add a new class with the ability to select the grade that class targets along with the preferred name for the class  
* Ability to change the method for student login (sign in code/link/Email Password)

*Viewing students in a class*

* Should have the ability to view all students in a class and their associated grade  
* Should be able to search, filter, and select multiple students at once  
* Ability to add or remove a student after the class has been created

*Viewing all current lessons in a class curriculum*

* Ability to search for a specific lesson by name  
* Should be able to easily tell the difference in lessons with visible names and preview images  
* Should be able to assign a lesson to an entire class or individual student  
* Should be able to remove the lesson from the class curriculum  
* Should be able to preview the lessons as if the teacher was a student  
* Should be able to alter the requirements and assign the altered version

*Viewing and searching new lessons*

* Should be able to search from all the available lessons  
* Should be able to filter results by difficulty rating, recommended grade level  
* Should be able to sort results by most popular and least popular  
* Ability to add a lesson to a classes curriculum  
* Ability to assign a lesson to a student without adding it to the classes curriculum  
* Should be able to preview the lessons as if the teacher was a student

*Assigning Lessons*

* Should be able to alter lesson name, swap the selected simulation, which class to assign the lesson to, due date to complete, to notify the students (through email) or not, and the preview image of the lesson  
* Should be able to schedule the lesson to post on a specific date and time  
* Ability to save changes made as a lesson draft without assigning

*The Microworld*

* On left half of screen is a block library section where all the “unlocked” coding blocks are housed and are able to be dragged  
* To the right of the block library section is the coding playground where the blocks will be placed and connected together  
* On right side of screen is the simulation screen that will have the first frame of the simulation displayed with being greyed out to indicate that it is stopped  
* Should be able to move the layout of the screen  
* Should be able to run the blocks in the coding playground which affects the simulation screen  
* Should be able to stop simulation while running  
* Should be able to view the current lesson information  
* Should be able to unlock blocks depending on grade level  
* Should be able to save custom block templates which can be used at later points  
* Should be able to leave simulation with saved work in coding playground and saved lesson progress  
* It will provide the tools and functionality necessary to simulate agriculture growth rates/necessities

*First Simulation: Combine Harvester*

* Initial screen layout should be as follows  
  * A top down view of the combine harvester should start at the top right of the simulation area with the header facing west  
  * Background should initially start with crop tiles filling the area but be able to change into harvested dirt tiles  
  * Above the simulation area should be a “yield score” initially at zero.  
* Should be able to turn on/off header of harvester  
* Should be able to move harvester forwards or backwards  
* Should be able to turn harvester 360°  
* Should be able to collect crops for yield if header of harvester is on  
  * Driving on crop tiles with header on increases “yield score” and changes the background crop tile into a dirt tile  
  * Crops may be damaged upon certain conditions such as not turning on header and may count negatively towards yield score  
* Should be able to turn seeder on  
  * Driving on dirt tiles with seeder on turns into a seedling tile  
  * Harvesting seedling tiles counts negatively towards “yield score”  
* Should be able to stop simulation while running  
* Should be able to reset simulation to initial state  
* Upon reaching lesson completion condition, the simulation should stop and notify the user that the lesson is completed

*Coding Blocks*

* Blocks of different functionality should have different colors to easily show that difference  
* Blocks should have font big enough and clear enough to be read easily  
* Blocks should connect in a clear manner in order to tell how it is being executed

*Lessons*

* Upon starting a lesson, the display should bring up the microworld  
* It should give a brief lesson overview at the start of the objective  
* For lower grade levels, the microworld may walk through the steps with text prompts to complete the objective  
* For more advanced grade levels, the beginning overview and objective should be the only information given which can be reopened upon selecting current information button  
* Completion requirements may differ from lesson to lesson. Examples of completion requirements are completing all steps in lesson, writing the correct code block template, or reaching a certain tracked statistic  
* Should be able to display a finished screen upon completing a lesson  
* Should be able to bring up end-of-lesson quiz upon completing a lesson  
* Should clearly indicate which quiz questions are required and which are optional

*Lesson Designer*

* Upon selecting to create a new lesson, it should bring up a page to select simulation environment  
* Layout  
  * On left side of screen should be a sidebar of all created steps

**Semester Goals**

* Sprint 5 (Jan 26 \- Feb 7\)  
  * Achieve 90%+ test code coverage  
  * Improve inline documentation  
  * Improve Github wiki and add top level ReadMe  
* Sprint 6 (Feb 9 \- Feb 21\)  
  * Update soil simulation  
  * Update weather simulation  
  * Harvest collection management (if time allows, if not push to sprint 7\)  
* Sprint 7 (Feb 23 \- Mar 7\)  
  * Change what plants can be planted including what their requirements are to grow  
  * Add collection automation  
* Sprint 8   
  * Unplanned  
* Sprint 9  
  * Unplanned	  
* Sprint 10  
  * Unplanned  
* Sprint 11  
  * Unplanned  
* Backlog  
  * Student/teacher dashboards  
  * Lesson Planner  
  * Education software integration  
  * Database setup  
  * Block Conditions with live simulation data  

