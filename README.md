# Names-directory
Module to separate directory names in the group
---
### Setup App

1. Setup environment: [Node.js v6.x.x+](https://nodejs.org)  
*Node.js comes complete with NPM*

2. Clone repo: `git clone https://github.com/egri4stk/Names-directory`

3. Install all dependencies: `npm install`
### Config App
Open `config.json`
1)  DB config:    (*Change these settings according to your MySQL database*)
    *  **dbName**  
    *  **dbPass**
    *  **dbHost**
    *  **dbUser**
    *  **tableName**
2) App config:
    *  **levelCountArray** - [count of 1-level separations, count of 2-level separations]
    *  **appMode** - application mode (*index of appModes array*) 
          *  use `0` to run main module
          *  use `1` to get all incorrect names 
          *  use `2` to get new sql script
    *  **pathToAnswer** - name of answer file      
    *  **writeFileStyle** - style of answer file
          *  `4` - The output file is formatted with indentation
          *  `0` - The output file is NOT formatted
### Run App

1) Chek your DB. The database must contain the following fields:
    *  **id**  INT(10)
    *  **surname**  VARCHAR(255)
    *  **name**  VARCHAR(255)
    
2) Run app `node app.js`
