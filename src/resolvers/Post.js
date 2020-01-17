import 'babel-polyfill';

const Post = {
    author: async (parent, args, ctx, info) => {
        const{client} = ctx;
        const db = client.db("blog");
        const collection = db.collection("users");

        return await collection.findOne({_id: parent.author});
    },
};

export {Post as default};