import 'babel-polyfill';
import uuid from "uuid";

const Mutation = {
    register: async(parent,args,ctx,info)=>{
        const {client} = ctx;
        const {password,mail,author} = args;
        
        const db = client.db("blog");
        const collection = db.collection("users");

        const user ={
            password,
            mail,
            token: "",
            posts: [],
            author,
        }

        if(await collection.findOne({mail})){
            throw new Error("mail is taken");
        }
        return (await collection.insertOne(user)).ops[0];
    },
    login: async(parent,args,ctx,info)=>{
        const {client} = ctx;
        const {mail,password} = args;
        
        const db = client.db("blog");
        const collection = db.collection("users");
        const result = await collection.findOneAndUpdate({mail,password},{$set: {token: uuid.v4()}}, {returnOriginal: false});
        if (!result.value){
            throw new Error("there is no such combination of mail and password.");
        }

        //para que se cierre sesion despues de 30 min

        setTimeout( () => {
            collection.updateOne({_id: result.value._id}, {$set: {token: ""}});
        }, 60000);

        return result.value;
    },
    logout: async(parent,args,ctx,info)=>{
        const{client} = ctx;
        const{mail, token} = args;
        const db = client.db("blog");
        const collection = db.collection("users");

        const result = await collection.findOneAndUpdate({mail,token},{$set: {token: ""}}, {returnOriginal: false});

        if (!result.value){
            throw new Error("there is no such combination of mail and token.");
        }
        return result.value;
    },
    addPost: async(parent,args,ctx,info)=>{
        const{client, pubsub} = ctx;
        const{mail,title,description,token} = args;
        const db = client.db("blog");
        const collectionP = db.collection("posts");
        const collectionU = db.collection("users");
        //comprobamos si esta logueado y si es un autor.
        const user = await collectionU.findOne({mail,token, author : true});

        if (!user){
            throw new Error("not logged or not author.");
        }

        const post ={
            author: user._id,
            description,
            title,
        }
        const result = await collectionP.insertOne(post)

        await collectionU.findOneAndUpdate({_id: user._id}, {$set: {posts: [...user.posts, result.ops[0]._id]}});

        pubsub.publish(user._id, {follow: `${user.mail} has publish a new post.`});

        return result.ops[0];
    },
    deletePost: async(parent,args,ctx,info)=>{
        const{client} = ctx;
        const{mail, token, _id} = args;
        const db = client.db("blog");
        const collectionP = db.collection("posts");
        const collectionU = db.collection("users");

        const user = await collectionU.findOne({mail,token, author : true});
        if (!user){
            throw new Error("not logged or not author.");
        }
        if(!recipeData.some(obj => obj.title === args.title)){
            throw new Error (`Recipe with title ${args.title} does not exist`);
        }
       
        //eliminamos el post
        const result = await collectionP.findOneAndDelete({_id, author: user._id});
        if(!result){
            throw new Error("Post not found.")
        }

        user.posts = user.posts.filter(obj => obj != _id);

        await collectionU.findOneAndUpdate({mail, token}, {$set: {posts: user.posts}});
        return result;
    },
    deleteUser: async(arent,args,ctx,info)=>{
        const{client} = ctx;
        const{mail, token } = args;
        const db = client.db("blog");
        const collectionP = db.collection("posts");
        const collectionU = db.collection("users");

        const user = await collectionU.findOneAndDelete({mail,token});
        if (!user){
            throw new Error("there is no such combination of username and token.");
        }
        await collectionP.deleteMany({author: user._id});
        return user;
    }
}
export {Mutation as default};


