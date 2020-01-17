import 'babel-polyfill';
import {ObjectID} from 'mongodb';
const Query ={
    
   
    searchUser: async(parent,args,ctx,info)=>{
        const {client} = ctx;
        const {mail,token,_id} = args;

        const db = client.db("blog");
        const collectionU = db.collection("users");
        const collectionP = db.collection("post");
       // compruebo si estoy logueado.
        const user = await collectionU.findOne({mail,token});

        if (!user){
            throw new Error("there is no such combination of username and token.");
        }
        let posts = [];
        posts = posts.concat((await collectionP.find({_id})).toArray());

        return posts.value;
    },
    searchAllPost:async (parent,args,ctx,info)=>{
        const {client}= ctx;
        const {mail, token, } = args;
        const db = client.db("blog");
        const collectionU = db.collection("users");
        const collectionP = db.collection("posts");

        const user = await collectionU.findOne({mail,token});

        if (!user){
            throw new Error("not loggued.");
        }
        return (await collectionP.find({})).toArray();
    },
    searchPost: async (parent,args,ctx,info)=>{
        const {client}= ctx;
        const {mail, token, _id} = args;
        const db = client.db("blog");
        const collectionU = db.collection("users");
        const collectionP = db.collection("posts");

        const user = await collectionU.findOne({mail,token});

        if (!user){
            throw new Error("there is no such combination of username and token.");
        }

        return( await collectionP.findOne({_id: ObjectID(_id)}));
    }

}
export {Query as default};