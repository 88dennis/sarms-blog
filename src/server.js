let express = require('express');
let bodyParser = require('body-parser')
const myModuleBlogSeed = require('./blogSeed'); //./blogSeed.js
import { MongoClient } from 'mongodb';
const app = express();
let PORT = 8000;
import path from 'path';


app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

//FAKE DATABASE FOR TESTING 
// const articlesInfo = {
//     'learn-react' : { upvotes: 0, comments :[], },
//     'learn-node' : { upvotes: 0, comments :[], },
//     'learn-mongo' : { upvotes: 0, comments :[], },
//     'learn-express' : { upvotes: 0, comments :[], },
// };

// app.get("/hello", (req, res) => {
//     console.log(req)
//     res.send("hello")
// });

// app.get("/hello/:name", (req, res) => {
//     console.log(req.params)
//     //name comes frome the one you declared after the colon
//     res.send("hello " + req.params.name)
// });

// // hello endpoint
// //use POSTMAN (body, raw, json) create a json file ther
// //USE POSTMAN TO SEND A JSON OBJECT AND HIT THIS ENDPOINT
// app.post("/hello", (req, res) => {
//     //OPEN POSTMAN click body->raw and type some json object {"name": "dennis" }
//     //the body parser will extract the json object from the request by using the req.body
//     console.log(req.body)
//     console.log(req.body.name)
//     res.send("hello " + req.body.name)
//     // res.send("hello "); 
// });



// ================
// seedBlogDb();
// ================

//THE WITHDB HAS A FUNCTION AS A PARAMETER; IT WILL TAKE A FUNCTION AS AN ARGUMENT
const withDB = async (operations, res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('my-blog');
        await  operations(db);
        client.close();
    } catch (error){
        res.status(500).json({ message: "ERRORRRRR", error });
    }
}

app.get("/api/articles/:name", async (req, res) => {
    
    //TESTING THE DB 
    // try {
    //     const articleName = req.params.name;
    //     const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
    //     const dbase = client.db('my-blog');
    //     const articleInfo = await dbase.collection('articles').findOne({name: articleName});
    //     console.log(articleInfo);
    //     res.status(200).json(articleInfo);
    //     client.close();
    // } catch (error) {
    //     res.status(500).json({message: 'Error connecting to the db ' + error});
    // }
   
    // CALLING THE WITHDB FUNCTION AND PASSING IN A FUNCTION (REFACTORED)
    withDB(async function(db){
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({ name: articleName })
        res.status(200).json(articleInfo);
    }, res)
      
})

app.post('/api/articles/:name/upvote', async (req, res) => {

    //STEP 1:
    //TESTING USING POSTMAN AND A JSON OBJECT(FAKE DATABASE) - NO DB YET
    // const articleName = req.params.name;
    // articlesInfo[articleName].upvotes +=1;
    // res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} votes`);

    //STEP 2: 
    //TESTING DB
    try {
        const articleName = req.params.name;
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
        const dbase = client.db('my-blog');
        //FINDING THE EXISTING DATA
        const articleInfo = await dbase.collection('articles').findOne({name: articleName});

        //UPDATING THE EXISTING DATA
        await dbase.collection('articles').updateOne({name: articleName }, {'$set' : {
            //REFERENCING THE PREVIOUS VALUE AND UPDATING IT
            upvotes :articleInfo.upvotes + 1,
        }
    });
        const updatedArticleInfo = await dbase.collection('articles').findOne({name: articleName});
        // console.log(updatedArticleInfo);
        res.status(200).json(updatedArticleInfo);
        client.close();
    } catch (error) {
        res.status(500).json({message: 'Error connecting to the db ' + error});
    }

    //=====================================================
    // withDB(async function(db){
    //     const articleName = req.params.name;
    //     //FINDONE WILL GIVE AN OBJECT WITH A NAME ARTICLENAME WILL ALL ITS PROPERTIES
    //     //YOU CREATE THE ARTICLE INFO VARIABLE TO CREATE THIS OBJECT AS IT RETURNS TO YOU
    //     //YOU CAN NOW USE THIS VARIABLE TO ACCESS ITS PROPERTIES AND DO SOMETHING ABOUT THEM OR UPDATE THEM
    //     const articleInfo = await db.collection('articles').findOne({name: articleName});
    //     console.log(articleInfo)

    //     // NOW YOU GOT YOUR SPECIFIC OBJECT FROM DB TO SHOW
    //     // articleInfo = {
    //     //     _id: "",
    //     //     name: 'learn-react',
    //     //     upvotes: 2,
    //     //     comments:[]
    //     // }

    //     //UDATEONE
    //     //USING THE ARTICLE NAME AGAIN, YOU FIND THE OBJECT YOU NEED TO UPDATE
    //     //USE THE VARIABLE YOU CREATED FOR THIS OBJECT TO ACCESS ITS KEY AND CHANGE IT'S VALUE
    //     await db.collection('articles').updateOne({name: articleName}, {
    //         '$set':{
    //             upvotes: articleInfo.upvotes + 1
    //         }
    //     }, res);

    //     //STORE THE UPDATED ARTICLE IN A VARIABLE SO YOU CAN SHOW IT ACCORDINGLY
    //     const updatedArticleInfo = await db.collection('articles').findOne({name: articleName});
    //     //CONSOLELOG THE UPDATED OBJECT
    //     console.log(updatedArticleInfo);
    //     res.status(200).json(updatedArticleInfo);
    // })
    //=====================================================
})

