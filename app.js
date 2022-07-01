require('dotenv').config();
const express =  require('express');
const bodyParser = require('body-parser');
// const date =  require(__dirname + '/date.js')
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect(`mongodb+srv://admin-edison:${process.env.ATLAS_PASSWORD}@cluster0.upe8k.mongodb.net/todoListDB`, { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    name: "Add items using the + button below"
})
const item2 = new Item({
    name: "<--- Delete items with this"
})
const item3 = new Item({
    name: "Have a go!"
})

const defaultItems = [item1, item2, item3];

app.get('/', (req, res) => {
    Item.find((err, items)=>{
        if(err){
            console.log(err);
        }else if(items.length === 0){
            // when there's no item in the database, insert  default items and render it
            Item.insertMany(defaultItems, function(err, result){
                if(err){
                    console.log(err);
                } else {
                    console.log("Successfully saved default items into DB!");
                }
            });
            Item.find((err, items)=>{
                if(err){
                    console.log(err);
                } else {
                    res.redirect("/")
                }
            })
        }else{
            // if there's items in the database, render items
            day = "Today";
            res.render('list', {listTitle: day, tasks: items});
        }
    })
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model('List', listSchema);


app.get('/:name', (req, res) => {
    const routeName = _.capitalize(req.params.name);
    
    List.findOne({name: routeName}, (err, foundList) => {
        if(!err){
            // if you dont find a document with the route name
            if(!foundList){
                // create a new document
                const list = new List({
                    name: routeName,
                    items: defaultItems
                })
            
                list.save();
                res.redirect(`/${routeName}`);
            }
            else{
                // show exisiting document
                res.render('list', {listTitle: foundList.name, tasks: foundList.items});
            }
        }
         
    })
})

app.post('/', (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.listTitle;
    // create a new document from the input
    const newItem = new Item({
        name: itemName,
    })
    // if you're on the home page, update the home page
    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    }
    else{
        // if you're on a custom page, update the custom page
        List.findOne({name: listName}, (err, foundList)=>{
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+listName);
        })
    }

});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (err) {
                console.log(err);
            }else {
                console.log("Successfully deleted checked item!");
            }
        })
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}, (err, foundList) => {
            if (!err) {
                res.redirect("/"+listName);
            }
        }); 
    }
    
})


app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port 3000")
})