# Welcome to the Harmonic Fullstack Jam! :D

Please familiarize yourself with the [read up](https://www.notion.so/harmonicai/Technical-Screening-Preparation-Full-Stack-f398a6d4ad0a439fbcfca5474625ac32?pvs=4) before continuing.

In this repo, you'll find 2 deployable services:

1. Backend - dockerized deployable that will spin up a Python backend with FastAPI, Postgres SQL DB and some seeded data.
2. Frontend - locally deployable app via Vite with TypeScript/React

Please refer to the individual READMEs in the respective repos to get started!

Enjoy :D

# Reflections ~ Maanas Peri

My approach to this project started off with watching tutorials on TypeScript, and SQLAlchemy, and having understood some of the syntax and drawing in parallel experience with React.js and NoSQL respectively, I started with trying to implement some basic functionality. Then I gradually expanded to meet all project requirements. I began by developing an individual "Like Company" feature, which provided a foundation for understanding the data flow between the frontend and backend. As the project evolved, I commented this function out and transitioned to a "Bulk Like" feature to accommodate the multi-select functionality in the UI and add multiple companies to the "Liked Companies" list and then eventually work my way to adding the entire set. 

Key Features Implemented:

1. Individual company liking
2. Bulk liking of selected companies
3. Adding all companies from one list to another
4. UI elements for selection and bulk actions
5. Loading status indicator for lengthy operations
6. Reset functionality for testing purpose

Assumptions and Tradeoffs:

1. Database Performance: I assumed the database could handle bulk insertions efficiently. This might need revisiting for extremely large datasets. Especially when I may/may not be performing some duplicate/redundant actions.
2. User Experience: I prioritized functionality over advanced UX features, assuming that basic feedback (like loading bars) would suffice for initial implementation.
3. Error Handling: Basic error logging was implemented, assuming detailed error handling could be enhanced in future iterations. This kind of refers to #1 but I believe I'd be able to get additional insight into the type of data structures I'm working with and how to optimize a few things.

Limitations and Areas for Improvement:

1. Redundant Batching: Initially, I implemented batching logic in the backend only, but I realized I needed to display a loading bar. In order to get the length of the number of items processed, I chose to make a quick fix to batch the list of companies again and send this list out to the backend where the list was unecessarily batched again. This was redundant and potentially inefficient. Ideally, this should be handled entirely on the backend for better performance and security, since we don't want to expose the company list in the frontend. If I had more time I'm confident that I can findx another way to find the status of processed companies and show the percentage.
2. API Design: I still kept a few of my old functionalities in case I wanted to revert some of the changes I was working on. This may be confusing to my teammates who may be working on the same feature as me, and need to get on the same page with me regarding what functions I'm using and what I'm not. I traded this off for better self-clarity because I'm working by myself for this current project.
3. I believe I would be able to dynamically show which companies were being added to the Liked List when the 'Like All Companies' button was being pressed. I traded this off for a simpler stack, because then I would have to find a way to start a WebSocket server along with starting the original docker-compose.
4. When I want the progress bar to stop batching (i.e. interrupting the process) I didn't think adding another button to stop the processing would be useful as it would clutter the UI view. Instead I opted to simply refresh the webpage to stop the batch processing. Then I can hit the reset() function to show the originally top 10 liked companies list.
5. Loading Status: The current implementation of the loading bar is basic. A more sophisticated real-time progress update system could enhance user experience.

Next Steps:

* Batching Optimization: Build an efficient batching process on the backend to handle large datasets more smoothly.
* Undo/Dislike Feature: Add functionality to let users remove companies from their liked list.
* SQL Query Optimization: Dive into the SQL queries and fine-tune them for better performance, especially with big data.
* Better Error Handling: Improve error handling across the app and make sure users get clear, helpful messages.
* Real-time Feedback: Implement WebSockets or server-sent events to give users live progress updates during long-running operations.
* Testing Suite: Create a solid set of unit and integration tests to ensure stability and make future updates easier.
* UX Improvements: Tweak the UI based on feedback, and consider adding features like sorting, filtering, or search for a better user experience.
