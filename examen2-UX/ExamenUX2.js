const express = require('express');
const path = require('path'); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const { initializeApp } =require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyDRDDTgqnGrT4CTAgtz5h-XWHgcNvieAk8",
    authDomain: "examen2-ux-8365a.firebaseapp.com",
    projectId: "examen2-ux-8365a",
    storageBucket: "examen2-ux-8365a.appspot.com",
    messagingSenderId: "761532364746",
    appId: "1:761532364746:web:d716550cb429c75d028133",
    measurementId: "G-WW5960BY24"
};

const uri = "mongodb+srv://jeavisai:EBQMyFUdc1brLbV9@examen2ux.qnlbkvk.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

const app = express();
const firebaseApp = initializeApp(firebaseConfig);
app.use(bodyParser.json());

const port = 3001;

app.get('/', (req, res) => {
  res.send('¡Examen 2 de Experiencia de Usuario!');
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);


app.post("/createUser",  (req, res) => {
    const auth = getAuth(firebaseApp);
    const email = req.body.email;
    const password = req.body.password;
    createUserWithEmailAndPassword(auth, email, password)
      .then((resp) => {
          res.status(200).send({
          msg: "Usuario creado exitosamente",
          data: resp,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        res.status(500).send({
          msg: "Error al crear el usuario",
          errorCode: errorCode,
          errorMsg: errorMessage,
        }); 
    });
  })
  
app.post("/logIn",  (req, res) => {
    try {
      const auth = getAuth(firebaseApp);
      const email = req.body.email;
      const password = req.body.password;
      signInWithEmailAndPassword(auth, email, password)
        .then((resp) => {
            res.status(200).send({
            msg: "Sesion iniciada",
            data: resp,
          })
      })
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          res.status(500).send({
            msg: "Error al iniciar sesion, credenciales incorrectas", 
            errorCode: errorCode,
            errorMsg: errorMessage,
          });
    });
    } catch (error) {
      const errorCode = error.code;
        const errorMessage = error.message;
        res.status(500).send({
          msg: "Error al iniciar sesion, credenciales incorrectas", 
          errorCode: errorCode,
          errorMsg: errorMessage,
        });
    }
  });
  
app.post("/logOut",  (res) => {
    const auth = getAuth(firebaseApp);
    signOut(auth).then(() => {
      console.log('Se cerro bien la sesion');
    }).catch((error) => {
      console.log('Hubo un error');
    });
  });


  app.post('/createPost',async (req,res)=>{
    console.log('Recibi una peticion - post');
    try {
      const client = new MongoClient(uri);
      const database = client.db("Examen2UX");
      const Posts = database.collection("Posts");
      const doc = req.body;
      const result = await Posts.insertOne(doc);
      console.log(`El resultado fue:  ${result}`);
      console.log(`El id del post que se creo es : ${result.insertedId}`);
      res.status(200).send("El post se creo exitosamente")
    }catch(error){
      res.status(500).send("No se creo el post, algo salio mal")
    } finally {
      await client.close();
    }
    
} )

app.get('/listPosts', async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const database = client.db("Examen2UX");
    const Posts = database.collection("Posts");

    const posts = await Posts.find({}).toArray();
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("No se pudieron obtener los posts");
  } finally {
    await client.close();
  }
});

  app.put('/editPost/:postID', async (req, res) => {
    const uri = "mongodb+srv://jeavisai:EBQMyFUdc1brLbV9@examen2ux.qnlbkvk.mongodb.net/?retryWrites=true&w=majority";
  
    try {
      const client = new MongoClient(uri);
      await client.connect();
  
      const database = client.db("Examen2UX");
      const Posts = database.collection("Posts");
  
      const postID = req.params.postID;
      const filter = { _id: new ObjectId(postID) }; // Sin 'new' aquí
      const updateDoc = {
        $set: {
          ...req.body,
        },
      };
      const options = { upsert: true };
  
      const result = await Posts.updateOne(filter, updateDoc, options);
      
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
      );
  
      res.status(200).send("Se actualizó la información correctamente");
    } catch (error) {
      console.error(error);
      res.status(500).send("No se pudo actualizar la información");
    } finally {
      await client.close();
    }
  });

app.delete('/deletePost/:postID', async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const database = client.db("Examen2UX");
    const Posts = database.collection("Posts");

    const postID = req.params.postID;
    const filter = { _id: new ObjectId(postID) };

    const result = await Posts.deleteOne(filter);
    
    console.log(`${result.deletedCount} document(s) deleted`);
    
    res.status(200).send("Se eliminó el post correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).send("No se pudo eliminar el post");
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

