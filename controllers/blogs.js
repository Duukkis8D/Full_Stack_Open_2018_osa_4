const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { _id: 1, username: 1, name: 1 });
    response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
    if (request.body.title === undefined) {
        return response.status(400).json({ error: 'title is missing' });
    } else if (request.body.author === undefined) {
        return response.status(400).json({ error: 'author is missing' });
    } else if (request.body.url === undefined) {
        return response.status(400).json({ error: 'url is missing' });
    } else if (request.body.likes === undefined) {
        return response.status(400).json({ error: 'likes is missing' });
    }

    const body = request.body;
    let firstUser = await User.find({});
    firstUser = firstUser[0];

    try {
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: firstUser._id
        });
        const savedBlog = await blog.save();

        firstUser.blogs = firstUser.blogs.concat(savedBlog._id);
        await firstUser.save();

        response.status(201).json(savedBlog);
    } catch (exception) {
        console.log(exception);
        response.status(500).json({ error: 'something went wrong' });
    }
});

blogsRouter.delete('/:id', async (request, response) => {
    try {
        await Blog.deleteOne({ _id: request.params.id });
        response.status(204).end();
    } catch (exception) {
        console.log(exception);
        response.status(400).send({ error: 'malformatted id' });
    }
});

module.exports = blogsRouter;
