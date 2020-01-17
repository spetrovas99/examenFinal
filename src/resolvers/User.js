import 'babel-polyfill';

const User = {
    posts: async (parent,args,ctx,info)=>{
        const{client} = ctx;
        const db = client.db("blog");
        const collection = db.collection("posts");

        const posts = parent.posts.map(async (elem) => {
            return await collection.findOne({_id: elem});
        });

        return posts;
    }
}
export{User as default};