// Require all the Libraries
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// App configuration
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ansh:ABCD1234@cluster0.qd9fhxy.mongodb.net/todolistDB", {useNewUrlParser: true});

// Schema 1
const itemsSchema = {
  name: String
};

const Task = mongoose.model("Item", itemsSchema);


const item1 = new Task({
  name: "Udemy Course"
});


const defaultItems = [item1];

// Schema 2
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Routes
app.get("/", function(req, res) {

  Task.find({}, function(err, found){

    if (found.length === 0) {
      Task.insertMany(defaultItems, function(err){
        if (!err) {
            console.log("Successfully savevd default items to DB.");
        } 
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newList: found});
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, found){
    if (!err){
      if (!found){
        // if no item found, then new list
        const list = new List({
          name: customListName,
          items: []
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // There is a list, show an existing list
        res.render("list", {listTitle: found.name, newList: found.items});
      }
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Task({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const deleteItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Task.findByIdAndRemove(deleteItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItemId}}}, function(err, found){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
