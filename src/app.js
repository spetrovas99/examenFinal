import {GraphQLServer, PubSub} from 'graphql-yoga'
import {MongoClient, ObjectID} from 'mongodb';
import 'babel-polyfill';
import Query from "./resolvers/Query.js"
import Mutation from "./resolvers/Mutation.js"
import User from "./resolvers/User.js"
import Post from "./resolvers/Post.js"
import Subscription from "./resolvers/Subscription.js"
  
const dbConnect = async ()=>{
    const uri = "mongodb+srv://stefani:contraseña@scluster-jlu1s.gcp.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    return client;
}

const startGraphql  = (client) => {
    const resolvers = { 
       Query,
       Mutation,
       User,
       Post,
       Subscription
    }
   const pubsub = new PubSub();
    const context = {client, pubsub};
    const server = new GraphQLServer({typeDefs : "./src/schema.graphql", resolvers, context});
    server.start(() => console.log("Server listening"));
}
const runApp = async() =>{
    const client = await dbConnect();
    try{
        console.log("Connect to Mongo DB");
        startGraphql(client);
    }catch(e){
        client.close();
        console.log(e);
    }
}

runApp();