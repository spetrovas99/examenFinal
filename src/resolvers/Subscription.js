import 'babel-polyfill';
const Subscription ={
    follow:{
        subscribe:async(parent,args,ctx,info)=>{
            const{pubsub, client} = ctx;
            const{mail,token,_id}= args;

            const db = client.db("blog");
            const collection = db.collection("users");

            const result = await collection.findOne({mail,token});

            if (!result){
                throw new Error("there is no such combination of username and token.");
            }

            return pubsub.asyncIterator(_id);
        }
    }
}

export {Subscription as default};