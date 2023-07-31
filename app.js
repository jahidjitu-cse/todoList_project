const express = require("express");
const bodyParser = require("body-parser");
const moongoose = require("mongoose");
const _=require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

moongoose.connect("mongodb+srv://jahid_jitu:jahid123@cluster0.q5wvmah.mongodb.net/todoListDB", { useNewUrlParser: true });
const itemSchema = {
   name: String
};

const Item = moongoose.model("item", itemSchema);

const Item1 = new Item({
   name: "Welcome to your todp list"
});

const Item2 = new Item({
   name: "Hit the + button to add an item"
});
const Item3 = new Item({
   name: "<-- Hit this to delete an item"
});


const defaultItems = [Item1, Item2, Item3];

const listSchema = {
   name: String,
   items: [itemSchema]
};

const List = moongoose.model("List", listSchema);


app.get("/", function (req, res) {
   Item.find({}).then(function (foundItems) {
      if (foundItems.length === 0) {
         Item.insertMany(defaultItems).then(function () {
            console.log("Data inserted to db")
         }).catch(function (error) {
            console.log(error)
         });
         res.redirect("/")
      }
      else {
         res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
   });


});
app.get("/:customListName", function (req, res) {
   const customListName =_.capitalize(req.params.customListName);

   List.findOne({ name: customListName }).
      then(function (foundList) {
         if (!foundList) {
            const list = new List({
               name: customListName,
               items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
         }
         else {
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
         }
      });
});


app.post("/", function (req, res) {
   let itemName = req.body.newItem;
   let listName = req.body.list;

   const item = new Item({
      name: itemName
   });

   if (listName === "Today") {
      item.save();
      res.redirect("/");
   } else {
      List.findOne({ name: listName }).
         then(function (foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
         }).catch(function (error) {
            console.log(error);
         });
   }


});
app.post("/delete", async function (req, res) {
   let itemId = req.body.checkbox;
   let listName=req.body.listName;

   if (listName==="Today") {
   await Item.findByIdAndDelete(itemId);
   res.redirect("/");
   } else {
     await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}}).
      then(function (foundList) {
         res.redirect("/"+listName);
      }).catch(function (error) {
         console.log(error);
      });
   }

});

app.get("/about", function (req, res) {
   res.render("about");
});


app.listen(3000, function () {
   console.log("the app is running on port 3000");
});
