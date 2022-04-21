# user-management-exercise
Starter React project for the User Management Page interview coding exercise

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### Coding Exercise: User Management

For this challenge you will create a simple user management page in React. The page allows administrators to create users, modify user access, and delete users. It is similar to an existing page on Scalyr which our customers use to manage their accounts.

You should use the same practices implementing this challenge as you would for any professional code you write. You will be provided with access to a GitHub repository of a basic project created with Create React App and including a mock backend, which you should fork to develop your project.

Please come prepared with a development laptop for completing this task. If you would prefer to have us provide a laptop, please let us know ahead of time. You will have access to the internet while on site.

The following sections outline the different components of the web application:

### The Data Model

Each user account has an email address and access level associated with it. A user account is created when an administrator invites the user to join the service. The account has a state that indicates whether the user has accepted the invite.

To summarize, a user account will have the following information:

- Email address
- Access level: “full”, “limited”, or “read-only”
- State: “active” or “invited”

### The Backend

The provided backend will be responsible for storing user account information. It exposes the following methods:

- Retrieve a list of users
- Invite users
- Revoke a user’s access
- Resend a user’s invite

When a user is added, their state is ‘invited’.

### The User Interface

The user management page lists all known users and provides ways to manipulate them. The user list should display the following properties for each user:

- State (“active” or “invited”)
- Email address
- Access level
- Action buttons (“Resend Invite” and “Revoke Invite”, or just “Revoke Access”)

The user management page allows the administrator to invite new users. To invite new users, the administrator will need to provide the following:

- One or more email addresses
- Access level (applied to all user accounts being created)

The user management page allows the administrator to perform the following operations on the existing users depending on their current state:

- Revoke
    - Revoke access completely by removing the user.
    - Enabled for all users
- Resend Invite
    - Resend the invitation
    - Enabled for users in the “invited” state

Below is a picture of a sample solution. It is meant to be used as an illustration. You are free to modify it as you deem fit.
![](src/images/user_account_exercise_example.png)