app.post('/api/articles/:name/add-comment', async(req, res) => {

    // //STEP 1:
    // //TESTING USING POSTMAN AND A JSON OBJECT(FAKE DATABASE)
    // // const {username, text} = req.body;
    // const articleName = req.params.name;
    // //add the object the comments array
    // // articlesInfo[articleName].comments.push({username, text});
    // articlesInfo[articleName].comments.push({"username" : req.body.username, "text" : req.body.text});
    // console.log(articlesInfo);
    // res.status(200).send(articlesInfo[articleName]);

    //========================================================
    withDB( async function(db){
    // const {username, text} = req.body;
    //===== CREATE A JSON POST AT POSTMAN TO TEST THIS ENDPOINT ==== 
    //catch the json using the req.body... install body-parser and use it
    //THIS CAME FROM POSTMAN body raw json -- A DUMMY POST BODY YOU CREATED the username and text; this usually comes from a form 
    const username = req.body.username;
    const text = req.body.text;
    const newComment = [{
        username: req.body.username,
        text: req.body.text
    }]
    console.log( username)
    console.log( text)
    //============================================= 

    //USE THE PARAMETER NAME TO LOOK FOR THE SAME IN YOUR DB
    //FINDONE OBJECT
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({name: articleName});

    //UPDATE ONE OBJECT
    await db.collection('articles').updateOne({name: articleName}, {
        '$set': {
            //THIS IF YOU WANT TO PREPEND
            comments: newComment.concat(articleInfo.comments)
            //THIS IF YOU WANT TO APPEND
            // comments: articleInfo.comments.concat(newComment),
        } 
    })

    const updatedArticleInfo = await db.collection('articles').findOne({name: articleName});
    console.log(updatedArticleInfo)
                 res.status(200).json(updatedArticleInfo);

    },res)
    //============================================================== 
});

//FOR SEEDING USING ROUTES
// app.get("/api/blog-seed", async function (req, res) {
//     // console.log("hello")
//     try {
//         const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
//         const db = client.db('my-blog');
//         await db.collection('articles').deleteMany({});
//        await db.collection('articles').insertMany(blogSeed);
//        db.collection('articles').find({}).toArray(function(err, result) {
//         if (err) throw err;
//         console.log(result);
//       });
//         res.status(200).send("deleted and added")
//         client.close();
//     } catch {
//         res.status(500).send("error", error);
//     }
// }); 


//FUNCTION FOR SEEDING
async function  seedBlogDb() {
    // console.log("hello")
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('my-blog');
        await db.collection('articles').deleteMany({});

        //USING THE MODULE EXPORTS AND REQUIRING IT.. the data comes from the blogSeed.js
       await db.collection('articles').insertMany(myModuleBlogSeed.blogSeed);

       //----------------------------------------------
       //HOW TO USE THE FIND ALL
       db.collection('articles').find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
      });
      //-----------------------------------------------
        // res.status(200).send("deleted and added")
        client.close();
    } catch {
        console.log("error")
        // res.status(500).send("error", error);
    }
}; 


//THIS APP.GET SHOULD BE IN THE END
app.get('*', function(req,res){
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(PORT, function () {
    console.log("Connected to PORT " + "http://localhost:" + PORT)
});